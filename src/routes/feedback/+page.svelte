<script lang="ts">
	import { trpc } from '$lib/trpc/client';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import logo from '$lib/assets/transparent_logo.png';
	import Input from '$lib/components/ui/input/input.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { f_customer_ticket_entry } from '$lib/linear';
	import { goto } from '$app/navigation';

	let { data }: { data: PageData } = $props();
	let title = $state('');
	let message = $state('');
	let form: typeof f_customer_ticket_entry._type = $state({
		customer_id: '',
		body: ''
	});
	onMount(() => {
		if (data.user == null || data.company == null) {
			goto('/');
		}
	});
</script>

<div class="grid h-screen grid-rows-[50px_auto] items-center p-5 text-black">
	<div class="row-span-1">
		<img src={logo} class="h-14" />
	</div>

	<div class="row-span-1 flex w-full justify-center">
		<div class="flex w-[50%] flex-col gap-3">
			<h1 class="text-2xl font-black text-backing-blue">Feedback!</h1>
			<Input placeholder="Title" class="w-[50%]" name="title" bind:value={title} />
			<Textarea placeholder="Thoughts..." name="body" bind:value={form.body}></Textarea>
			<div>{message}</div>
			<Button
				class="w-fit"
				onclick={() => {
					const ticket = `# ${title}\n${form.body}`;
					let res = f_customer_ticket_entry.safeParse(form);
					if (!res.success) {
						if (res.error.issues[0].code == 'too_small') {
							message = 'You need to give us more information.';
						}
					} else {
						console.log(data);
						if (data.company) {
							trpc(data).create_customer_ticket.mutate({
								customer_id: data.company.id,
								body: ticket
							});
						}
					}
				}}>Submit</Button
			>
		</div>
	</div>
</div>
