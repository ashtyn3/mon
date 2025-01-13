<script lang="ts">
	import { SpinLine } from 'svelte-loading-spinners';

	let { active = false } = $props();
</script>

{#if active}
	<div class="fixed z-20 flex h-screen w-full items-center justify-center bg-white bg-opacity-70">
		<SpinLine size="60" color="#1A1A2E" unit="px" duration="3s" />
	</div>
{/if}
