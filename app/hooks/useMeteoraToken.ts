import { BN } from '@coral-xyz/anchor';
import type { Project } from '../type';
import { useAccount } from "./useAccount";
import { TokenType, DynamicBondingCurveClient, DYNAMIC_BONDING_CURVE_PROGRAM_ID, DynamicBondingCurveProgramClient, SwapAccounts } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, Transaction, TransactionInstruction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect } from 'react';
import { unwrapSOLInstruction, wrapSOLInstruction } from '@mercurial-finance/dynamic-amm-sdk/dist/cjs/src/amm/utils';


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

const config = process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new PublicKey('4smZtL2NfcYNVtk3fFx9YFmbWoTvE3ttToA3KAL2QBMn') : new PublicKey('9KGgxn6H9Y7zRzUDh9o9M5w2KBGdJBNgUeUN8bFFF3FW')
export const useMeteoraToken = ({ token }: { token: Project }) => {
    const { publicKey, walletProvider } = useAccount();
    const { connection } = useConnection()

    const createMint = useCallback(async (params: Project, amount: string) => {
        const client = new DynamicBondingCurveClient(connection as any)
        const programclient = new DynamicBondingCurveProgramClient(connection as any)

        const baseMint = Keypair.generate()
        const creator = publicKey!

        console.log('baseMint', baseMint.publicKey.toBase58())
        console.log('DYNAMIC_BONDING_CURVE_PROGRAM_ID', DYNAMIC_BONDING_CURVE_PROGRAM_ID.toBase58())

        console.log('config', params)

        const transaction = await client.pools.createPool({
            quoteMint: NATIVE_MINT,
            baseMint: baseMint.publicKey,
            config,
            baseTokenType: TokenType.SPL,
            quoteTokenType: TokenType.SPL,
            name: params.tokenName,
            symbol: params.ticker,
            uri: params.tokenImg,
            payer: creator,
            poolCreator: creator,
        })

        if (amount && Number(amount) > 0) {
            const program = programclient.getProgram()
            const eventAuthority = deriveEventAuthority()
            const poolAuthority = derivePoolAuthority(program.programId)

            const amountIn = new BN(amount)
            const minimumAmountOut = new BN(0)
            const swapBaseForQuote = false
            const owner = publicKey!

            const inputMint = NATIVE_MINT
            const outputMint = baseMint.publicKey
            const inputTokenProgram = TOKEN_PROGRAM_ID
            const outputTokenProgram = TOKEN_PROGRAM_ID

            const isSOLInput = true
            const isSOLOutput = false

            const inputTokenAccount = findAssociatedTokenAddress(
                owner,
                inputMint,
                inputTokenProgram
            )

            const outputTokenAccount = findAssociatedTokenAddress(
                owner,
                outputMint,
                outputTokenProgram
            )

            const pool = derivePool(NATIVE_MINT, baseMint.publicKey, config, program.programId)
            const baseVault = deriveTokenVaultAddress(
                pool,
                baseMint.publicKey,
                program.programId
            )
            const quoteVault = deriveTokenVaultAddress(
                pool,
                NATIVE_MINT,
                program.programId
            )


            const accounts: SwapAccounts = {
                baseMint: baseMint.publicKey,
                quoteMint: NATIVE_MINT,
                pool: pool,
                baseVault: baseVault,
                quoteVault: quoteVault,
                config: config,
                eventAuthority,
                poolAuthority,
                referralTokenAccount: null,
                inputTokenAccount,
                outputTokenAccount,
                payer: owner,
                tokenBaseProgram: swapBaseForQuote
                    ? inputTokenProgram
                    : outputTokenProgram,
                tokenQuoteProgram: swapBaseForQuote
                    ? outputTokenProgram
                    : inputTokenProgram,
                program: program.programId,
            }

            // Add preInstructions for ATA creation and SOL wrapping
            const preInstructions: TransactionInstruction[] = []

            // Check and create ATAs if needed
            const inputTokenAccountInfo =
                await connection.getAccountInfo(inputTokenAccount)
            if (!inputTokenAccountInfo) {
                preInstructions.push(
                    createAssociatedTokenAccountIdempotentInstruction(
                        owner,
                        inputTokenAccount,
                        owner,
                        inputMint,
                        inputTokenProgram
                    )
                )
            }

            const outputTokenAccountInfo =
                await connection.getAccountInfo(outputTokenAccount)
            if (!outputTokenAccountInfo) {
                preInstructions.push(
                    createAssociatedTokenAccountIdempotentInstruction(
                        owner,
                        outputTokenAccount,
                        owner,
                        outputMint,
                        outputTokenProgram
                    )
                )
            }

            // Add SOL wrapping instructions if needed
            if (isSOLInput) {
                preInstructions.push(
                    ...wrapSOLInstruction(
                        owner,
                        inputTokenAccount,
                        BigInt(amountIn.toString())
                    )
                )
            }

            // Add postInstructions for SOL unwrapping
            const postInstructions: TransactionInstruction[] = []
            if (isSOLInput || isSOLOutput) {
                const unwrapIx = await unwrapSOLInstruction(owner)
                console.log('unwrapIx', unwrapIx)
                if (unwrapIx) {
                    postInstructions.push(unwrapIx as any)
                }
            }

            const swapInstruction = await program.methods
                .swap({
                    amountIn,
                    minimumAmountOut,
                })
                .accounts(accounts)
                .preInstructions(preInstructions)
                .postInstructions(postInstructions)
                .transaction()

            transaction.add(...swapInstruction.instructions)
        }


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

    const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip: number) => {
        const client = new DynamicBondingCurveClient(connection as any)
        const programclient = new DynamicBondingCurveProgramClient(connection as any)

        const poolAddress = await programclient.getPoolAddress(
            NATIVE_MINT,
            // new PublicKey('FEvrgVQbpe775fBxVSixevt1xwh7VH2ZLcBVMqvfGWHw'),
            new PublicKey(token.address as string),
            config
        )


        const quote = await getQoute(amount, type, slip)

        const transaction = await client.pools.swap(
            poolAddress,
            {
                amountIn: new BN(amount),
                minimumAmountOut: new BN(quote).mul(new BN(1 - slip / 1000)),
                swapBaseForQuote: type === 'sell',
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

        // _transaction.add(transaction.instructions[1])
        // _transaction.add(transaction.instructions[0])
        // _transaction.add(transaction.instructions[2])

        const tx = await walletProvider.signAndSendTransaction(transaction, {}, {
            isVersionedTransaction: false,
            canJitoable: true,
            needFeeEstimate: true,
        })

        console.log('tx', tx)

        return tx

    }, [publicKey, walletProvider, token])

    const _getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", isReal: boolean = false) => {
        const client = new DynamicBondingCurveClient(connection as any)
        const programclient = new DynamicBondingCurveProgramClient(connection as any)

        let pool = fakePool
        const poolConfig = await programclient.getPoolConfig(config)
        if (isReal) {
            const poolAddress = await programclient.getPoolAddress(
                NATIVE_MINT,
                // new PublicKey('8dRdXBwhUnRsZKT8gUyMkqJCBJJexioGYdenjzUPgVf8'),
                new PublicKey(token.address as string),
                config
            )
            console.log('poolAddress', poolAddress.toBase58())
    
            pool = await programclient.getPool(poolAddress)
        }

        console.log('pool', pool!)
        console.log('pool.baseReserve', pool!.baseReserve.toString())
        console.log('pool.quoteReserve', pool!.quoteReserve.toString())

        const quote = await client.pools.swapQuote({
            virtualPool: pool,
            config: poolConfig,
            swapBaseForQuote: type === "sell",
            amountIn: new BN(amount),
            hasReferral: false,
            currentPoint: new BN(0)
        })

        console.log('quote', quote.amountOut.toString())

        return quote.amountOut.toString()
    }, [publicKey, walletProvider, token])

    const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
        const quote = await _getQoute(amount, type, true)
        return quote
    }, [_getQoute, token])

    const getQouteBeforeBuy = useCallback(async (amount: string) => {
        const quote = await _getQoute(amount, 'buy', false)
        return quote
    }, [_getQoute])

    return {
        createMint,
        trade,
        getQoute,
        getQouteBeforeBuy
    };
};


const SEED = Object.freeze({
    POOL_AUTHORITY: 'pool_authority',
    EVENT_AUTHORITY: '__event_authority',
    POOL: 'pool',
    TOKEN_VAULT: 'token_vault',
    METADATA: 'metadata',
    PARTNER_METADATA: 'partner_metadata',
    CLAIM_FEE_OPERATOR: 'cf_operator',
    DAMM_V1_MIGRATION_METADATA: 'meteora',
    DAMM_V2_MIGRATION_METADATA: 'damm_v2',
    LP_MINT: 'lp_mint',
    FEE: 'fee',
    POSITION: 'position',
    POSITION_NFT_ACCOUNT: 'position_nft_account',
    LOCK_ESCROW: 'lock_escrow',
    VIRTUAL_POOL_METADATA: 'virtual_pool_metadata',
    ESCROW: 'escrow',
    BASE_LOCKER: 'base_locker',
    VAULT: 'vault',
})

export function deriveEventAuthority(): PublicKey {
    const [eventAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED.EVENT_AUTHORITY)],
        DYNAMIC_BONDING_CURVE_PROGRAM_ID
    )
    return eventAuthority
}


export function derivePoolAuthority(programId: PublicKey): PublicKey {
    const [poolAuthority] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED.POOL_AUTHORITY)],
        programId
    )

    return poolAuthority
}

export function findAssociatedTokenAddress(
    walletAddress: PublicKey,
    tokenMintAddress: PublicKey,
    tokenProgramId: PublicKey
): PublicKey {
    return PublicKey.findProgramAddressSync(
        [
            walletAddress.toBuffer(),
            tokenProgramId.toBuffer(),
            tokenMintAddress.toBuffer(),
        ],
        ASSOCIATED_TOKEN_PROGRAM_ID
    )[0]
}

export function derivePool(
    quoteMint: PublicKey,
    baseMint: PublicKey,
    config: PublicKey,
    programId: PublicKey
): PublicKey {
    const isQuoteMintBiggerThanBaseMint =
        new PublicKey(quoteMint)
            .toBuffer()
            .compare(new Uint8Array(new PublicKey(baseMint).toBuffer())) > 0

    const [pool] = PublicKey.findProgramAddressSync(
        [
            Buffer.from(SEED.POOL),
            new PublicKey(config).toBuffer(),
            isQuoteMintBiggerThanBaseMint
                ? new PublicKey(quoteMint).toBuffer()
                : new PublicKey(baseMint).toBuffer(),
            isQuoteMintBiggerThanBaseMint
                ? new PublicKey(baseMint).toBuffer()
                : new PublicKey(quoteMint).toBuffer(),
        ],
        programId
    )

    return pool
}

export function deriveTokenVaultAddress(
    pool: PublicKey,
    mint: PublicKey,
    programId: PublicKey
): PublicKey {
    const [tokenVault] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED.TOKEN_VAULT), mint.toBuffer(), pool.toBuffer()],
        programId
    )

    return tokenVault
}
