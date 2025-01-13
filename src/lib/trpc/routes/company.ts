import { id } from "tigerbeetle-node";
import { t } from "../t";
import crypto from "crypto"
import { z } from "zod";
import { PermissionsFrom } from "$lib/permissions";

export const key_init = t.procedure.query(async (d) => {
    const session = await d.ctx.event.locals.safeGetSession()
    const keypair = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'spki',
            format: 'pem'
        },
        privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            //cipher: 'aes-256-cbc',
            //passphrase: 'top secret'
        }
    })
    let enc = await d.ctx.event.locals.supabase.rpc("encrypt_private_key", { private_key: keypair.privateKey, secret: "u_m" })
    let user = await d.ctx.event.locals.supabase.auth.getUser();
    let user_company = await d.ctx.event.locals.supabase.from("profiles").select("*").eq("id,", user.data.user?.id);
    console.log(user_company)
    await d.ctx.event.locals.supabase.from("keys").insert({
        enc_key: enc.data,
        owner_id: user_company.data[0].company,
        pub_key: keypair.publicKey
    })

    return keypair.publicKey
});

export const init_company_token = t.procedure.input(z.object({ id: z.string(), key: z.string() })).query(async (d) => {
    let token = id().toString();
    const create = ((new Date()).toISOString()).toLocaleString();
    let company_name = await d.ctx.event.locals.supabase.from("companies").select("name").eq("id", d.input.id)
    const t = await d.ctx.event.locals.supabase.from('tokens').insert({ token: token, owner: d.input.id, created_at: create, issuer_key: d.input.key, owner_name: company_name.data[0].name }).select();


    let key = await d.ctx.event.locals.supabase.from("keys").select("enc_key, pub_key").eq("owner_id", d.input.id)
    let decrypt = await d.ctx.event.locals.supabase.rpc("decrypt_private_key", { encrypted_key: key.data[0].enc_key, secret: "u_m" })
    const data = Buffer.from(JSON.stringify({ tok: token, created_at: t.data[0].created_at, issuer: d.input.id }));
    console.log(data.toString())
    let sig = crypto.sign("RSA-SHA256", data, decrypt.data)
    return {
        sig: sig.toString("base64"),
        token
    }
})

export const users_w_pending = t.procedure.query(async (d) => {
    const id = await d.ctx.event.locals.supabase.from("profiles").select("company").eq("id", d.ctx.event.locals.user.id)
    const res = await d.ctx.event.locals.supabase.from("roles").select("*").eq("owner", id.data[0].company).eq("permission", PermissionsFrom({
        bookKeeper: false,
        standard: false,
        viewer: false,
        admin: false,
        pending: true
    }))
    let returnable = []

    for (let i = 0; i < res.data?.length; i++) {
        const user = await d.ctx.event.locals.supabase.from("profiles").select("*").eq("id", res.data[i].user);
        returnable.push(user.data[0])
    }
    return returnable;
})
