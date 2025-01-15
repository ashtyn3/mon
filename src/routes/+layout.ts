import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr'
import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from '$env/static/public'
import posthog from 'posthog-js'
import type { LayoutLoad } from './$types'
import { browser } from '$app/environment'
import type { Company } from '../app'

export const load: LayoutLoad = async ({ data, depends, fetch }) => {
    /**
     * Declare a dependency so the layout can be invalidated, for example, on
     * session refresh.
     */
    depends('supabase:auth')

    const supabase = isBrowser()
        ? createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
            global: {
                fetch,
            },
        })
        : createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
            global: {
                fetch,
            },
            cookies: {
                getAll() {
                    return data.cookies
                },
            },
        })

    /**
     * It's fine to use `getSession` here, because on the client, `getSession` is
     * safe, and on the server, it reads `session` from the `LayoutData`, which
     * safely checked the session using `safeGetSession`.
     */
    const {
        data: { session },
    } = await supabase.auth.getSession()


    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (browser) {
        posthog.init(
            'phc_tCWm66cPPoQg43LAalgIAuSt8JYFGnfwL7EEHckdkvD',
            {
                api_host: 'https://us.i.posthog.com',
                person_profiles: 'always', // or 'always' to create profiles for anonymous users as well
            }
        )
    }
    const id = await supabase.from("profiles").select("company").eq("id", user?.id)
    if (id.data && id.data.length) {
        const company = await supabase.from("companies").select("*").eq("id", id.data[0].company)
        if (!company.data) {
            return { session, supabase, user, url: { origin: "" }, company: null }
        } else {
            return { session, supabase, user, url: { origin: "" }, company: company.data[0] as Company }
        }
    }
    return { session, supabase, user, url: { origin: "" }, company: null }
}
