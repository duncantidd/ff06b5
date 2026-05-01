<script lang="ts">
    import ActionKeys from "$lib/components/ActionKeys.svelte";

    function testFunction() {
        console.log("Test function called");
    }
</script>
<h1>Hello</h1>
<ActionKeys letter="X" function={testFunction} />