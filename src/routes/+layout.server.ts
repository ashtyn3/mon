import type { LayoutServerLoad } from './$types'

export const load: LayoutServerLoad = async ({ locals: { safeGetSession }, cookies }) => {
    const { session } = await safeGetSession()
    return {
        session,
        url: {
            origin: "",
        },
        cookies: cookies.getAll(),
    }
}
