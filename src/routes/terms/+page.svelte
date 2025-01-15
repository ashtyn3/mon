<script>
	import Terms from './terms.svelte';

	import logo from '$lib/assets/transparent_logo.png';
</script>

<div class="grid items-center p-5 text-white">
	<div class="row-span-1">
		<img src={logo} class="h-14" />
	</div>
</div>
<div class="flex justify-center font-sans">
	<div class="w-[50%]">
		<Terms />
	</div>
</div>
