<script lang="ts">
	import logo from '$lib/assets/transparent_logo.png';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { trpc } from '$lib/trpc/client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let waitlist_req = $state({
		name: '',
		email: ''
	});
	let waitlist_open = $state(false);
</script>

<div class="grid h-screen grid-rows-[50px_auto] items-center bg-backing-blue p-5 text-white">
	<div class="row-span-1">
		<img src={logo} class="h-14" />
	</div>
	<div class="row-span-1">
		<h1 class="text-7xl font-black italic text-forefront-red max-sm:text-5xl">The Money Company</h1>
		<p class="pt-3 text-2xl">Make finances chill.</p>
		<Dialog.Root open={waitlist_open}>
			<Dialog.Trigger asChild>
				<button class="mt-5 rounded-lg border-2 p-2" onclick={() => (waitlist_open = true)}>
					Join waitlist
				</button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title class="text-2xl font-black">Welcome!</Dialog.Title>
					<Dialog.Description class="">
						<p>Enter your email so we can contact you later.</p>
					</Dialog.Description>
				</Dialog.Header>
				<div class="flex w-full flex-col gap-2">
					<div class="mb-5 mt-5 w-[80%]">
						<Input
							placeholder="First name"
							type="text"
							class="mb-3"
							bind:value={waitlist_req.name}
						/>
						<Input
							placeholder="Email"
							name="email"
							type="email"
							class="mt-3"
							bind:value={waitlist_req.email}
						/>
					</div>
					<Button
						class="w-fit"
						type="submit"
						onclick={async () => {
							await trpc(data).add_waitlist.mutate({
								email: waitlist_req.email,
								first_name: waitlist_req.name
							});
							waitlist_open = false;
						}}>Join</Button
					>
				</div>
			</Dialog.Content>
		</Dialog.Root>
	</div>
</div>
<div class="grid h-screen grid-cols-2 grid-rows-[fit_auto]">
	<div class="p-10">
		<h1 class="pb-3 text-2xl font-black italic">What?</h1>
		<p class="">
			Take control of your finances with insights from your transaction data. Say goodbye to tedious
			spreadsheets and pieced-together finance management tools.
		</p>
	</div>
	<div class="p-10">
		<h1 class="pb-3 text-2xl font-black italic">Why?</h1>
		<p class="">
			We've been here before—scrambling to gather data for our business. We wanted a simpler way to
			manage finances and customer information without breaking the bank.
		</p>
	</div>
	<div class="col-span-2 grid grid-rows-2 bg-midnight-purple p-5">
		<h1 class=" self-center text-4xl font-black text-lavendar">BONUS</h1>
		<h1 class="text-5xl font-black text-white">It's open source.</h1>
	</div>
</div>
