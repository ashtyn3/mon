import { error, redirect } from '@sveltejs/kit';
import crypto from "crypto"
import { stringFromBase64URL } from '@supabase/ssr';
import type { PageServerLoad } from '../$types';
import { z } from 'zod';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { NonCompanySignUp } from './signInSchema';
import { authentication } from '$lib/flags';

export const load: PageServerLoad = async (l) => {
    if (!await authentication()) {
        redirect(301, '/')
    }
    let data = stringFromBase64URL(l.params.token)
    let token_data = data.split(",")
    let token_id = token_data[0]
    console.log(data)
    const token = await l.locals.supabase.from("tokens").select("*").eq("token", token_id)
    let sig = token_data[1];
    if (token.data && token.data.length != 0) {
        let sig_data = JSON.stringify({ tok: token_id, created_at: token.data[0].created_at, issuer: token.data[0].owner });
        const verify = crypto.verify('RSA-SHA256', Buffer.from(sig_data), token.data[0].issuer_key, Buffer.from(sig, "base64"));


        if (verify) {
            return {
                company: token.data[0].owner_name,
                company_id: token.data[0].owner,
                form: await superValidate(zod(NonCompanySignUp)),
            };
        }
    }
    error(401, 'Not found');
};
