"use client";

import { memo, useCallback } from "react";
import Mobile from "./mobile";
import { useUserAgent } from "@/app/context/user-agent";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { httpGet, sleep } from "@/app/utils";
import { useMessage } from "@/app/context/messageContext";
import { mapDataToProject } from "@/app/utils/mapTo";
import { useTokenTrade } from "@/app/hooks/useTokenTrade";
import { tokenAddresses } from "@/app/hooks/useRay";

export default memo(function Create(props: any) {
  const router = useRouter();
  const { isMobile } = useUserAgent();
  const { showShare } = useMessage();

  const { tokenInfo } = useTokenTrade({
    tokenName: props.token.tokenName,
    tokenSymbol: props.token.tokenSymbol,
    tokenDecimals: props.token.tokenDecimals,
    loadData: false
  })

  const share = useCallback(async () => {
    if (tokenInfo) {
      let tokenAddress = ''
      if (props.token.platform.name === 'Raydium') {
        tokenAddress = tokenAddresses[props.token.tokenName + '-' + props.token.tokenSymbol.toUpperCase()]
      } else {
        tokenAddress = tokenInfo![0].toBase58()
      }
      let v
      let sum = 100

      do {
        await sleep(1000)
        v = await httpGet("/project?address=" + tokenAddress);  
        sum--
        console.log('sum:', sum)
      } while ((v.code !== 0 || !v.data || v.data.length === 0 || v.data.status === 0) && sum > 0)

      if (v.code === 0 && v.data?.length > 0) {
        const data = v.data[0];
        showShare(mapDataToProject(data), true, () => {
          router.push("/detail?address=" + tokenAddress);
        })
      } else {
        router.push("/")
      }
    }
  }, [tokenInfo]);

  return (
    <>
      <Mobile {...props} setShowSuccessModal={share} />
    </>
  );
});
