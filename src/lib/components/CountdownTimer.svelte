<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
    import FaceScan from '$lib/components/FaceScan.svelte';

	const TARGET = new Date(2077, 0, 1, 0, 0, 0, 0);

	type Parts = {
		years: number;
		months: number;
		weeks: number;
		days: number;
		hours: number;
		minutes: number;
		seconds: number;
	};

	function compute(): Parts {
		const now = new Date();
		if (now >= TARGET) {
			return { years: 0, months: 0, weeks: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
		}

		let cursor = new Date(now);

		let years = 0;
		{
			let next = new Date(cursor);
			next.setFullYear(next.getFullYear() + 1);
			while (next <= TARGET) {
				years++;
				cursor = next;
				next = new Date(cursor);
				next.setFullYear(next.getFullYear() + 1);
			}
		}

		let months = 0;
		{
			let next = new Date(cursor);
			next.setMonth(next.getMonth() + 1);
			while (next <= TARGET) {
				months++;
				cursor = next;
				next = new Date(cursor);
				next.setMonth(next.getMonth() + 1);
			}
		}

		const remainMs = TARGET.getTime() - cursor.getTime();
		const totalSecs = Math.floor(remainMs / 1000);
		const weeks = Math.floor(totalSecs / (7 * 24 * 3600));
		const days = Math.floor((totalSecs % (7 * 24 * 3600)) / (24 * 3600));
		const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
		const minutes = Math.floor((totalSecs % 3600) / 60);
		const seconds = totalSecs % 60;

		return { years, months, weeks, days, hours, minutes, seconds };
	}

	let cd = $state(compute());
	let timer: ReturnType<typeof setInterval>;

	// ── Glitch ────────────────────────────────────────────────────────────────

	type SliceColor = 'green' | 'red' | 'cyan';

	type GlitchSlice = {
		top: number;
		height: number;
		offsetX: number;
		color: SliceColor;
	};

	const BG_COLORS = ['#00ffff', '#ff00e6', '#ffffff', '#ff0030', '#000000', '#ffff00', '#ff06b5'];

	let glitchSlices = $state<GlitchSlice[]>([]);
	let glitchBg = $state<string | null>(null);
	let glitchActive = $state(false);
	let glitchTimer: ReturnType<typeof setInterval> | undefined;
	let prevSec = -1;

	function randomSlices(): GlitchSlice[] {
		const slices: GlitchSlice[] = [];
		let y = 0;
		while (y < 100) {
			const h = Math.min(Math.random() * 18 + 2, 100 - y);
			const r = Math.random();
			slices.push({
				top: y,
				height: h,
				offsetX: (Math.random() - 0.5) * 72,
				color: r < 0.12 ? 'red' : r < 0.25 ? 'cyan' : 'green'
			});
			y += h;
		}
		return slices;
	}

	function triggerGlitch() {
		if (glitchActive) return;
		glitchActive = true;

		const phases = 9;
		const intervalMs = 85;
		let phase = 0;

		glitchSlices = randomSlices();
		glitchBg = BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)];

		glitchTimer = setInterval(() => {
			phase++;
			glitchSlices = randomSlices();
			glitchBg =
				phase % 2 === 0 ? BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)] : null;

			if (phase >= phases) {
				clearInterval(glitchTimer);
				glitchActive = false;
				glitchSlices = [];
				glitchBg = null;
			}
		}, intervalMs);
	}

	$effect(() => {
		const s = cd.seconds;
		if (s === 0 && prevSec !== 0) triggerGlitch();
		prevSec = s;
	});

	// ─────────────────────────────────────────────────────────────────────────

	onMount(() => {
		timer = setInterval(() => {
			cd = compute();
		}, 1000);
	});

	onDestroy(() => {
		clearInterval(timer);
		clearInterval(glitchTimer);
	});

	const pad = (n: number) => String(n).padStart(2, '0');

	const segments = [
		{ key: 'years' as const, label: 'YRS' },
		{ key: 'months' as const, label: 'MOS' },
		{ key: 'weeks' as const, label: 'WKS' },
		{ key: 'days' as const, label: 'DYS' },
		{ key: 'hours' as const, label: 'HRS' },
		{ key: 'minutes' as const, label: 'MIN' },
		{ key: 'seconds' as const, label: 'SEC' }
	] as const;
</script>

{#snippet displayContent()}
	{#each segments as seg, i}
		{#if i > 0}<span class="sep" aria-hidden="true">:</span>{/if}
		<div class="unit">
			<span class="digits">{pad(cd[seg.key])}</span>
			<!-- <span class="lbl">{seg.label}</span> -->
		</div>
	{/each}
{/snippet}

<main style:background={glitchBg}>
    <div class="hex-pattern absolute mt-[-120px] ml-[260px]"><img src="honeycomb2-light.png" alt=""></div>
	<div class="face-scan-bg">
		<FaceScan />
	</div>
	<div class="bezel" class:glitching={glitchActive}>
		<p class="w-full text-left heading">FF:06:B5</p>
		<div class="screen">
			<div class="display">
				{@render displayContent()}
			</div>
		</div>
		<!-- <p class="target">01 JANUARY 2077</p> -->

		{#if glitchActive}
			{#each glitchSlices as slice}
				<div
					class="shard shard-{slice.color}"
					style="clip-path: inset({slice.top}% 0 {Math.max(0, 100 - slice.top - slice.height)}% 0); transform: translateX({slice.offsetX}px);"
				>
					<p class="w-full text-left heading">FF:06:B5</p>
					<div class="screen">
						<div class="display">
							{@render displayContent()}
						</div>
					</div>
				</div>
			{/each}
		{/if}
	</div>
    <div class="cyberpunk-logo"><img src="cyberpunk_logo.png" alt="Cyberpunk 2077"></div>
</main>
