import { redirect } from "@sveltejs/kit";
import type { PageLoad } from './$types'


export const load: PageLoad = async (d) => {
    const p = await d.parent()
    return redirect(200, '/')
};