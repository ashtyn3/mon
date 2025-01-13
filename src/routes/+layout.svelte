<script>
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';

	import '../app.css';
	import { dev } from '$app/environment';
	import { mountVercelToolbar } from '@vercel/toolbar/vite';
	let { data, children } = $props();
	let { session, supabase } = $derived(data);

	if (dev) {
		onMount(() => mountVercelToolbar());
	}

	onMount(() => {
		const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => data.subscription.unsubscribe();
	});
</script>

{@render children()}
