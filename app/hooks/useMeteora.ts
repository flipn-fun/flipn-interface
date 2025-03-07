import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AmmImpl, { MAINNET_POOL } from '@mercurial-finance/dynamic-amm-sdk';
import { Project } from '../type';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useAccount } from './useAccount';
interface Params {
    token: Project;
}

const wsol = "So11111111111111111111111111111111111111112";
export default function useMeteora({ token }: Params) {
    const [meteoraPool, setMeteoraPool] = useState<any>(null);
    const { connection } = useConnection();
    const { publicKey, walletProvider } = useAccount();

    const meteoraPoolRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            if (token && token.status === 3 && token.DApp === 'sexy') {
                console.log('token:', token)
                const pools = await AmmImpl.searchPoolsByToken(connection, new PublicKey(token.address as string))
                console.log('pools:', pools)
                if (pools.length > 0) {
                    const pool = pools[0]
                    const constantProductPool = await AmmImpl.create(connection, pool.publicKey);

                    console.log('constantProductPool:', constantProductPool)

                    setMeteoraPool(pool)
                    meteoraPoolRef.current = constantProductPool
                }
            }
        })()
    }, [token]);

    const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        console.log('getQoute:', meteoraPool, meteoraPoolRef, slip)

        if (meteoraPool && meteoraPoolRef.current) {
            const inTokenMint = type === "buy" ? new PublicKey(wsol) : new PublicKey(token.address as string)
            const { swapOutAmount } = meteoraPoolRef.current.getSwapQuote(
                inTokenMint,
                new BN(amount),
                Number(slip),
            );

            return swapOutAmount.toNumber()
        }
        return null
    }, [meteoraPool, token])

    const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        if (meteoraPool && meteoraPoolRef.current) {
            const inTokenMint = type === "buy" ? new PublicKey(wsol) : new PublicKey(token.address as string)
            const inAmountLamport = new BN(amount)
            const { minSwapOutAmount } = meteoraPoolRef.current.getSwapQuote(
                inTokenMint,
                inAmountLamport,
                Number(slip),
            )

            const swapTx = await meteoraPoolRef.current.swap(
                publicKey,
                inTokenMint,
                inAmountLamport,
                minSwapOutAmount,
            );

            const hash = await walletProvider?.signAndSendTransaction(swapTx)

            console.log('hash:', hash)

            return hash
        }
        return null
    }, [meteoraPool, token, publicKey, walletProvider])

    return {
        meteoraPool,
        getQoute,
        trade
    }
}   