import { add_waitlist } from './routes/add_waitlist';
import { t } from './t';


export const router = t.router({
    add_waitlist
});

export const createCaller = t.createCallerFactory(router);

export type Router = typeof router;

