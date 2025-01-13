import { stripe } from "$lib/stripe";
import { json } from "@sveltejs/kit";
import type { RequestEvent } from "./$types";
import { SECRET_STRIPE_SIGNING_KEY } from "$env/static/private";

let secret = SECRET_STRIPE_SIGNING_KEY
export async function POST(e: RequestEvent) {
    const sig = e.request.headers.get("stripe-signature");


    let event;
    try {
        event = stripe.webhooks.constructEvent(await e.request.text(), sig, secret);
    } catch (err: any) {
        console.log(err)
        return json({ status: 500 });
    }

    if (event.type == "financial_connections.account.refreshed_transactions") {
        const transactions = await stripe.financialConnections.transactions.list({
            account: event.data.object.id,
        });

        transactions.data.forEach((t) => {
            t.id
        })
        return { status: 200 };
    }
}
