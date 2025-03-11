import React from 'react'
import { useUserAgent } from '@/app/context/user-agent'
import TradeStreamMobile from './mobile'
import TradeStreamPC from './laptop'
interface TradeStreamProps {
    streamInfo: {
        topTraderAddress: string;
        isOther: boolean;
        wrapperWidth?: number;
        wrapperHeight?: number;
    }
}

export default function TradeStream(params: TradeStreamProps) {
  const { isMobile } = useUserAgent();
  return (
    <div>
      {isMobile ? <TradeStreamMobile  streamInfo={params.streamInfo}/> : <TradeStreamPC streamInfo={params.streamInfo}/>}
    </div>
  )
}
