import { BN } from '@coral-xyz/anchor';
import type { Project } from '../type';
import { useAccount } from "./useAccount";
import { VirtualCurveClient, PoolService, TokenType, VirtualCurveProgramClient, PartnerService, U64_MAX, MAX_SQRT_PRICE } from "@meteora-ag/virtual-curve-sdk";
import { NATIVE_MINT } from '@solana/spl-token';
import { useConnection } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, Transaction, TransactionMessage, VersionedTransaction } from '@solana/web3.js';
import { useCallback, useEffect } from 'react';

export const useMeteoraToken = () => {
    const { publicKey, walletProvider } = useAccount();
    const { connection } = useConnection()


    //   useEffect(() => {
    //     const client = new VirtualCurveClient(connection)

    //     console.log('client', client)
    //   }, [])

    const createMint = useCallback(async () => {
        const client = new VirtualCurveProgramClient(connection)
        const poolService = new PoolService(client)

        const baseMint = Keypair.generate()
        const creator = publicKey!

        const transaction = await poolService.createPool({
            quoteMint: NATIVE_MINT,
            baseMint: baseMint.publicKey,
            config: new PublicKey('E2LQe6Xg5SLSnSECzxNjiNgHj1wxKuX5ieXBGNUMveYF'),
            baseTokenType: TokenType.SPL,
            quoteTokenType: TokenType.SPL,
            name: 'Test Pool',
            symbol: 'TPOOL',
            uri: 'https://example.com/metadata.json',
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
            canJitoable: true,
            needFeeEstimate: false,
        })

        console.log('tx', tx)
    }, [publicKey, walletProvider])

    const createConfig = useCallback(async () => {
        const client = new VirtualCurveProgramClient(connection)
        const partnerService = new PartnerService(client)
        const config = Keypair.generate()
        const feeClaimer = publicKey!
        const owner = publicKey!
        const quoteMint = NATIVE_MINT
        const payer = publicKey!

        console.log('config', config.publicKey.toBase58())

        const curves = []
        for (let i = 1; i <= 20; i++) {
          curves.push({
              sqrtPrice: MAX_SQRT_PRICE.muln(i * 5).divn(100),
              liquidity: U64_MAX.shln(30 + i),
          });
        }

        // Execute
        const transaction = await partnerService.createConfig({
            config: config.publicKey,
            feeClaimer,
            owner,
            quoteMint,
            payer,
            migrationQuoteThreshold: new BN('3750000000000'),
            collectFeeMode: 0,
            curve: curves,
            activationType: 0,
            partnerLockedLpPercentage: 100,
            partnerLpPercentage: 0,
            creatorLockedLpPercentage: 0,
            creatorLpPercentage: 0,
            poolFees: {
                baseFee: {
                    cliffFeeNumerator: new BN(10000000),
                    periodFrequency: new BN(0),
                    reductionFactor: new BN(0),
                    numberOfPeriod: 0,
                    feeSchedulerMode: 0,
                },
                dynamicFee: {
                    binStep: 1,
                    binStepU128: new BN('1844674407370955'),
                    filterPeriod: 10,
                    decayPeriod: 120,
                    reductionFactor: 3000,
                    maxVolatilityAccumulator: 100000,
                    variableFeeControl: 100000,
                },
            },
            migrationOption: 0,
            tokenDecimal: 9,
            tokenType: 0,
            sqrtStartPrice: new BN('195078983761054748'),
            padding: [],
            lockedVesting: {
                amountPerPeriod: new BN(0),
                cliffDurationFromMigrationTime: new BN(0),
                frequency: new BN(0),
                numberOfPeriod: new BN(0),
                cliffUnlockAmount: new BN(0),
            },
            migrationFeeOption: 0,
        })

        const latestBlockhash = await connection?.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash!.blockhash;

        const message = new TransactionMessage({
            payerKey: publicKey!, // Public key of the account paying for the transaction
            recentBlockhash: latestBlockhash.blockhash, // Blockhash of the most recent block
            instructions: transaction.instructions, // Instructions to be included in the transaction
        }).compileToV0Message([])

        const versionedTransaction = new VersionedTransaction(message)

        versionedTransaction.sign([config])

        console.log('versionedTransaction', versionedTransaction)
        // transaction.addSignature(config.publicKey, Buffer.from([]))

        const tx = await walletProvider.signAndSendTransaction(versionedTransaction, {}, {
            isVersionedTransaction: true,
            canJitoable: true,
            needFeeEstimate: false,
        })

        console.log('tx', tx)

    }, [publicKey, walletProvider])

    const trade = useCallback(async () => {
        const client = new VirtualCurveProgramClient(connection)
        const poolService = new PoolService(client)

        console.log('poolService', poolService)

        const virtualPoolState = await client.getPool(
            connection,
            'FSzD8CrMnGAKg5wJGZ1ABXoRPgMzWUKSv1TfkuihUHd2'
        )
       

        const poolConfigState = await client.getPoolConfig(
            connection,
            virtualPoolState!.config
        )

        console.log('poolConfigState', poolConfigState, virtualPoolState)

        // const pool = await poolService.getPool(connection, 'FSzD8CrMnGAKg5wJGZ1ABXoRPgMzWUKSv1TfkuihUHd2')

        const transaction = await poolService.swap(
            new PublicKey('FSzD8CrMnGAKg5wJGZ1ABXoRPgMzWUKSv1TfkuihUHd2'),
            {
                amountIn: new BN(1000000),
                minimumAmountOut: new BN(900000),
                swapBaseForQuote: false,
                owner: publicKey!,
            },
            connection
        )

        const _transaction = new Transaction()

        _transaction.add(transaction.instructions[1])
        _transaction.add(transaction.instructions[2])
        _transaction.add(transaction.instructions[3])
        _transaction.add(transaction.instructions[4])
        _transaction.add(transaction.instructions[0])
        _transaction.add(transaction.instructions[5])

        console.log('transaction', transaction)

        const tx = await walletProvider.signAndSendTransaction(_transaction, {}, {
            isVersionedTransaction: false,
            canJitoable: true,
            needFeeEstimate: false,
        })

        console.log('tx', tx)
        
    }, [publicKey, walletProvider])  

    const getQoute = useCallback(async () => {
      const client = new VirtualCurveProgramClient(connection)

      const poolConfig = await client.getPoolConfig(
          connection,
          new PublicKey('FAxXAjXYyEYrtBD9Fgqyo3LiMBrENPc4Fuzs8opWBcLv')
      )

      const pool = await client.getPool(
          connection,
          new PublicKey('FSzD8CrMnGAKg5wJGZ1ABXoRPgMzWUKSv1TfkuihUHd2')
      )

      const quote = await client.swapQuote(
          pool!,
          poolConfig,
          false,
          new BN(1000000),
          false,
          new BN(0)
      )

      console.log('quote', quote.amountOut.toString())
  }, [])

    return {
        createMint,
        createConfig,
        trade,
        getQoute
    };
};