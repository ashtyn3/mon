import { SECRET_LINEAR_API_KEY } from "$env/static/private";
import { z } from "zod";
import { t } from "../t";
import type { LinearFetch } from "@linear/sdk";
import { LinearClient, User } from "@linear/sdk";
import { limiterMiddleware } from "../middleware/ratelimit";
import { f_customer_entry, f_customer_ticket_entry } from "$lib/linear";



const linearClient = new LinearClient({ apiKey: SECRET_LINEAR_API_KEY });

export const feedback_create_customer = async (cu: typeof f_customer_entry._type) => {
    return await linearClient.createCustomer(cu)
}

export const create_customer = t.procedure.use(limiterMiddleware).input(f_customer_entry).query(async (d) => {
    return await feedback_create_customer(d.input)
})
export const create_customer_ticket = t.procedure.use(limiterMiddleware).input(f_customer_ticket_entry).mutation(async (d) => {
    const name = await d.ctx.event.locals.supabase.from("companies").select("name").eq("id", d.input.customer_id);
    let issueId = await linearClient.createIssue({
        teamId: "bc727fc8-68f6-492b-872d-213b2307a6f1",
        title: "Customer Request from " + name.data[0].name,

    });
    console.log(await issueId.issue)
    let data = await linearClient.createCustomerNeed({
        issueId: (await issueId.issue).id,
        customerId: d.input.customer_id,
        body: d.input.body
    })
})
