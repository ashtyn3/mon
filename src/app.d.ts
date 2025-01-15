import type { Session, SupabaseClient, User } from '@supabase/supabase-js'
export interface Company {
    name: string;
    address_1: string;
    address_2: string;
    state: string;
    city: string;
    postal_code: string;
    tb_id: string;
    id: string;
    industry: string;
    stripe_id: string;
    admin: string[];
}
declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            supabase: SupabaseClient
            safeGetSession: () => Promise<{ session: Session | null; user: User | null }>
            session: Session | null
            user: User | null
            company: Company,
            url: {
                origin: string;
            };
        }
        interface PageData extends TRPCClientInit {
            session: Session | null,
            company: Company,
            url: {
                origin: string;
            };
        };
        // interface PageState {}
        // interface Platform {}
    }
}

export { }
