import { debug, error } from '@nephelaiio/logger'
import { listAccounts } from '../api/accounts'


const apiToken = () => `${process.env.CLOUDFLARE_API_TOKEN}`
const accountId = () => `${process.env.CLOUDFLARE_ACCOUNT_ID}`

const init = async () => {
    if (!apiToken()) {
        error('CLOUDFLARE_API_TOKEN environment variable must be set');
        process.exit(1);
    }
    const accounts = await listAccounts(apiToken());
    console.log(JSON.stringify(accounts));
    process.exit(1);
}

export { apiToken, accountId, init }
