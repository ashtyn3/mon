import { createServerClient } from '@supabase/ssr'
import { type Handle, redirect } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { createContext } from '$lib/trpc/context';
import { router } from '$lib/trpc/router';



import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { createTRPCHandle } from 'trpc-sveltekit'
import type { Company } from './app';

const supabase: Handle = async ({ event, resolve }) => {
    /**
     * Creates a Supabase client specific to this server request.
     *
     * The Supabase client gets the Auth token from the request cookies.
     */
    event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            getAll: () => event.cookies.getAll(),
            /**
             * SvelteKit's cookies API requires `path` to be explicitly set in
             * the cookie options. Setting `path` to `/` replicates previous/
             * standard behavior.
             */
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value, options }) => {
                    event.cookies.set(name, value, { ...options, path: '/' })
                })
            },
        },
    })

    /**
     * Unlike `supabase.auth.getSession()`, which returns the session _without_
     * validating the JWT, this function also calls `getUser()` to validate the
     * JWT before returning the session.
     */
    event.locals.safeGetSession = async () => {
        const {
            data: { session },
        } = await event.locals.supabase.auth.getSession()
        if (!session) {
            return { session: null, user: null }
        }

        const {
            data: { user },
            error,
        } = await event.locals.supabase.auth.getUser()
        if (error) {
            // JWT validation has failed
            return { session: null, user: null }
        }

        const id = await event.locals.supabase.from("profiles").select("company").eq("id", user?.id)
        if (id.data && id.data.length) {
            const company = await event.locals.supabase.from("companies").select("*").eq("id", id.data[0].company)
            if (!company.data) {
                return { session, supabase, user, url: { origin: "" }, company: null }
            } else {
                return { session, supabase, user, url: { origin: "" }, company: company.data[0] as Company }
            }
        }
        return { session, supabase, user, company: null }
    }

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            /**
             * Supabase libraries use the `content-range` and `x-supabase-api-version`
             * headers, so we need to tell SvelteKit to pass it through.
             */
            return name === 'content-range' || name === 'x-supabase-api-version'
        },
    })
}

const authGuard: Handle = async ({ event, resolve }) => {
    const { session, user, company } = await event.locals.safeGetSession()
    event.locals.session = session
    event.locals.user = user
    event.locals.company = company

    if (!event.locals.session && event.url.pathname.startsWith('/private')) {
        redirect(303, '/auth')
    }

    if (event.locals.session && event.url.pathname === '/auth') {
        redirect(303, '/private')
    }

    return resolve(event)
}

export const handle: Handle = sequence(supabase, authGuard, createTRPCHandle({ router, createContext }))
