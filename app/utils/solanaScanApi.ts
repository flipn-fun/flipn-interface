import { solana_api_key } from './config'

const api_prefix = 'https://pro-api.solscan.io/v2.0'

export async function getTokenByHolder(address: string, page: number = 1, pageSize: number = 40) {
    return fetch(`${api_prefix}/account/token-accounts?hide_zero=true&type=token&page=${page}&page_size=${pageSize}&address=${address}`, {
        headers: {
            token: solana_api_key
        }
    }).then(res => res.json())
}

export async function getHoldersByToken(address: string, page: number = 1, pageSize: number = 40) {
    return fetch(`${api_prefix}/token/holders?address=${address}&page=${page}&page_size=${pageSize}`, {
        headers: {
            token: solana_api_key
        }
    }).then(res => res.json()).then(res => res.data)
}


const tokenMetaCache = new Map<string, any>()
export async function getTokenMeta(address: string) {
    if (!address) {
        return null
    }

    const nowMinute = new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, -3)
    const cacheKey = `${address}-${nowMinute}`

    if (tokenMetaCache.has(cacheKey)) {
        return tokenMetaCache.get(cacheKey)
    }

    const res = fetch(`${api_prefix}/token/meta?address=${address}`, {
        headers: {
            token: solana_api_key
        }
    }).then(res => res.json())
    tokenMetaCache.set(cacheKey, res)

    return res
}
