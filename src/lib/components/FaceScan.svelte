<script lang="ts">
    import { onMount } from 'svelte';

    // @mediapipe/tasks-vision is loaded dynamically so that a failure
    // (e.g. no WebGPU / SharedArrayBuffer on iOS Safari) does not crash
    // the module and take the whole page down with it.

    // --- Svelte 5 Runes ---
    let canvasElement = $state<HTMLCanvasElement>();
    let containerElement = $state<HTMLDivElement>();
    // Plain variable (not $state) so the requestAnimationFrame loop reads
    // the raw JS value directly — avoids Svelte 5 reactive-getter issues
    // in non-reactive (imperative) contexts.
    let mouseX = 0;
    let isReady = $state(false);
    let landmarks = $state<any[]>([]);

    const connectParticles = true; // Set to false to disable lines between particles

    // Effect: Handle mouse movement and touch events
    $effect(() => {
        const updatePosition = (clientX: number) => {
            if (containerElement) {
                const rect = containerElement.getBoundingClientRect();
                mouseX = clientX - rect.left;
            }
        };

        const updateMouse = (e: MouseEvent) => {
            updatePosition(e.clientX);
        };

        const updateTouch = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                updatePosition(e.touches[0].clientX);
            }
        };

        // Add mouse events
        window.addEventListener('mousemove', updateMouse);
    
        // iOS Safari (and all iOS browsers) suppress touchmove bubbling to
        // window when touch-action:none is set on body. document receives it.
        document.addEventListener('touchstart', updateTouch, { passive: true });
        document.addEventListener('touchmove', updateTouch, { passive: true });
    
    return () => {
            window.removeEventListener('mousemove', updateMouse);
            document.removeEventListener('touchstart', updateTouch);
            document.removeEventListener('touchmove', updateTouch);
        };
    });

    // Keep canvas internal resolution in sync with its display size
    $effect(() => {
        if (!canvasElement || !containerElement) return;

        const sync = () => {
            if (!canvasElement || !containerElement) return;
            canvasElement.width = containerElement.clientWidth;
            canvasElement.height = containerElement.clientHeight;
        };

        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(containerElement);
        return () => ro.disconnect();
    });


    onMount(async () => {
        // Start scanner at horizontal centre so the face is visible before any touch
        mouseX = window.innerWidth / 2;
        try {
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
            baseOptions: { 
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                delegate: "CPU" 
            },
            runningMode: "IMAGE"
        });

        const img = document.getElementById('face-target') as HTMLImageElement;
        // Wait for image to be fully loaded before running detection
        await new Promise<void>((resolve) => {
            if (img.complete && img.naturalWidth > 0) { resolve(); return; }
            img.onload = () => resolve();
            img.onerror = () => resolve(); // resolve anyway so we don't hang
        });
        const result = landmarker.detect(img);
        if (result.faceLandmarks) {
            landmarks = result.faceLandmarks[0];
            startAnimation();
        }
        } catch (e) {
            console.warn('FaceScan: MediaPipe failed to initialise (unsupported platform?)', e);
        }
    });

    function startAnimation() {
        const ctx = canvasElement?.getContext('2d');
        if (!ctx) return;
        const img = document.getElementById('face-target') as HTMLImageElement;

        function render() {
        if (!canvasElement) return;
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Convert mouse coordinates to canvas coordinate space
        const canvasMouseX = mouseX * (canvasElement.width / canvasElement.offsetWidth);

        // Always draw image in vertical strip centered on scanner line
        const isMobile = canvasElement.offsetWidth < 768;
        const stripPx = isMobile ? 200 : 450;
        const stripWidth = stripPx * (canvasElement.width / canvasElement.offsetWidth); // Scale strip width to canvas
        const stripLeft = canvasMouseX - stripWidth / 2;

        ctx.save();
        ctx.globalAlpha = 0.6;

        // Create gradient mask for soft edges
        const gradient = ctx.createLinearGradient(stripLeft, 0, stripLeft + stripWidth, 0);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');     // Transparent at left edge
        gradient.addColorStop(0.1, 'rgba(255,255,255,0.3)'); // Fade in 
        gradient.addColorStop(0.5, 'rgba(255,255,255,1)');   // Full opacity at center
        gradient.addColorStop(0.9, 'rgba(255,255,255,0.3)'); // Fade out
        gradient.addColorStop(1, 'rgba(255,255,255,0)');     // Transparent at right edge

        // Apply the gradient mask
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);
        ctx.globalCompositeOperation = 'source-in';

        // Calculate image dimensions to fill viewport (object-cover behavior)
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const canvasAspect = canvasElement.width / canvasElement.height;

        let drawWidth, drawHeight, drawX, drawY;
        if (imgAspect > canvasAspect) {
            // Image is wider - fill height, crop sides
            drawHeight = canvasElement.height;
            drawWidth = drawHeight * imgAspect;
            drawX = (canvasElement.width - drawWidth) / 2;
            drawY = 0;
        } else {
            // Image is taller - fill width, crop top/bottom
            drawWidth = canvasElement.width;
            drawHeight = drawWidth / imgAspect;
            drawX = 0;
            drawY = (canvasElement.height - drawHeight) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        // Dots and connecting lines — desktop only
        if (!isMobile) {
            const activeParticles: {x: number, y: number, opacity: number}[] = [];

            landmarks.forEach((pt) => {
                if (!canvasElement) return;
                const x = pt.x * canvasElement.width;
                const y = pt.y * canvasElement.height;
                const dist = Math.abs(x - canvasMouseX);
                const opacity = Math.max(0, 1 - dist / 350);
                if (opacity > 0) activeParticles.push({x, y, opacity});
            });

            activeParticles.forEach((particle, i) => {
                ctx.fillStyle = `rgba(255, 211, 0, 0.6)`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                if (i % 7 === 0 && activeParticles[i+1] && connectParticles) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = `rgba(255, 211, 0, ${particle.opacity * 0.6})`;
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(activeParticles[i+1].x, activeParticles[i+1].y);
                    ctx.stroke();
                }
            });
        }

            requestAnimationFrame(render);
        }
        render();
    }
</script>

<div class="relative w-full h-screen overflow-hidden" bind:this={containerElement}>
    <img 
        id="face-target" 
        src="/extreme_facial_closeup.png" 
        class="absolute inset-0 w-full h-full object-contain opacity-0 grayscale pointer-events-none" 
        alt="Target"
    />

    <canvas 
        bind:this={canvasElement} 
        class="absolute inset-0 w-full h-full pointer-events-none z-10"
    ></canvas>
</div>