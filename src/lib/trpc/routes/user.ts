import { z } from "zod";
import { t } from "../t";
import { stripe } from "$lib/stripe";
import validator from "validator";


export const user_entry = z.object({
    full_name: z.string(),
    email: z.string().email().trim().toLowerCase(),
    phone: z.string().refine(validator.isMobilePhone)
}).required()

export const add_user = t.procedure.input(user_entry).mutation(async (d) => {
    const c = await stripe.customers.create({
        name: d.input.full_name,
        email: d.input.email,
        phone: d.input.phone,
    })
    const session = await stripe.financialConnections.sessions.create({
        account_holder: {
            type: 'customer',
            customer: c.id,
        },
        permissions: ['balances', 'ownership', 'payment_method', 'transactions'],
    });
    console.log(session)
    session.accounts.data.forEach(async (acc) => {
        const account = await stripe.financialConnections.accounts.subscribe(
            acc.id,
            {
                features: ['transactions'],
            }
        );
    })
    return session;
})

export const get_txn_entry = z.object({
    account: z.string(),
}).required()

export const user_txn_sub = t.procedure.input(get_txn_entry).mutation(async (d) => {
    const transactions = await stripe.financialConnections.accounts.subscribe(
        d.input.account, { features: ["transactions"] }
    );
    return transactions
})
export const user_txn_list = t.procedure.input(get_txn_entry).query(async (d) => {
    const transactions = await stripe.financialConnections.transactions.list({
        account: d.input.account,
    });
    return transactions
})
