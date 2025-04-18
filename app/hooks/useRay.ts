import {
  TxVersion,
  DEV_LAUNCHPAD_PROGRAM,
  printSimulate,
  getPdaLaunchpadConfigId,
  LaunchpadConfig,
  Raydium,
  getPdaLaunchpadPoolId,
  PlatformConfig,
  Curve,
} from '@raydium-io/raydium-sdk-v2'
import { useConnection } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from './useAccount';
import { NATIVE_MINT } from '@solana/spl-token';
import { BN } from '@coral-xyz/anchor';
import { Keypair, PublicKey, VersionedTransaction } from '@solana/web3.js';
import { Project } from '../type';
import { number } from 'echarts';

interface Params {
    token: Project;
}

export const tokenAddresses: any = {}
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

    const programId = DEV_LAUNCHPAD_PROGRAM // currently only support in devent

    const configId = getPdaLaunchpadConfigId(programId, NATIVE_MINT, 0, 0).publicKey

    const pair = Keypair.generate()
    const mintA = pair.publicKey

    const configData = await raydiumInstance.current.connection.getAccountInfo(configId)

    if (!configData) throw new Error('config not found')

    const configInfo = LaunchpadConfig.decode(configData.data)
    const mintBInfo = await raydiumInstance.current.token.getTokenInfo(configInfo.mintB)

    const inAmount = new BN(amount)
    let createOnly = true
    if (amount && Number(amount) > 0) {
      createOnly = false
    }

    const { builder, extInfo } = await raydiumInstance.current.launchpad.createLaunchpad({
      programId,
      mintA,
      decimals: params.tokenDecimals,
      name: params.tokenName,
      symbol: params.ticker,
      migrateType: 'amm',
      uri: params.tokenImg,

      configId,
      configInfo: {
        ...configInfo,
        // minSupplyA: new BN(20000000),
      }, // optional, sdk will get data by configId if not provided
      mintBDecimals: mintBInfo.decimals, // default 9
      /** default platformId is Raydium platform, you can create your platform config in ./createPlatform.ts script */
      // platformId: new PublicKey('your platform id'),
      txVersion: TxVersion.V0,
      slippage: new BN(100), // means 1%
      buyAmount: createOnly ? new BN(1) : inAmount,
      createOnly: createOnly, // true means create mint only, false will "create and buy together"

      // shareFeeReceiver: new PublicKey('share wallet'), // only works when createOnly=false
      // shareFeeRate: new BN(1000),  // only works when createOnly=false

      // computeBudgetConfig: {
      //   units: 600000,
      //   microLamports: 600000,
      // },
    })

    builder.addInstruction({ signers: [pair] })
    const { execute, transaction } = await builder.buildV0()

    const tx = await walletProvider.signAndSendTransaction(transaction, {}, {
      isVersionedTransaction: true,
      canJitoable: true,
      needFeeEstimate: false,
    })

    tokenAddresses[params.tokenName + '-' + params.ticker] = mintA.toBase58()

    console.log('tx: success', tx)

    return tx;
  }, [raydiumInstance.current, publicKey])

  const getQoute = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
    if (!raydiumInstance.current || !params) return;
    
    const mintA = new PublicKey(params.token.address as string)
    const mintB = NATIVE_MINT

    const programId = DEV_LAUNCHPAD_PROGRAM
    const inAmount = new BN(amount)

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydiumInstance.current.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydiumInstance.current.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)
  
    const shareFeeReceiver = undefined
    const shareFeeRate = shareFeeReceiver ? new BN(0) : new BN(10000) // do not exceed poolInfo.configInfo.maxShareFeeRate

    const res = Curve.buyExactIn({
      poolInfo,
      amountB: inAmount,
      protocolFeeRate: poolInfo.configInfo.tradeFeeRate,
      platformFeeRate: platformInfo.feeRate,
      curveType: poolInfo.configInfo.curveType,
      shareFeeRate,
    })

    console.log('res', res)

    if (res && res.amountA) {
      return res.amountA.toString()
    }

    return null

  }, [raydiumInstance.current, params])

  const trade = useCallback(async (amount: string, type: "buy" | "sell" = "buy", slip?: number) => {
    if (!raydiumInstance.current || !params) return;

    const mintA = new PublicKey(params.token.address as string)
    const mintB = NATIVE_MINT

    console.log('trade params', amount, type, slip)

    const programId = DEV_LAUNCHPAD_PROGRAM
    const inAmount = new BN(amount)

    const poolId = getPdaLaunchpadPoolId(programId, mintA, mintB).publicKey
    const poolInfo = await raydiumInstance.current.launchpad.getRpcPoolInfo({ poolId })
    const data = await raydiumInstance.current.connection.getAccountInfo(poolInfo.platformId)
    const platformInfo = PlatformConfig.decode(data!.data)

    console.log('poolId', poolId.toBase58())
  
    const shareFeeReceiver = undefined
    const shareFeeRate = shareFeeReceiver ? new BN(0) : new BN(10000) 

    let _transaction: VersionedTransaction | undefined

    if (type === 'buy') {
      console.log('poolInfo:', poolInfo)

      const { transaction, extInfo, execute } = await raydiumInstance.current.launchpad.buyToken({
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
        // shareFeeReceiver: new PublicKey('82gnQysWJCXJZXDJ6oPpjkpdgz5VroPZyzboE6xwBV6D'), // optional
        // shareFeeRate: new BN(100),  // optional, do not exceed poolInfo.configInfo.maxShareFeeRate
      })

      _transaction = transaction
    } else if (type === 'sell') {
      const { execute, transaction, builder } = await raydiumInstance.current.launchpad.sellToken({
        programId,
        mintA,
        // mintB, // default is sol
        configInfo: poolInfo.configInfo,
        platformFeeRate: platformInfo.feeRate,
        txVersion: TxVersion.V0,
        sellAmount: inAmount,
        shareFeeReceiver: new PublicKey('9Rny1dwV3TvSvx9sxif2pdZJgFFTThg1riPNzNMVGRsP'), // optional
      })

      _transaction = transaction
    }

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
    programId: DEV_LAUNCHPAD_PROGRAM,
  }
}


