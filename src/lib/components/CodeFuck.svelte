<script lang="ts">
  import { flip } from 'svelte/animate';
  import { fade } from 'svelte/transition';
  import snippets from '$lib/code-snippets.json';

  let mainLine = $state('');
  let subLines = $state<{ id: number; text: string }[]>([]);

  const getRandomSnippet = () => snippets[Math.floor(Math.random() * snippets.length)];

  const refillSubLines = () => {
    subLines = Array.from({ length: 7 }, (_, i) => ({
      id: Math.random(), // Simple ID for demo
      text: getRandomSnippet()
    }));
  };

  $effect(() => {
    // 1. Rapidly update the Main Line
    const mainInterval = setInterval(() => {
      mainLine = getRandomSnippet();
    }, 100);

    // 2. Rapidly update text content of existing Sub-Lines
    const subInterval = setInterval(() => {
      subLines = subLines.map(line => ({ ...line, text: getRandomSnippet() }));
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

<!-- <div class="terminal-container">
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
</div> -->

<div class="terminal-container">
  <!-- This is our "glass" overlay -->
  <div class="crt-overlay"></div>
  
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
        font-family: monospace;
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

        /* overflow: hidden;
        text-shadow: 0 0 5px rgba(255, 211, 0, 0.5); */
    }

    /* .crt-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: repeating-linear-gradient(
            rgba(18, 16, 16, 0) 0px,
            rgba(18, 16, 16, 0) 1px,
            rgba(18, 16, 16, 0.1) 2px,
            rgba(18, 16, 16, 0.1) 3px
        );
        pointer-events: none;
        z-index: 50;
    } */

    /* The moving "refresh" bar */
    /* .crt-overlay::before {
        content: " ";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        background: linear-gradient(
            rgba(18, 16, 16, 0) 0%, 
            rgba(255, 211, 0, 0.03) 50%, 
            rgba(18, 16, 16, 0) 100%
        );
        opacity: 0.1;
        z-index: 51;
        pointer-events: none;
        animation: scanline 6s linear infinite;
    } */

/* Subtle Screen Flicker */
.terminal-container {
    animation: flicker 0.15s infinite;
}

@keyframes scanline {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
}

@keyframes flicker {
    0% { opacity: 0.68; }
    50% { opacity: 0.7; }
    100% { opacity: 0.69; }
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