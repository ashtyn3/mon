import { z } from "zod";
import { t } from "../t";
import { stripe } from "$lib/stripe";
import validator from "validator";
import { tb_client } from "$lib";
import crypto from "crypto"
import { id } from "tigerbeetle-node";
import { json } from "@sveltejs/kit";


export const user_entry = z.object({
    full_name: z.string(),
    email: z.string().email().trim().toLowerCase(),
    phone: z.string().refine(validator.isMobilePhone)
}).required()

export const add_user = t.procedure.input(user_entry).mutation(async (d) => {
    const account = {
        id: id(), // TigerBeetle time-based ID.
        debits_pending: 0n,
        debits_posted: 0n,
        credits_pending: 0n,
        credits_posted: 0n,
        user_data_128: 0n,
        user_data_64: 0n,
        user_data_32: 0,
        reserved: 0,
        ledger: Math.abs(crypto.randomBytes(4).readInt32BE()),
        code: 1000,
        flags: 0,
        timestamp: 0n,
    };

    const account_errors = await tb_client.createAccounts([account]);
    if (account_errors.length != 0) {
        console.log(account_errors)
        return json({});
    }

    const c = await stripe.customers.create({
        name: d.input.full_name,
        email: d.input.email,
        phone: d.input.phone,
        metadata: {
            tb_id: account.id.toString(),
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
