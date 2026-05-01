<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";

    interface Props {
        letter: string;
        action?: string;
        function?: () => void;
    }
    const { letter, action, function: actionFunction }: Props = $props();

    let fHeld = $state(false);
	let fFillProgress = $state(0);
	let fFillDuration = $state('2s');
	let fHoldTimer: ReturnType<typeof setTimeout> | undefined;
	let fDrainTimer: ReturnType<typeof setTimeout> | undefined;

	function onFKeyComplete() {
		fHeld = false;
		fDrainTimer = setTimeout(() => {
			fFillDuration = '0.4s';
			fFillProgress = 0;
		}, 250);
		// triggerGlitch();
        if (actionFunction) {
            actionFunction();
            return;
        }
		setTimeout(() => {
			window.location.href = '/cyberware';
		}, 9 * 85 + 200);
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