import { z } from "zod";

export const NonCompanySignUp = z.object({
    first_name: z.string().trim().min(2),
    last_name: z.string().trim().min(2),
    email: z.string().trim().toLowerCase().email(),
    password: z.string().min(8),
    phone: z.string().min(10),
    company: z.string()
})
