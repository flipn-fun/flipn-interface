"use client";
import { Button } from "antd-mobile";
import { useRay } from "../../hooks/useRay";
import { useState } from "react";
export default function RaydiumTest() {
  const [paltformId, setPlatformId] = useState()

  const { createPlatform } = useRay({
    token: {
      tokenDecimals: 6,
      tokenName: "SOL12",
      tokenSymbol: "SOL12",
      about: '',
      ticker: "SOL12",
      tokenImg: "/img/home/solana.png",
    },
  });



  return <div>
    
    <Button onClick={async () => {
      const platformId = await createPlatform()
      setPlatformId(platformId)
    }}>Create raydium EvZRp56QkDXxBE25DitmEBnRBtgzRc5oQohv6eYHUSyP config</Button>

    <div style={{ color: '#fff', padding: 20 }}>{ paltformId }</div>
  </div>;
}
