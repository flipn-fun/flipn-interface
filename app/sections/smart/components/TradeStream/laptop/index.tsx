import React, { useState, useEffect, useMemo } from "react";
import styles from "./index.module.css";
import {
  CopyierIconWithBg,
  TopTraderCrown,
  ShareTitleIcon,
  TopTradersWithArrow
} from "@/app/sections/trends/components/top-traders/icons";
import { defaultAvatar } from "@/app/utils/config";
import { formatAddress} from "@/app/utils";
import { useRouter } from 'next/navigation';
import useUserInfo from '@/app/hooks/useUserInfo';
import CopyTrade from '@/app/services/copyTrade';
import { SmartMoneyAddress, CopyTraderAddress } from '@/app/services/copyTrade';
import StarGraph from '../../StarGraph';
import { SHOW_COPY_TRADE } from '@/app/utils/config';
import CoppiedModalPc from '@/app/sections/profile/components/coppiedActionPc';
import { numberFormatter } from '@/app/utils/common';
import Big from 'big.js';
import { fecthUserInfo } from '@/app/utils/getUserInfo';

interface SatelliteNode {
  id: string;
  name: string;
  image: string;
  pnl: number;
}

export default function TradeStreamPC(params:any) {
    const router = useRouter();
    const streamInfo = params.streamInfo;
    const address = streamInfo.topTraderAddress;
    const isOther = streamInfo.isOther;
    const { userInfo: currentUserInfo } = useUserInfo(address || "");
    const CopyTradeService = new CopyTrade();
    const [smartMoniesInfo, setSmartMoniesInfo] = useState<SmartMoneyAddress | null>(null);
    const [copyTradersUserInfo, setCopyTradersUserInfo] = useState<CopyTraderAddress | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [refreshNum, setRefreshNum] = useState(0);
    const [copierImages, setCopierImages] = useState<string[]>([]);
    const [satelliteNodes, setSatelliteNodes] = useState<SatelliteNode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    
    const getUserInfoWithCache = useMemo(() => {
      const cache = new Map<string, any>();
      return async (address: string) => {
        if (cache.has(address)) {
          return cache.get(address);
        }
        const info = await fecthUserInfo(address);
        cache.set(address, info);
        return info;
      };
    }, []);

  useEffect(() => {
    const loadCopierImages = async () => {
      if (!smartMoniesInfo?.copiers?.length) return;

      const copierAddresses = smartMoniesInfo.copiers;
      const copierInfos = await Promise.all(
        copierAddresses.map((copier) => getUserInfoWithCache(copier))
      );

      const images = copierInfos.map((info) => info?.icon).filter(Boolean); // Remove any undefined/null values

      setCopierImages(images);
    };

    loadCopierImages();
  }, [smartMoniesInfo?.copiers, getUserInfoWithCache]);

  const getSmartMoniesInfo = async () => {
    if (address) {
      const { data } = await CopyTradeService.getSmartMoniesAddress({
        address,
        chain: "solana"
      });
      setSmartMoniesInfo(data);
    }
  };
  const getCopyTradersUserInfo = async () => {
    if (address) {
      try {
        const { data } = await CopyTradeService.getCopyTradersUserInfo({
          address,
          chain: "solana"
      });
      setCopyTradersUserInfo(data);
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    setIsLoading(true);
    getSmartMoniesInfo();
    getCopyTradersUserInfo();
  }, [address]);

  const formatPnl = (pnl: string) => {
    if (pnl == "0") {
      return "0";
    }
    if (pnl.startsWith("-")) {
      return "-" + numberFormatter(Math.abs(Number(pnl)), 2, true);
    }
    return "+" + numberFormatter(pnl, 2, true);
  };

  const formatWinRate = (winRate: string) => {
    if (winRate == "0") {
      return "0%";
    }
    return new Big(winRate).times(100).toFixed(1) + "%";
  };

  const isGtZero = (str: string) => {
    return Number(str) >= 0;
  };

  const getUserInfo: any = async (address: string) => {
    if (!address) return null;
    const userInfo = await fecthUserInfo(address);
    return userInfo;
  };

  const centerNode = useMemo(() => ({
    id: currentUserInfo?.address || "",
    name: currentUserInfo?.name || formatAddress(currentUserInfo?.address || ""),
    image: currentUserInfo?.icon || defaultAvatar
  }), [currentUserInfo?.address, currentUserInfo?.name, currentUserInfo?.icon]);

  useEffect(() => {
    const loadSatellites = async () => {
      if (!smartMoniesInfo?.topCopiers?.length) return;
      
      const nodes = await Promise.all(
        smartMoniesInfo.topCopiers.map(async (item: any) => {
          const userInfo = await getUserInfoWithCache(item.address);
          return {
            id: item.address,
            name: userInfo?.name || formatAddress(item.address || ""),
            image: userInfo?.icon || defaultAvatar,
            pnl: item.pnl
          };
        })
      );
      
      setSatelliteNodes(nodes);
    };

    loadSatellites();
  }, [smartMoniesInfo?.topCopiers, getUserInfoWithCache]);


  return (
      <div className={styles.container} style={{width: streamInfo?.wrapperWidth || '100vw', height: streamInfo?.wrapperHeight || '100vh' }}>
      {/* charts */}
      <StarGraph centerNode={centerNode} satellites={satelliteNodes} GrapWidth={streamInfo?.wrapperWidth} GrapHeight={streamInfo?.wrapperHeight - 305}/>
      {/* performance */}
      <div className={styles.performance}>
        <ShareTitleIcon style={{ position: "absolute", top: "-20px", left: "0px"}}/>
     
       <div className={styles.performanceContent}>
        <div className={styles.topTradersIcon}>
            <TopTradersWithArrow />
        </div>

        <div className={styles.topTradersInfo}>
            <img className={styles.avatar} src={currentUserInfo?.icon || defaultAvatar} alt="" />
            <div className={styles.topTradersInfoNameContent}>
              <div className={styles.topTradersInfoName}>
                {currentUserInfo?.name || formatAddress(currentUserInfo?.address || "")}
              </div>
              <div>
                <TopTraderCrown />
              </div>
            </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <div className={styles.label}>7D PnL</div>
            <div className={styles.value}>
              <span className={isGtZero(smartMoniesInfo?.pnl7D || "0") ? styles.amount : styles.amountLessThanZero}>
                {formatPnl(smartMoniesInfo?.pnl7D || "0")}
              </span>
              <span className={styles.unit}>SOL</span>
            </div>
          </div>
          <div className={styles.gridItem}>
            <div className={styles.label}>7D Win Rate</div>
            <div className={styles.value}>
              {formatWinRate(smartMoniesInfo?.winRate7D || "0")}
            </div>
          </div>

          <div className={styles.gridItem}>
            <div className={styles.label}>Buy/sell</div>
            <div className={styles.value}>
              <span className={styles.amount}>
                {copyTradersUserInfo?.tradeInfo?.buys || 0}
              </span>
              <span>/</span>
              <span className={styles.sellAmount}>
                {copyTradersUserInfo?.tradeInfo?.sells || 0}
              </span>
            </div>
          </div>
        </div>

        {/* copier */}
          <div className={styles.copierDetail}>
            <div className={styles.copierAmount}>
              <CopyierIconWithBg />
              <span>
                {smartMoniesInfo?.copiers?.length || 0}
              </span>
            </div>
            <div className={styles.copierTokenImgContent}>
              {copierImages.map((imageUrl, index) => (
                <img
                  key={"sate" + index}
                  className={styles.copierTokenImg}
                  alt="copier tokens"
                  src={imageUrl || defaultAvatar}
                />
              ))}
            </div>
          </div>
        </div>


      {/* button */}
      {isOther && (
          <div className={styles.btnGroup}>
            <div
              className={styles.btnProfile}
              onClick={() => {
                router.push("/smartTopDetail?address=" + address);
              }}
            >
              Details
            </div>
            <div
              className={styles.btnCopyTrade}
              onClick={() => {
                setShowModal(true);
              }}
            >
              Copy Trade
            </div>
          </div>
        )}
      </div>
    
    {SHOW_COPY_TRADE && (
            <CoppiedModalPc
              copiedInfo={currentUserInfo}
              address={address}
              show={showModal}
              onClose={() => {
                setShowModal(false);
                setRefreshNum(refreshNum + 1);
              }}
            />
          )}


    </div>
  );
}
