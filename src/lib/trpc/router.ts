import { add_waitlist } from './routes/add_waitlist';
import { user_txn_sub, user_txn_list, add_user } from './routes/user';
import { t } from './t';


export const router = t.router({
    add_waitlist,
    add_user,
    user_txn_sub,
    user_txn_list
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

