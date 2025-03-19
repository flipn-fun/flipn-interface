import { useConnection } from "@solana/wallet-adapter-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "./useAccount";
import Big from "big.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddressSync, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useDebounceFn } from "ahooks";

export default function useBalance({ reFreshBalnace, mint, tokenDecimals }
    : { mint?: string, tokenDecimals?: number, reFreshBalnace: number }) {
    const { connection } = useConnection();
    const { walletProvider } = useAccount();

    const [solBalance, setSolBalance] = useState('0')
    const [tokenBalance, setTokenBalance] = useState('0')

    const getSolBalance = useCallback(() => {
        if (!walletProvider.publicKey || !connection) return;
        connection.getBalance(walletProvider.publicKey!).then((res) => {
            if (res) {
                setSolBalance(new Big(res).div(10 ** 9).toString());
            } else {
                setSolBalance("0");
            }
        })
    }, [connection, walletProvider])

    const getTokenBalance = useCallback(async () => {
        if (!mint || !walletProvider.publicKey || !connection) return;
        const mintAddress = new PublicKey(mint)

        try {
            const associatedToken = getAssociatedTokenAddressSync(
                mintAddress,
                walletProvider.publicKey!,
                true,
                TOKEN_PROGRAM_ID,
                ASSOCIATED_TOKEN_PROGRAM_ID
            );

            const userToken = await getAccount(
                connection,
                associatedToken,
                undefined,
                TOKEN_PROGRAM_ID
            );

            if (userToken && userToken.amount) {
                const balance = new Big(Number(userToken.amount))
                    .div(10 ** (tokenDecimals || 0))
                        .toString();

                setTokenBalance(balance)
            } else {
                setTokenBalance('0')
            }
        } catch (e) {
            setTokenBalance('0')
        }
    }, [mint, tokenDecimals, walletProvider.publicKey, connection])


    const { run: throttledGetSolBalance } = useDebounceFn(
        () => {
            getSolBalance()
        },
        { wait: 2000 }
    );

    const { run: throttledGetTokenBalance } = useDebounceFn(
        () => {
            getTokenBalance()
        },
        { wait: 2000 }
    );

    useEffect(() => {
        console.log('reFreshBalnace:', reFreshBalnace)
        throttledGetSolBalance()
    }, [reFreshBalnace]);

    useEffect(() => {
        if (mint && tokenDecimals) {
            throttledGetTokenBalance()
        }
    }, [
        mint,
        tokenDecimals,
        reFreshBalnace
    ]);

    return {
        solBalance,
        tokenBalance,
    }
}
