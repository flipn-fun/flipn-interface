import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { initGoFundMemeSDK } from "@gofundmeme/sdk";
import { Project } from '../type';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { useAccount } from './useAccount';
import { createCloseAccountInstruction } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getAccount } from '@solana/spl-token';
import { getAssociatedTokenAddress } from '@solana/spl-token';
interface Params {
    token: Project;
}

export default function useGoFund({ token }: Params) {
    const { connection } = useConnection();
    const { publicKey, walletProvider } = useAccount();

    const bondingCurvePoolRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            if (token && token.status === 1 && token.DApp === 'GoFund') {
                const gfmSDK = await initGoFundMemeSDK({ connection });
                const bondingCurvePool = await gfmSDK.pools.bondingCurve.fetchBondingCurvePool(
                    { mintB: new PublicKey(token.address as string) }
                );
                console.log(bondingCurvePool, 'bondingCurvePool')
                bondingCurvePoolRef.current = bondingCurvePool
            }
        })()
    }, [token.address]);

    const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        if (bondingCurvePoolRef.current) {
            const { quote } = bondingCurvePoolRef.current.actions.swap[type]({
                amountInUI: new BN(amount).toString(),
                funder: publicKey!,
                slippage: 0,
            });

            return quote
        }
        return null
    }, [token])

    const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        if (bondingCurvePoolRef.current) {
            const { quote, transaction } = bondingCurvePoolRef.current.actions.swap[type]({
                amountInUI: new BN(amount).toString(),
                funder: publicKey!,
                slippage: slip,
            })

            if (type === 'sell') {
                const tokenAccount = await getAssociatedTokenAddress(
                    new PublicKey(token.address as string),
                    publicKey!,
                    false
                );

                const userToken = await getAccount(
                    connection,
                    tokenAccount,
                    undefined,
                    TOKEN_PROGRAM_ID
                );

                if (Number(userToken.amount) === Number(amount)) {
                    const closeTokenIns = createCloseAccountInstruction(
                        tokenAccount, // token account which you want to close
                        walletProvider.publicKey!, // destination
                        walletProvider.publicKey!, // owner of token account
                    )
                    transaction.add(closeTokenIns);
                }
            }


            const hash = await walletProvider?.signAndSendTransaction(transaction, {}, {
                canJitoable: true
            })

            console.log('hash:', hash)

            return hash
        }
        return null
    }, [token, publicKey, walletProvider])

    return {
        getQoute,
        trade
    }
}

