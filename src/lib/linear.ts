import { z } from "zod";

export const f_customer_entry = z.object({ id: z.string(), name: z.string() });
export const f_customer_ticket_entry = z.object({ customer_id: z.string(), body: z.string().min(2) });
