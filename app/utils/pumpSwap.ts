import { ComputeBudgetProgram, Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token';
import { createTransaction, sendAndConfirmTransactionWrapper, bufferFromUInt64 } from '../hooks/utils';
import { GLOBAL, FEE_RECIPIENT, SYSTEM_PROGRAM_ID, RENT, PUMP_FUN_ACCOUNT, PUMP_FUN_PROGRAM, ASSOC_TOKEN_ACC_PROG } from '@/app/utils/config';
import { Idl, Program } from '@coral-xyz/anchor';
import IDL from '@/app/hooks/pump.json';
import Big from 'big.js';

export async function pumpFunBuy(mintStr: string, solIn: number, slippageDecimal: number = 0.25, connection: Connection, walletProvider: any) {
    try {
        
        const { virtualTokenReserves, virtualSolReserves, bondingCurve, associatedBondingCurve } = await getCoinData(mintStr, connection)

        const owner = walletProvider.publicKey;
        const mint = new PublicKey(mintStr);

        const txBuilder = new Transaction();

        const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            owner,
            false
        );

        let tokenAccountInfo
        try {
            tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
        } catch (e) { }

        let tokenAccount: PublicKey;
        if (!tokenAccountInfo) {
            txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    owner,
                    tokenAccountAddress,
                    owner,
                    mint
                )
            );
            tokenAccount = tokenAccountAddress;
        } else {
            tokenAccount = tokenAccountAddress;
        }

        const solInLamports = solIn * LAMPORTS_PER_SOL;

        const tokenOut = new Big(solInLamports).mul(1 - 0.01).mul(virtualTokenReserves).div(virtualSolReserves).toFixed(0, 0);

        const maxSolCost = Math.floor(solInLamports * (1 + slippageDecimal));

        const ASSOCIATED_USER = tokenAccount;
        const USER = owner;
        // const BONDING_CURVE = new PublicKey(coinData['bonding_curve']);
        // const ASSOCIATED_BONDING_CURVE = new PublicKey(coinData['associated_bonding_curve']);

        const keys = [
            { pubkey: GLOBAL, isSigner: false, isWritable: false },
            { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
            { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
            { pubkey: ASSOCIATED_USER, isSigner: false, isWritable: true },
            { pubkey: USER, isSigner: false, isWritable: true },
            { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: RENT, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
        ];

        const data = Buffer.concat([
            bufferFromUInt64("16927863322537952870"),
            bufferFromUInt64(tokenOut),
            bufferFromUInt64(maxSolCost)
        ]);

        const instruction = new TransactionInstruction({
            keys: keys,
            programId: PUMP_FUN_PROGRAM,
            data: data
        });

        txBuilder.add(instruction);

        const hash = await walletProvider.signAndSendTransaction(txBuilder)

        console.log('hash', hash)

        return hash

    } catch (error) {
        console.log(error);
    }
}


export async function pumpFunSell(mintStr: string, tokenBalance: number, slippageDecimal: number = 0.25, connection: Connection, walletProvider: any) {
    try {
        const { virtualTokenReserves, virtualSolReserves, bondingCurve, associatedBondingCurve } = await getCoinData(mintStr, connection)

        const owner = walletProvider.publicKey;
        const mint = new PublicKey(mintStr);
        const txBuilder = new Transaction();

        const tokenAccountAddress = await getAssociatedTokenAddress(
            mint,
            owner,
            false
        );

        const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);

        let tokenAccount: PublicKey;
        if (!tokenAccountInfo) {
            txBuilder.add(
                createAssociatedTokenAccountInstruction(
                    owner,
                    tokenAccountAddress,
                    owner,
                    mint
                )

            );
            tokenAccount = tokenAccountAddress;
        } else {
            tokenAccount = tokenAccountAddress;
        }

        const minSolOutput = new Big(tokenBalance).mul(1 - slippageDecimal).mul(virtualSolReserves).div(virtualTokenReserves).mul(1 - 0.01).toFixed(0, 0);

        const keys = [
            { pubkey: GLOBAL, isSigner: false, isWritable: false },
            { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: bondingCurve, isSigner: false, isWritable: true },
            { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
            { pubkey: tokenAccount, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: false, isWritable: true },
            { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: ASSOC_TOKEN_ACC_PROG, isSigner: false, isWritable: false },
            { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_ACCOUNT, isSigner: false, isWritable: false },
            { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false }
        ];

        const data = Buffer.concat([
            bufferFromUInt64("12502976635542562355"),
            bufferFromUInt64(tokenBalance),
            bufferFromUInt64(minSolOutput)
        ]);

        const instruction = new TransactionInstruction({
            keys: keys,
            programId: PUMP_FUN_PROGRAM,
            data: data
        });
        txBuilder.add(instruction);

        const hash = await walletProvider.signAndSendTransaction(txBuilder)

        console.log('hash', hash)

        return hash
    }

    catch (error) {
        console.log(error)
    }
}


export async function getCoinData(mintStr: string, connection: Connection) {
    const program = new Program(IDL as Idl, PUMP_FUN_PROGRAM, {
        connection
    });

    const mintAddressPublicKey = new PublicKey(mintStr)
    const bondingCurve = getBondingCurveAddress(mintAddressPublicKey);
    const associatedBondingCurve = getAssociatedBondingCurveAddress(bondingCurve, mintAddressPublicKey);
    const accountData: any = await program.account.bondingCurve.fetch(bondingCurve);

    return {
        bondingCurve,
        associatedBondingCurve,
        virtualSolReserves: accountData.virtualSolReserves.toNumber(),
        virtualTokenReserves: accountData.virtualTokenReserves.toNumber(),
    }
}

// Helper function to get the bonding curve address
const getBondingCurveAddress = (mintAddress: PublicKey): PublicKey => {
    const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from('bonding-curve'), mintAddress.toBytes()],
        PUMP_FUN_PROGRAM,
    );
    return bondingCurve;
};


// Helper function to get the associated bonding curve address
const getAssociatedBondingCurveAddress = (bondingCurveAddress: PublicKey, mintAddress: PublicKey): PublicKey => {
    const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurveAddress.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintAddress.toBytes()],
        ASSOC_TOKEN_ACC_PROG,
    );
    return associatedBondingCurve;
};