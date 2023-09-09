/* eslint-disable @typescript-eslint/no-explicit-any */

import { api } from '@nephelaiio/cloudflare-api'

async function listAccounts(token: string): Promise<[any]> {
    const path = '/accounts';
    const query = await api({token, path });
    return query;
}

export { listAccounts }
