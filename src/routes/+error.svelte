<script lang="ts">
    import CodeFuck from "$lib/components/CodeFuck.svelte";
    import { page } from '$app/stores';
</script>

<svelte:head>
	<title>FF:06:B5</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link href="https://fonts.googleapis.com/css2?family=Momo+Trust+Display&display=swap" rel="stylesheet">
</svelte:head>

<CodeFuck />
<div class="error-container" style="min-height: 100svh; display: flex; align-items: center; justify-content: center; width: 100%;">
    <div class="hex-pattern absolute mt-[-120px] ml-[260px]"><img src="honeycomb2-light.png" alt=""></div>
	<h1 style="font-weight: 700; z-index: 30;">Oh fuck!</h1>
</div>
<div class="error-message"><p>[{$page.error?.message}]</p></div>

<style>
   .error-container {
        font-family: 'Momo Trust Display', sans-serif;
        color: #ffd300;
        font-size: 20vw;
   }
   .error-message {
        position: absolute;
        bottom: 1.5rem;
        right: 1.5rem;
        color: #ffd300;
        font-family: 'Momo Trust Display', sans-serif;
        font-size: 2rem;
   }
</style>