import { flag } from '@vercel/flags/sveltekit';

export const authentication = flag<boolean>({
    key: 'authentication',
    description: 'Allow authentication systems.', // optional
    decide(_event) {
        return false;
    },
});
