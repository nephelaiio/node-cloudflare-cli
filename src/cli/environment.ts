import { error } from '@nephelaiio/logger'
import { api } from '@nephelaiio/cloudflare-api'

const apiToken = () => `${process.env.CLOUDFLARE_API_TOKEN}`
const accountId = () => `${process.env.CLOUDFLARE_ACCOUNT_ID}`

const init = async () => {
    if (!apiToken()) {
        error('CLOUDFLARE_API_TOKEN environment variable must be set');
        process.exit(1);
    }
    const token = apiToken();
    const path = `/accounts`;
    const accounts = await api({ token, path });
    if (accounts.length === 1) {
        process.env.CLOUDFLARE_ACCOUNT_ID = accounts[0].id;
    } else if (!accountId()) {
        error('CLOUDFLARE_ACCOUNT_ID environment variable must be set');
        process.exit(1);
    }
}

export { apiToken, accountId, init }
