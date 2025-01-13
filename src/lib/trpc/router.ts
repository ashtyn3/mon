import { add_waitlist } from './routes/add_waitlist';
import { user_txn_sub, user_txn_list, add_company_w_owner, user_bank_sync_session_create, add_user } from './routes/user';
import { key_init, init_company_token, users_w_pending } from "./routes/company"
import { t } from './t';


export const router = t.router({
    add_waitlist,
    add_company_w_owner,
    user_txn_sub,
    user_txn_list,
    user_bank_sync_session_create,
    key_init,
    init_company_token,
    add_user,
    users_w_pending
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

