import { stripe } from "$lib/stripe";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";

let secret = "whsec_d9e14ce83cf5c7919be4ee19e28dc87aa9797b212965a07c61b70e8edb25f61a"
export async function POST(e: RequestEvent) {
    const sig = e.request.headers["stripe-signature"];

    let event;
    try {
        console.log(sig)
        event = stripe.webhooks.constructEvent(await e.request.text(), sig, secret);
    } catch (err: any) {
        console.log(err)
        return json({ status: 500 });
    }

    if (event.type == "financial_connections.account.refreshed_transactions") {
        console.log("done")
    }
}
