<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    type Props = {
        letter: string;
        action?: string;
        function?: () => void;
        redirect?: string;
    }
    const { letter, function: actionFunction, redirect }: Props = $props();

    let fHeld = $state(false);
	let fFillProgress = $state(0);
	let fFillDuration = $state('1s');
	let fHoldTimer: ReturnType<typeof setTimeout> | undefined;
	let fDrainTimer: ReturnType<typeof setTimeout> | undefined;

	function onFKeyComplete() {
		fHeld = false;
		fDrainTimer = setTimeout(() => {
			fFillDuration = '0.4s';
			fFillProgress = 0;
		}, 250);

        if (actionFunction) {
            actionFunction();
        }
        if (redirect) {
            setTimeout(() => {
                window.location.href = redirect;
            }, 85);
        }
	}

	function startHold() {
		if (fHeld) return;
		clearTimeout(fDrainTimer);
		fHeld = true;
		fFillDuration = '1s';
		fFillProgress = 1;
		fHoldTimer = setTimeout(onFKeyComplete, 1000);
	}

	function stopHold() {
		if (!fHeld) return;
		clearTimeout(fHoldTimer);
		fHeld = false;
		fFillDuration = '0.4s';
		fFillProgress = 0;
	}

	function handleFKeyDown(e: KeyboardEvent) {
		if (e.key !== letter.toLocaleLowerCase() && e.key !== letter.toLocaleUpperCase()) return;
		startHold();
	}

	function handleFKeyUp(e: KeyboardEvent) {
		if (e.key !== letter.toLocaleLowerCase() && e.key !== letter.toLocaleUpperCase()) return;
		stopHold();
	}

    onMount(() => {
		if (browser) {
			window.addEventListener('keydown', handleFKeyDown);
			window.addEventListener('keyup', handleFKeyUp);
		}
	});

	onDestroy(() => {
		clearTimeout(fHoldTimer);
		clearTimeout(fDrainTimer);
		if (browser) {
			window.removeEventListener('keydown', handleFKeyDown);
			window.removeEventListener('keyup', handleFKeyUp);
		}
	});
</script>

<div class="f-key-wrap">
	<div
		class="f-key-btn"
		role="button"
		tabindex="0"
		aria-label="Hold to activate"
		onpointerdown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); startHold(); }}
		onpointerup={stopHold}
		onpointerleave={stopHold}
		onpointercancel={stopHold}
	>
		<div
			class="f-key-fill"
			style:transform="scaleY({fFillProgress})"
			style:transition="transform {fFillDuration} linear"
		></div>
		<div class="f-key-scanlines"></div>
		<span class="f-key-letter">{letter}</span>
	</div>
</div>

<style>
    /* .f-key-wrap {
		position: absolute;
		bottom: 1.5rem;
		left: 1.5rem;
		z-index: 10;
		user-select: none;
	} */

	.f-key-btn {
		width: 80px;
		height: 80px;
		background: transparent;
		border: 4px solid #00e5ff;
		border-radius: 6px;
		overflow: hidden;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		touch-action: none;
		-webkit-user-select: none;
		user-select: none;
	}

	.f-key-btn::before {
		content: '';
		position: absolute;
		top: -1px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 10px solid #00e5ff;
		z-index: 10;
	}

	.f-key-fill {
		position: absolute;
		inset: 0;
		background: rgba(130, 248, 255, 0.42);
		transform-origin: bottom center;
		z-index: 1;
		pointer-events: none;
	}

	.f-key-letter {
		font-family: 'VT323', monospace;
		font-size: 3rem;
		color: #00e5ff;
		position: relative;
		z-index: 2;
		line-height: 1;
		pointer-events: none;
	}
</style>