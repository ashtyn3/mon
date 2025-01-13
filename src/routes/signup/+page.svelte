<script lang="ts">
	import text from '$lib/assets/chill-brand.svg';
	import logo from '$lib/assets/Logo.png';
	import trans_logo from '$lib/assets/transparent_logo.png';
	import * as Form from '$lib/components/ui/form/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { superForm } from 'sveltekit-superforms';
	import { formSchema, industry, states } from './scheme';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import * as Select from '$lib/components/ui/select/index.js';

	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import { goto } from '$app/navigation';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Label } from '$lib/components/ui/label';
	import { loadStripe } from '@stripe/stripe-js';
	import { PUBLIC_STRIPE_PUBLISHABLE_KEY } from '$env/static/public';
	import * as Dialog from '$lib/components/ui/dialog';
	import { generateMock } from '@anatine/zod-mock';
	import { faker } from '@faker-js/faker';
	import { stringToBase64URL } from '@supabase/ssr';
	import { SpinLine } from 'svelte-loading-spinners';
	import Load from '$lib/components/ui/load/load.svelte';
	let { data }: { data: PageData } = $props();
	data.form.data = generateMock(formSchema, {
		stringMap: {
			phone: () => faker.phone.number({ style: 'national' }),
			address_1: faker.location.streetAddress,
			address_2: faker.location.buildingNumber,
			zipcode: faker.location.zipCode
		}
	});
	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});
	const { form: formData, enhance, validateForm } = form;
	let bankSync = $state(false);
	let val = $state('basic');
	let share_ready = $state(false);
	let token_id = $state('');
	let privacy = $state(false);
	let load = $state(false);
</script>

<Load active={load} />
<img src={trans_logo} class="absolute w-20 p-4 max-sm:hidden" />
<Dialog.Root bind:open={share_ready}>
	<Dialog.Content class="w-full">
		<Dialog.Header>
			<Dialog.Title>Share with team!</Dialog.Title>
			<Dialog.Description
				>This link will allow your team to sign up with The Money Company.</Dialog.Description
			>
		</Dialog.Header>
		<p class="w-full overflow-scroll text-wrap">http://moneycompany.app/signup/{token_id}</p>
		<Dialog.Footer>
			<Button type="submit" onclick={() => goto('/')}>Done</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<div class="grid h-screen sm:grid-cols-2">
	<div class="flex h-full w-full flex-col items-center justify-center">
		<img src={logo} class="w-[35%] p-3 sm:hidden" />
		<div class="flex flex-col gap-4 max-sm:w-[98%] sm:w-[60%]">
			<h1 class="text-4xl font-black italic max-sm:text-center">Welcome!</h1>
			<form use:enhance class="flex flex-col gap-3" method="POST">
				<Accordion.Root bind:value={val} type="single">
					<Accordion.Item value="basic">
						<Accordion.Trigger>Basic</Accordion.Trigger>
						<Accordion.Content class="p-3">
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
							<Button
								onclick={async () => {
									val = 'business';
								}}>Continue</Button
							>
						</Accordion.Content>
					</Accordion.Item>
					<Accordion.Item value="business">
						<Accordion.Trigger>Business</Accordion.Trigger>
						<Accordion.Content class="p-3">
							<Form.Field {form} name="company_name">
								<Form.Control>
									<Input bind:value={$formData.company_name} placeholder="Company name" />
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="industry">
								<Form.Control>
									{#snippet children({ props })}
										<Select.Root type="single" bind:value={$formData.industry}>
											<Select.Trigger {...props}>{$formData.industry}</Select.Trigger>
											<Select.Content>
												{#each industry as i}
													<Select.Item value={i}>{i}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<p class="p-3">Business address</p>
							<Form.Field {form} name="address_1">
								<Form.Control>
									<Input
										bind:value={$formData.address_1}
										placeholder="Address line 1"
										type="text"
									/>
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="address_2">
								<Form.Control>
									<Input
										bind:value={$formData.address_2}
										placeholder="Address line 2"
										type="text"
									/>
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="city">
								<Form.Control>
									<Input bind:value={$formData.city} placeholder="City" type="text" />
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="state">
								<Form.Control>
									{#snippet children({ props })}
										<Select.Root type="single" bind:value={$formData.state}>
											<Select.Trigger {...props}>{$formData.state}</Select.Trigger>
											<Select.Content>
												{#each states as i}
													<Select.Item value={i}>{i}</Select.Item>
												{/each}
											</Select.Content>
										</Select.Root>
									{/snippet}
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
							<Form.Field {form} name="zipcode">
								<Form.Control>
									<Input
										bind:value={$formData.zipcode}
										placeholder="Zip code or postal code"
										type="text"
									/>
								</Form.Control>
								<Form.FieldErrors />
							</Form.Field>
						</Accordion.Content>
					</Accordion.Item>
					<Accordion.Item value="banking">
						<Accordion.Trigger>Banking</Accordion.Trigger>
						<Accordion.Content class="">
							<div class="flex flex-col gap-3">
								<div class="flex items-center gap-2">
									<Checkbox bind:checked={bankSync} name="bank" />
									<Label for="bank">Setup bank sync.</Label>
								</div>

								<div class="flex items-center gap-2">
									<Checkbox bind:checked={privacy} name="priv" />
									<Label for="priv"
										>Agree to <a href="/privacy" class="underline">privacy policy</a> and terms of service.</Label
									>
								</div>
							</div>
						</Accordion.Content>
					</Accordion.Item>
				</Accordion.Root>
				<Button
					type="button"
					onclick={async () => {
						const valid = await validateForm({ update: true });
						if (valid && privacy) {
							load = true;
							let company = await trpc(data).add_company_w_owner.mutate(valid.data);

							if (bankSync) {
								const stripe = await loadStripe(PUBLIC_STRIPE_PUBLISHABLE_KEY);

								let session = await trpc(data).user_bank_sync_session_create.mutate({
									//customer: user.account_holder?.customer
									customer: 'cus_RWkLKUOV9PjR1m'
								});
								let accounts = await stripe?.collectFinancialConnectionsAccounts({
									clientSecret: session.client_secret
								});
								accounts?.financialConnectionsSession.accounts.forEach(async (a) => {
									await trpc(data).user_txn_sub.mutate({
										account: a.id
									});
								});
							}

							let pub_buffer = await trpc(data).key_init.query();
							let tok_data = await trpc(data).init_company_token.query({
								id: company.id,
								key: pub_buffer
							});
							token_id = stringToBase64URL(tok_data.token + ',' + tok_data.sig);
							load = false;
							share_ready = true;
						}
						if (!privacy) {
							form.message.set('You must agree to policies.');
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
