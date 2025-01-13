import type { PageServerLoad } from "./$types.ts";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "./scheme";
import { zod } from "sveltekit-superforms/adapters";

export const load: PageServerLoad = async () => {
    return {
        form: await superValidate(zod(formSchema)),
    };
};
