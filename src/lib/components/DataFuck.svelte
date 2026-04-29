<script lang="ts">
  import { onMount } from 'svelte';
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';

  // Constants
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const SUB_LINE_COUNT = 7;

  // State (Runes)
  let mainLine = $state('');
  let subLines = $state<{ id: number; text: string }[]>([]);

  // Helper to generate random strings
  const genString = (len: number) => 
    Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');

  // Function to reset/refill the sub-lines
  const refillSubLines = () => {
    subLines = Array.from({ length: SUB_LINE_COUNT }, (_, i) => ({
      id: Date.now() + i, // Unique ID for animations
      text: genString(30)
    }));
  };

  $effect(() => {
    // 1. Rapidly update the Main Line
    const mainInterval = setInterval(() => {
      mainLine = genString(Math.floor(Math.random() * 33) + 32);
    }, 100);

    // 2. Rapidly update text content of existing Sub-Lines
    const subInterval = setInterval(() => {
      subLines = subLines.map(line => ({ ...line, text: genString(Math.floor(Math.random() * 25) + 24) }));
    }, 150);

    // 3. Handle the removal logic
    const cycleLogic = async () => {
      refillSubLines();
      
      // Wait a moment, then start removing lines one by one
      await new Promise(r => setTimeout(r, 2000));

      const removeInterval = setInterval(() => {
        if (subLines.length > 0) {
          subLines.shift(); // Svelte 5 tracks this mutation automatically
        } else {
          clearInterval(removeInterval);
          cycleLogic(); // Restart the loop
        }
      }, 1000);
    };

    cycleLogic();

    return () => {
      clearInterval(mainInterval);
      clearInterval(subInterval);
    };
  });
</script>

<div class="terminal-container">
  <div class="main-line">{mainLine}</div>
  
  <div class="sub-lines-wrapper">
    {#each subLines as line (line.id)}
      <div 
        animate:flip={{ duration: 400 }} 
        transition:fade={{ duration: 200 }}
        class="sub-line"
      >
        {line.text}
      </div>
    {/each}
  </div>
</div>

<style>
    .terminal-container {
        font-family: 'VT323', monospace;
        /* text-align: right; */
        position: absolute;
        /* right: 2rem; */
        background: none;
        color: #ffd300;
        opacity: 0.7;
        padding: 2rem;
        min-height: 300px;
        z-index: 40;
        display: none;
    }

    .main-line {
        /* font-weight: bold; */
        font-size: 1.2rem;
        /* margin-bottom: 1rem; */
        word-break: break-all;
    }
    .sub-line {
        font-size: 0.9rem;
        opacity: 0.7;
        /* margin-bottom: 0.2rem; */
    }

    @media (min-width: 380px) {
        .terminal-container {
            left: 0%;
            display: block;
            text-align: left;
        }
        .main-line {
            font-size: 0.7rem;
        }
        .sub-line {
            font-size: 0.5rem;
        }
    }
    @media (min-width: 1024px) {
        .terminal-container {
            display: block;
            text-align: right;
            right: 2rem;
        }
        .main-line {
            font-size: 1.2rem;
        }
        .sub-line {
            font-size: 0.9rem; 
        }
    }
</style>