import type { PageServerLoad } from "./$types.ts";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "./scheme";
import { zod } from "sveltekit-superforms/adapters";
import { authentication } from "$lib/flags.js";
import { redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    if (!await authentication()) {
        redirect(301, '/')
    }
    return {
        form: await superValidate(zod(formSchema)),
    };
};
