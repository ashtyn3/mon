import { z } from "zod";
import { t } from "../t";

export const waitlist_entry = z.object({
    email: z.string().email().trim().toLowerCase(),
    first_name: z.string()
}).required()

export const add_waitlist = t.procedure.input(waitlist_entry).mutation(async (d) => {
    await d.ctx.event.locals.supabase.from("waitlist").insert({ first_name: d.input.first_name, email: d.input.email });
})
