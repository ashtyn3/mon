<script lang="ts">
	import text from '$lib/assets/chill-brand.svg';
	import logo from '$lib/assets/Logo.png';
	import trans_logo from '$lib/assets/transparent_logo.png';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { formSchema } from './scheme';
	import { zodClient } from 'sveltekit-superforms/adapters';

	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import Load from '$lib/components/ui/load/load.svelte';
	let { data }: { data: PageData } = $props();
	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});
	const { form: formData, enhance, validateForm, message } = form;
	let val = $state('basic');
	let loading = $state(false);
</script>

<Load active={loading} />
<img src={trans_logo} class="absolute w-20 p-4 max-sm:hidden" />

<div class="grid h-screen sm:grid-cols-2">
	<div class="flex h-full w-full flex-col items-center justify-center">
		<img src={logo} class="w-[35%] p-3 sm:hidden" />
		<div class="flex flex-col gap-4 max-sm:w-[98%] sm:w-[60%]">
			<h1 class="text-4xl font-black italic max-sm:text-center">Welcome!</h1>
			<form use:enhance class="flex flex-col gap-3" method="POST">
				<Form.Field {form} name="email">
					<Form.Control>
						<Input bind:value={$formData.email} placeholder="Email" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="password">
					<Form.Control>
						<Input bind:value={$formData.password} placeholder="Password" type="password" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				{#if $message}
					<div class="message">{$message}</div>
				{/if}
				<Button
					type="button"
					onclick={async () => {
						const valid = await validateForm({ update: true });
						if (valid) {
							loading = true;
							const auth = await data.supabase.auth.signInWithPassword(valid.data);
							loading = false;
							if (!auth.error) {
								goto('/');
							}
							//form.errors.update((v) => {
							//	return {
							//		...v,
							//		email: valid.errors.email,
							//		password: valid.errors.password
							//	};
							//});
							form.message.set(auth.error.message);
						}
					}}>Submit</Button
				>
			</form>
		</div>
	</div>
	<div
		class="peat flex h-screen w-full items-center justify-center bg-gradient bg-cover bg-center p-10 max-sm:hidden"
	>
		<img src={text} />
	</div>
</div>
