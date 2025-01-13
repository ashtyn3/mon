import { id } from "tigerbeetle-node";
import type { AccountFlags } from "./tigerbeetle";
import { PUBLIC_SERVER_URL } from "$env/static/public";

export async function createAccount(ledger: number, code: number, flags: AccountFlags) {
    const acc = {
        id: id().toString(16), // TigerBeetle time-based ID.
        credits_posted: 0,
        credits_pending: 0,
        debits_posted: 0,
        debits_pending: 0,
        user_data_128: "",
        user_data_64: 0,
        user_data_32: 3,
        ledger,
        code,
        flags,
    };

    const req = await fetch(PUBLIC_SERVER_URL + "/accounts/create", { method: "POST", body: JSON.stringify({ accounts: [acc] }) })
    const res = req.json()


    return { account: acc, response: res }
}

