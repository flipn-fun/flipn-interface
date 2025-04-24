import { BN } from '@coral-xyz/anchor';
import type { Project } from '../type';
import { useAccount } from "./useAccount";
import { TokenType, DynamicBondingCurveClient, DYNAMIC_BONDING_CURVE_PROGRAM_ID, DynamicBondingCurveProgramClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from '@solana/spl-token';
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect } from 'react';


const fakePool: any = {
    "volatilityTracker": {
        "lastUpdateTimestamp": new BN("00"),
        "padding": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0
        ],
        "sqrtPriceReference": new BN("00"),
        "volatilityAccumulator": new BN("00"),
        "volatilityReference": new BN("00")
    },
    "config": new PublicKey("3gFSuiBCmupykjZVLrQrm2CctgqEjrR11QFMUFQpbZ8B"),
    "creator": new PublicKey("82gnQysWJCXJZXDJ6oPpjkpdgz5VroPZyzboE6xwBV6D"),
    "baseMint": new PublicKey("8dRdXBwhUnRsZKT8gUyMkqJCBJJexioGYdenjzUPgVf8"),
    "baseVault": new PublicKey("FdhrwbCPAz3PYRXdT55P8Y7PmmNiieneHs4FrhX5d5Pe"),
    "quoteVault": new PublicKey("63ffWfjxkuoX3h4akt3aAPV2cATwHX3Lnzzzg4oWrfeD"),
    "baseReserve": new BN(parseInt("038d7ea4c68000", 16)),
    "quoteReserve": new BN("00"),
    "protocolBaseFee": new BN("00"),
    "protocolQuoteFee": new BN("00"),
    "tradingBaseFee": new BN("00"),
    "tradingQuoteFee": new BN("00"),
    "sqrtPrice": new BN('17860983147306975'),
    "activationPoint": new BN(parseInt("166e5227", 16)),
    "poolType": 0,
    "isMigrated": 0,
    "isPartnerWithdrawSurplus": 0,
    "isProcotolWithdrawSurplus": 0,
    "migrationProgress": 0,
    "isWithdrawLeftover": 0,
    "padding0": [
        0,
        0
    ],
    "metrics": {
        "totalProtocolBaseFee": "00",
        "totalProtocolQuoteFee": "00",
        "totalTradingBaseFee": "00",
        "totalTradingQuoteFee": "00"
    },
    "finishCurveTimestamp": "00",
    "padding1": [
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00",
        "00"
    ]
}

const config = process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new PublicKey('6g98qaTAxqodvDV2boPhinEBMs3AZF4b3ekNDGuh8Ar7') : new PublicKey('3gFSuiBCmupykjZVLrQrm2CctgqEjrR11QFMUFQpbZ8B')
export const useMeteoraToken = ({ token }: { token: Project }) => {
    const { publicKey, walletProvider } = useAccount();
    const { connection } = useConnection()

    const createMint = useCallback(async (params: Project, amount: string) => {
        const client = new DynamicBondingCurveClient(connection as any)

        const baseMint = Keypair.generate()
        const creator = publicKey!

        console.log('baseMint', baseMint.publicKey.toBase58())
        console.log('DYNAMIC_BONDING_CURVE_PROGRAM_ID', DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58())

        const transaction = await client.pools.createPool({
            quoteMint: NATIVE_MINT,
            baseMint: baseMint.publicKey,
            config,
            baseTokenType: TokenType.SPL,
            quoteTokenType: TokenType.SPL,
            name: params.tokenName,
            symbol: params.ticker,
            uri: params.tokenImg,
            creator,
        })

        console.log('transaction', transaction)

        const latestBlockhash = await connection?.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        const message = new TransactionMessage({
            payerKey: publicKey!, // Public key of the account paying for the transaction
            recentBlockhash: latestBlockhash.blockhash, // Blockhash of the most recent block
            instructions: transaction.instructions, // Instructions to be included in the transaction
        }).compileToV0Message([])

        const versionedTransaction = new VersionedTransaction(message)

        versionedTransaction.sign([baseMint])

        const tx = await walletProvider.signAndSendTransaction(versionedTransaction, {}, {
            isVersionedTransaction: true,
            canJitoable: false,
            needFeeEstimate: false,
        })

        console.log('tx', tx)

        return tx
    }, [publicKey, walletProvider])

    // const createConfig = useCallback(async () => {
    //     const client = new DynamicBondingCurveClient(connection)
    //     const config = Keypair.generate()
    //     const feeClaimer = publicKey!
    //     const owner = publicKey!
    //     const quoteMint = NATIVE_MINT
    //     const payer = publicKey!

    //     console.log('config', config.publicKey.toBase58())

    //     const curves = []
    //     for (let i = 1; i <= 20; i++) {
    //       curves.push({
    //           sqrtPrice: MAX_SQRT_PRICE.muln(i * 5).divn(100),
    //           liquidity: U64_MAX.shln(30 + i),
    //       });
    //     }

    //     // Execute
    //     const transaction = await client.partners.createConfig({
    //         config: config.publicKey,
    //         feeClaimer,
    //         owner,
    //         quoteMint,
    //         payer,
    //         migrationQuoteThreshold: new BN('3750000000000'),
    //         collectFeeMode: 0,
    //         curve: curves,
    //         activationType: 0,
    //         partnerLockedLpPercentage: 100,
    //         partnerLpPercentage: 0,
    //         creatorLockedLpPercentage: 0,
    //         creatorLpPercentage: 0,
    //         poolFees: {
    //             baseFee: {
    //                 cliffFeeNumerator: new BN(10000000),
    //                 periodFrequency: new BN(0),
    //                 reductionFactor: new BN(0),
    //                 numberOfPeriod: 0,
    //                 feeSchedulerMode: 0,
    //             },
    //             dynamicFee: {
    //                 binStep: 1,
    //                 binStepU128: new BN('1844674407370955'),
    //                 filterPeriod: 10,
    //                 decayPeriod: 120,
    //                 reductionFactor: 3000,
    //                 maxVolatilityAccumulator: 100000,
    //                 variableFeeControl: 100000,
    //             },
    //         },
    //         migrationOption: 0,
    //         tokenDecimal: 9,
    //         tokenType: 0,
    //         sqrtStartPrice: new BN('195078983761054748'),
    //         padding: [],
    //         lockedVesting: {
    //             amountPerPeriod: new BN(0),
    //             cliffDurationFromMigrationTime: new BN(0),
    //             frequency: new BN(0),
    //             numberOfPeriod: new BN(0),
    //             cliffUnlockAmount: new BN(0),
    //         },
    //         migrationFeeOption: 0,
    //     })

    //     const latestBlockhash = await connection?.getLatestBlockhash();
    //     transaction.recentBlockhash = latestBlockhash!.blockhash;

    //     const message = new TransactionMessage({
    //         payerKey: publicKey!, // Public key of the account paying for the transaction
    //         recentBlockhash: latestBlockhash.blockhash, // Blockhash of the most recent block
    //         instructions: transaction.instructions, // Instructions to be included in the transaction
    //     }).compileToV0Message([])

    //     const versionedTransaction = new VersionedTransaction(message)

    //     versionedTransaction.sign([config])

    //     console.log('versionedTransaction', versionedTransaction)
    //     // transaction.addSignature(config.publicKey, Buffer.from([]))

    //     const tx = await walletProvider.signAndSendTransaction(versionedTransaction, {}, {
    //         isVersionedTransaction: true,
    //         canJitoable: true,
    //         needFeeEstimate: false,
    //     })

    //     console.log('tx', tx)

    // }, [publicKey, walletProvider])

    const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
        const client = new DynamicBondingCurveClient(connection as any)
        const programclient = new DynamicBondingCurveProgramClient(connection as any)

        const poolAddress = await programclient.getPoolAddress(
            NATIVE_MINT,
            new PublicKey('FEvrgVQbpe775fBxVSixevt1xwh7VH2ZLcBVMqvfGWHw'),
            config
        )

        const transaction = await client.pools.swap(
            poolAddress,
            {
                amountIn: new BN(1000000),
                minimumAmountOut: new BN(0),
                swapBaseForQuote: true,
                owner: publicKey!,
            },
        )


        console.log('transaction', transaction)

        const _transaction = new Transaction()

        // _transaction.add(transaction.instructions[1])
        // _transaction.add(transaction.instructions[2])
        // _transaction.add(transaction.instructions[3])
        // _transaction.add(transaction.instructions[4])
        // _transaction.add(transaction.instructions[0])
        // _transaction.add(transaction.instructions[5])

        _transaction.add(transaction.instructions[1])
        _transaction.add(transaction.instructions[0])
        _transaction.add(transaction.instructions[2])

        const tx = await walletProvider.signAndSendTransaction(_transaction, {}, {
            isVersionedTransaction: false,
            canJitoable: true,
            needFeeEstimate: true,
        })

        console.log('tx', tx)

    }, [publicKey, walletProvider])

    const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
        const client = new DynamicBondingCurveClient(connection as any)
        const programclient = new DynamicBondingCurveProgramClient(connection as any)

        const poolAddress = await programclient.getPoolAddress(
            NATIVE_MINT,
            new PublicKey('8dRdXBwhUnRsZKT8gUyMkqJCBJJexioGYdenjzUPgVf8'),
            config
        )

        console.log('poolAddress', poolAddress.toBase58())

        const poolConfig = await programclient.getPoolConfig(config)

        const pool = await programclient.getPool(poolAddress)

        console.log('pool', pool!.sqrtPrice.toString())

        const quote = await client.pools.swapQuote({
            virtualPool: fakePool!,
            config: poolConfig,
            swapBaseForQuote: false,
            amountIn: new BN(1000000),
            hasReferral: false,
            currentPoint: new BN(0)
        })

        console.log('quote', quote.amountOut.toString())

        return quote.amountOut.toString()
    }, [])

    return {
        createMint,
        trade,
        getQoute
    };
};

