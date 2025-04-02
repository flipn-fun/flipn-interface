import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { initGoFundMemeSDK } from "@gofundmeme/sdk-frontend";
import { Project } from '../type';
import { useConnection } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import { BN, Program, Wallet } from '@coral-xyz/anchor';
import { useAccount } from './useAccount';
import { createCloseAccountInstruction } from '@solana/spl-token';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { getAccount } from '@solana/spl-token';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import Decimal from "decimal.js";
import Big from 'big.js';
import { simplifyNum } from '../utils';

interface Params {
    token: Project;
}
export default function useGoFund({ token }: Params) {
    const { connection } = useConnection();
    const { publicKey, walletProvider } = useAccount();
    const [progress, setProgress] = useState<any>(0);

    const bondingCurvePoolRef = useRef<any>(null);

    useEffect(() => {
        (async () => {
            if (token && token.status === 1 && token.DApp === 'gofund') {
                const gfmSDK = await initGoFundMemeSDK(
                    (idl, programId) => new Program(idl, programId, {
                        connection: connection
                    } as any)
                );

                const pool = await gfmSDK.pools.bondingCurve.fetchBondingCurvePool({
                    mintB: new PublicKey(token.address as string),
                });

                const { poolStatus, targetRaise, totalRaised, totalSupply,  } = pool.poolData;

                if (targetRaise.toNumber() > 0) {
                    const progress = simplifyNum(totalRaised.toNumber() / targetRaise.toNumber() * 100, 2);
                    setProgress(progress);
                }

                bondingCurvePoolRef.current = pool;
            }
        })()
    }, [token.address]);

    const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
        if (bondingCurvePoolRef.current) {
            const x = await bondingCurvePoolRef.current.actions.swap[type]({
                amountInUI: new Decimal(amount),
                funder: publicKey!,
                slippage: 0,
            });

            if (type === 'buy') {
                return x?.quote?.amountOut * 100000
            } else {
                return x?.quote?.amountOut
            }
        }

        return null
    }, [token])

    const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        if (bondingCurvePoolRef.current && token) {
            const { quote, transaction } = await bondingCurvePoolRef.current.actions.swap[type]({
                amountInUI: new Decimal(amount),
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

                if (Number(userToken.amount) === new Big(amount).mul(10 ** (token.tokenDecimals as number)).toNumber()) {
                    const closeTokenIns = createCloseAccountInstruction(
                        tokenAccount, // token account which you want to close
                        walletProvider.publicKey!, // destination
                        walletProvider.publicKey!, // owner of token account
                    )
                    transaction.add(closeTokenIns);
                }
            }

            const hash = await walletProvider?.signAndSendTransaction(transaction, {}, {
                canJitoable: true,
                needFeeEstimate: false,
            })

            console.log('hash:', hash)

            return hash
        }
        return null
    }, [token, publicKey, walletProvider])

   

    return {
        getQoute,
        trade,
        progress
    }
}

