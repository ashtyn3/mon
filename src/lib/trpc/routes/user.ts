import { z } from "zod";
import { t } from "../t";
import { stripe } from "$lib/stripe";
import validator from "validator";
import { createAccount } from "$lib/index";
import crypto from "crypto"


export const user_entry = z.object({
    full_name: z.string(),
    email: z.string().email().trim().toLowerCase(),
    phone: z.string().refine(validator.isMobilePhone)
}).required()

export const add_user = t.procedure.input(user_entry).mutation(async (d) => {
    const ledger = Math.abs(crypto.randomBytes(4).readInt32BE());
    const code = 1000;
    const flags = 0;
    const res = await createAccount(ledger, code, {});

    const c = await stripe.customers.create({
        name: d.input.full_name,
        email: d.input.email,
        phone: d.input.phone,
        metadata: {
            tb_id: res.account.id.toString(),
        }
    })
    const session = await stripe.financialConnections.sessions.create({
        account_holder: {
            type: 'customer',
            customer: c.id,
        },
        permissions: ['balances', 'ownership', 'payment_method', 'transactions'],
    });
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
