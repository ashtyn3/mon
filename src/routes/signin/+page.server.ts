import type { PageServerLoad } from "./$types.ts";
import { superValidate } from "sveltekit-superforms";
import { formSchema } from "./scheme";
import { zod } from "sveltekit-superforms/adapters";
import { redirect } from "@sveltejs/kit";
import { ph_client } from "$lib/posthog.js";

export const load: PageServerLoad = async () => {
    if (!await ph_client.isFeatureEnabled("onboarding", "anon")) {
        redirect(301, '/')
    }
    return {
        form: await superValidate(zod(formSchema)),
    };
};
