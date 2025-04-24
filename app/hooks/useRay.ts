import {
  TxVersion,
  DEV_LAUNCHPAD_PROGRAM,
  LAUNCHPAD_PROGRAM,
  printSimulate,
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  Raydium,
  getPdaLaunchpadPoolId,
  PlatformConfig,
  Curve,
} from '@raydium-io/raydium-sdk-v2'
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { getPriorityFeeEstimate, useAccount } from './useAccount';
import { ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddressSync, NATIVE_MINT, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { Project } from '../type';

interface Params {
  token: Project;
}

const programId = process.env.NEXT_PUBLIC_NET === 'Mainnet' ? LAUNCHPAD_PROGRAM : DEV_LAUNCHPAD_PROGRAM

export const tokenAddresses: any = {}

async function addComputeBudget(transaction: Transaction) {
  if (process.env.NEXT_PUBLIC_NET === 'Mainnet') {
    const microLamports = await getPriorityFeeEstimate(transaction, '');
    
    // transaction.add(ComputeBudgetProgram.setComputeUnitLimit({ units: 500000 }), ComputeBudgetProgram.setComputeUnitPrice({ microLamports }));
  }
} 

export const useRay = (params: Params | null) => {
  const { connection } = useConnection();
  const { publicKey, walletProvider } = useAccount();
  const raydiumInstance = useRef<any>(null);

  useEffect(() => {
    (async () => {
      if (!publicKey || raydiumInstance.current) return;

      let raydium = await Raydium.load({
        owner: publicKey,
        connection,
        cluster: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? 'mainnet' : 'devnet',
        disableFeatureCheck: true,
        disableLoadToken: true,
        blockhashCommitment: 'finalized',
        // urlConfigs: {
        //   BASE_HOST: '<API_HOST>', // api url configs, currently api doesn't support devnet
        // },
      })

      raydiumInstance.current = raydium;
    })();
  }, []);

  const createMint = useCallback(async (params: Project, amount: string) => {
    if (!raydiumInstance.current) return;

    const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

    const pair = Keypair.generate()
    const mintA = pair.publicKey

    console.log('createMint', configId, programId, LAUNCHPAD_PROGRAM)

    const configData = await raydiumInstance.current.connection.getAccountInfo(configId)

    if (!configData) throw new Error('config not found')

    const configInfo = LaunchpadConfig.decode(configData.data)
    const mintBInfo = await raydiumInstance.current.token.getTokenInfo(configInfo.mintB)

    const inAmount = new BN(amount)
    let createOnly = true
    if (amount && Number(amount) > 0) {
      createOnly = false
    }

    const { builder, extInfo, } = await raydiumInstance.current.launchpad.createLaunchpad({
      programId,
      mintA,
      decimals: params.tokenDecimals,
      name: params.tokenName,
      symbol: params.ticker,
      migrateType: 'amm',
      uri: params.tokenImg,
      supply: new BN('1000000000000000'),
      totalSellA: new BN('800000000000000'),
      configId,
      configInfo: {
        ...configInfo,
        migrateFee: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new BN(3 * (10 ** 9)) : new BN(3 * (10 ** 9)),
        minSupplyA: new BN('1000000000'),
        minFundRaisingB: new BN(1 * (10 ** 9)),
      }, // optional, sdk will get data by configId if not provided
      mintBDecimals: mintBInfo.decimals, // default 9
      /** default platformId is Raydium platform, you can create your platform config in ./createPlatform.ts script */
      platformId: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new PublicKey('C4JeAyndKKqrzcWsF941dUMXacMb8tz8DkjvzVTpgi9T') : new PublicKey('9MJwEH3bWhwTJVvLVjWefTY4SmVqBPJoFR84i8HBbAkD'),
      txVersion: TxVersion.V0,
      slippage: new BN(100), // means 1%
      buyAmount: createOnly ? new BN(1) : inAmount,
      createOnly: createOnly, // true means create mint only, false will "create and buy together"
      totalFundRaisingB: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new BN(43 * (10 ** 9)) : new BN(30 * (10 ** 9)),
      totalLockedAmount: new BN('0'),


      // shareFeeReceiver: new PublicKey('share wallet'), // only works when createOnly=false
      // shareFeeRate: new BN(1000),  // only works when createOnly=false

      // computeBudgetConfig: {
      //   units: 600000,
      //   microLamports: 600000,
      // },
    })

    const microLamports = await getPriorityFeeEstimate(new Transaction({
      feePayer: publicKey,
      recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    }).add(...builder.instructions), '');

    builder.addCustomComputeBudget({
      units: 500000,
      microLamports: microLamports,
    })

    builder.addInstruction({ signers: [pair] })
    const { execute, transaction } = await builder.buildV0()

    console.log('transaction:', transaction)

    const tx = await walletProvider.signAndSendTransaction(transaction, {}, {
      isVersionedTransaction: true,
      canJitoable: false,
      needFeeEstimate: false,
    })

    tokenAddresses[params.tokenName + '-' + params.ticker] = mintA.toBase58()

    console.log('tx: success', tx)

    return tx;
  }, [raydiumInstance.current, publicKey])

  const getQouteBeforeBuy = useCallback(async (amount: string) => {
    if (!raydiumInstance.current || !params) return;

    const inAmount = new BN(amount)

    const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

    const configData = await raydiumInstance.current.connection.getAccountInfo(configId)
    if (!configData) throw new Error('config not found')

    const configInfo = LaunchpadConfig.decode(configData.data)

    const curve = Curve.getCurve(0);
    const initParam = curve.getInitParam({
      supply: new BN('1000000000000000'),
      totalFundRaising: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new BN(43 * (10 ** 9)) : new BN(30 * (10 ** 9)),
      totalSell: new BN('800000000000000'),
      totalLockedAmount: new BN('0'),
      migrateFee: process.env.NEXT_PUBLIC_NET === 'Mainnet' ? new BN(0) : new BN(0),
    });

    const itemBuy = Curve.buyExactIn({
      poolInfo: {
        virtualA: initParam.a,
        virtualB: initParam.b,
        realA: new BN('0'),
        realB: new BN('1'),
        totalFundRaisingB: new BN(0),
        totalSellA: new BN('800000000000000'),
      },
      amountB: inAmount,
      protocolFeeRate: configInfo.tradeFeeRate,
      platformFeeRate: new BN(1125),
      curveType: 0,
      shareFeeRate: new BN(0),
    });

    return itemBuy.amountA.toString()

  }, [raydiumInstance.current, params])

  const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
    if (!raydiumInstance.current || !params) return;

    const mintA = new PublicKey(params.token.address as string)
    const mintB = NATIVE_MINT


    const inAmount = new BN(amount)

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydiumInstance.current.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydiumInstance.current.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)

    const shareFeeReceiver = undefined
    const shareFeeRate = !shareFeeReceiver ? new BN(0) : new BN(10000) // do not exceed poolInfo.configInfo.maxShareFeeRate

    let res: any = null;
    if (type === 'buy') {
      console.log('buy', poolInfo, inAmount)
      console.log('virtualA', poolInfo.virtualA.toString(), poolInfo.virtualB.toString(), poolInfo.realA.toString(), poolInfo.realB.toString())

      console.log('platformInfo', poolInfo.configInfo.tradeFeeRate.toString())

      res = Curve.buyExactIn({
        poolInfo,
        amountB: inAmount,
        // protocolFeeRate: new BN(0),
        // platformFeeRate: new BN(0),
        protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
        platformFeeRate: platformInfo.feeRate,
        curveType: poolInfo.configInfo.curveType,
        shareFeeRate,
      })

      console.log('res', res, res.amountA.toNumber());
      if (res && res.amountA) {
        return res.amountA.toString()
      }
    } else if (type === 'sell') {

      res = Curve.sellExactIn({
        poolInfo,
        amountA: inAmount,
        // protocolFeeRate: new BN(0),
        // platformFeeRate: new BN(0),
        protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
        platformFeeRate: platformInfo.feeRate,
        curveType: poolInfo.configInfo.curveType,
        shareFeeRate,
      })


      console.log('res', res, res.amountB.toNumber());
      if (res && res.amountB) {
        return res.amountB.toString()
      }
    }

    return null

  }, [raydiumInstance.current, params])

  const createPlatform = useCallback(async () => {
    if (!raydiumInstance.current) return;

    const owner = new PublicKey('9Rny1dwV3TvSvx9sxif2pdZJgFFTThg1riPNzNMVGRsP')
    // const owner = publicKey

    const { transaction, extInfo, execute } = await raydiumInstance.current.launchpad.createPlatformConfig({
      programId, // launchpad currently only support in devent
      platformAdmin: publicKey,
      platformClaimFeeWallet: owner,
      platformLockNftWallet: owner,
      migrateCpLockNftScale: {
        platformScale: new BN(400000), // set up your config
        creatorScale: new BN(400000), // set up your config
        burnScale: new BN(200000), // set up your config
      },
      feeRate: new BN(1125), // set up your config
      name: 'Flipn',
      web: 'https://flipn.fun',
      img: 'https://app.flipn.fun/img/create/flip.png',
      txVersion: TxVersion.V0,
      feePayer: publicKey,
      // totalFundRaisingAmount: new BN(1000000000000000000),
      // computeBudgetConfig: {
      //   units: 600000,
      //   microLamports: 600000,
      // },
    })

    console.log(`platformId: ${extInfo.platformId.toBase58()}`)

    const tx = await walletProvider.signAndSendTransaction(transaction, {}, {
      isVersionedTransaction: true,
      canJitoable: false,
      needFeeEstimate: false,
    })

    console.log('tx: success', tx)

    return tx

  }, [raydiumInstance.current])

  const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
    if (!raydiumInstance.current || !params) return;

    const mintA = new PublicKey(params.token.address as string)
    const mintB = NATIVE_MINT

    console.log('trade params', amount, type, slip)

    const programId = process.env.NEXT_PUBLIC_NET === 'Mainnet' ? LAUNCHPAD_PROGRAM : DEV_LAUNCHPAD_PROGRAM
    const inAmount = new BN(amount)

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydiumInstance.current.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydiumInstance.current.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)

    console.log('platformInfo', platformInfo, poolInfo, platformInfo.feeRate.toString())

    const shareFeeReceiver = undefined
    const shareFeeRate = shareFeeReceiver ? new BN(0) : new BN(10000)

    let _transaction: Transaction | undefined
    let _builder: any
    if (type === 'buy') {
      console.log('poolInfo:', poolInfo, poolInfo.realA.toString(), poolInfo.realB.toString())

      const { transaction, extInfo, execute, builder } = await raydiumInstance.current.launchpad.buyToken({
        programId,
        mintA,
        // mintB: poolInfo.configInfo.mintB, // optional, default is sol
        // minMintAAmount: res.amountA, // optional, default sdk will calculated by realtime rpc data
        slippage: new BN(slip || 100),
        configInfo: {
          ...poolInfo.configInfo,
          // protocolFeeOwner: new PublicKey('82gnQysWJCXJZXDJ6oPpjkpdgz5VroPZyzboE6xwBV6D'), // optional
          // migrateFeeOwner: new PublicKey('82gnQysWJCXJZXDJ6oPpjkpdgz5VroPZyzboE6xwBV6D'), // optional
        },
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        buyAmount: inAmount,
        // shareFeeReceiver: new PublicKey('AZpx1fy3wHUYLvqtkNLAAt3J3B22aP87Gk349LA1Liwq'), // optional
        // shareFeeRate: new BN(625),  // optional, do not exceed poolInfo.configInfo.maxShareFeeRate
      })

      _transaction = transaction
      _builder = builder
    } else if (type === 'sell') {
      const { execute, transaction, builder } = await raydiumInstance.current.launchpad.sellToken({
        programId,
        mintA,
        // mintB, // default is sol
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        sellAmount: inAmount,
        // shareFeeReceiver: new PublicKey('9Rny1dwV3TvSvx9sxif2pdZJgFFTThg1riPNzNMVGRsP'), // optional
      })

      _transaction = transaction
      _builder = builder
    }

    const microLamports = await getPriorityFeeEstimate(_transaction as any, '');

    _builder.addCustomComputeBudget({
      units: 500000,
      microLamports: microLamports,
    })

    const tx = await walletProvider.signAndSendTransaction(_transaction, {}, {
      isVersionedTransaction: true,
      canJitoable: true,
      needFeeEstimate: false,
    })

    console.log('tx: success', tx)

    return tx

  }, [raydiumInstance.current, params])

  return {
    createMint,
    getQoute,
    trade,
    createPlatform,
    getQouteBeforeBuy,
    programId,
  }
}


