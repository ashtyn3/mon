<script lang="ts">
	import type { PageData } from './$types';
	import * as Form from '$lib/components/ui/form/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { NonCompanySignUp } from './signInSchema';
	import Button from '$lib/components/ui/button/button.svelte';
	import { trpc } from '$lib/trpc/client';
	import Input from '$lib/components/ui/input/input.svelte';
	import logo from '$lib/assets/Logo.png';
	import text from '$lib/assets/chill-brand.svg';
	import { fromPermission, PermissionsFrom } from '$lib/permissions';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Load from '$lib/components/ui/load/load.svelte';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';

	let { data }: { data: PageData } = $props();

	data.form.data.company = data.company_id;
	const form = superForm(data.form, {
		validators: zodClient(NonCompanySignUp)
	});
	const { form: formData, enhance, validateForm, message } = form;
	let loading = $state(false);
	let privacy = $state(false);
</script>

<Load active={loading} />
<div class="grid h-screen sm:grid-cols-2">
	<div class="flex h-full w-full flex-col items-center justify-center">
		<img src={logo} class="w-[35%] p-3 sm:hidden" />
		<div class="flex flex-col gap-4 max-sm:w-[98%] sm:w-[60%]">
			<h1 class="text-center text-4xl font-black italic">
				Joining the {data.company} team!
			</h1>
			<form use:enhance class="flex flex-col gap-3" method="POST">
				<Form.Field {form} name="first_name">
					<Form.Control>
						<Input bind:value={$formData.first_name} placeholder="First name" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="last_name">
					<Form.Control>
						<Input bind:value={$formData.last_name} placeholder="Last name" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="email">
					<Form.Control>
						<Input bind:value={$formData.email} placeholder="Email" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="phone">
					<Form.Control>
						<Input bind:value={$formData.phone} placeholder="Phone number" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="password">
					<Form.Control>
						<Input bind:value={$formData.password} placeholder="Password" type="password" />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<div class="flex items-center gap-2">
					<Checkbox bind:checked={privacy} name="priv" />
					<Label for="priv"
						>Agree to <a href="/privacy" class="underline">privacy policy</a> and
						<a href="/terms" class="underline">terms of service.</a></Label
					>
				</div>
				{#if $message}
					<div class="message">{$message}</div>
				{/if}
				<Button
					type="button"
					onclick={async () => {
						const valid = await validateForm({ update: true });
						if (valid && privacy) {
							loading = true;
							let company = await trpc(data).add_user.mutate(valid.data);
							loading = false;
							if (!company.error) {
								goto('/');
							} else {
								message.set(company.error.code + ':' + company.error.message);
							}
						}
						if (!privacy) {
							message.set('You must agree to policies.');
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
