import { z } from "zod";
import { t } from "../t";
import { stripe } from "$lib/stripe";
import validator from "validator";
import { createAccount } from "$lib/index";
import { formSchema } from "../../../routes/signup/scheme";
import { id } from "tigerbeetle-node";
import { NonCompanySignUp } from "../../../routes/signup/[token]/signInSchema";
import { fromPermission, PermissionsFrom } from "$lib/permissions";
import crypto from "crypto"
import { create_customer, feedback_create_customer } from "./feedback";



export const add_company_w_owner = t.procedure.input(formSchema).mutation(async (d) => {
    const ledger = Math.abs(crypto.randomBytes(4).readInt32BE());
    const code = 1000;
    const flags = 0;
    const res = await createAccount(ledger, code, {});


    const c = await stripe.customers.create({
        name: d.input.company_name,
        email: d.input.email,
        phone: d.input.phone,
        metadata: {
            tb_id: res.account.id.toString(),
        }
    })
    const valid = d.input;
    const auth = await d.ctx.event.locals.supabase.auth.signUp({
        email: valid.email,
        password: valid.password,
        options: {
            data: {
                first_name: valid.first_name,
                last_name: valid.last_name,
                phone: valid.phone,
                email: valid.email
            }
        }
    });
    const a = await d.ctx.event.locals.supabase.auth.signInWithPassword({
        email: valid.email,
        password: valid.password,
    })
    const company = await d.ctx.event.locals.supabase.from('companies').insert({
        name: valid.company_name,
        address_1: valid.address_1,
        address_2: valid.address_2,
        state: valid.state,
        city: valid.city,
        postal_code: valid.zipcode,
        industry: valid.industry,
        tb_id: res.account.id,
        stripe_id: c.id,
        admin: [a.data.user?.id]
    }, {}).select();
    await d.ctx.event.locals.supabase.from("profiles").update({ company: company.data[0].id }).eq("id", auth.data.user?.id)
    await d.ctx.event.locals.supabase.from("roles").insert({
        permission: PermissionsFrom({
            bookKeeper: false,
            standard: false,
            viewer: false,
            admin: true,
            pending: false,
        }),
        owner: company.data[0].id,
        user: auth.data.user?.id,
    })
    await feedback_create_customer({ id: company.data[0].id, name: valid.company_name }).catch(() => {
        return;
    });
    return company.data[0];
})

export const add_user = t.procedure.input(NonCompanySignUp).mutation(async (d) => {
    const auth = await d.ctx.event.locals.supabase.auth.signUp({
        email: d.input.email,
        password: d.input.password,
        options: {
            data: {
                first_name: d.input.first_name,
                last_name: d.input.last_name,
                phone: d.input.phone,
                email: d.input.email
            }
        }
    });
    const id = auth.data.user?.id;
    await d.ctx.event.locals.supabase.from("profiles").update({ company: d.input.company }).eq("id", id)
    await d.ctx.event.locals.supabase.from("roles").insert({
        permission: PermissionsFrom({
            bookKeeper: false,
            standard: false,
            viewer: false,
            admin: false,
            pending: true
        }),
        owner: d.input.company,
        user: id,
    })
    return auth
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

export const session = z.object({
    customer: z.string(),
}).required()

export const user_bank_sync_session_create = t.procedure.input(session).mutation(async (d) => {
    const session = await stripe.financialConnections.sessions.create({
        account_holder: {
            type: "customer",
            customer: d.input.customer
        },
        permissions: ['balances', 'transactions'],
    });
    return session
});


