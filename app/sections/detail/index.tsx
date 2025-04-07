"use client";

import { memo, useEffect } from "react";
import Mobile from "./mobile";
import Laptop from "./laptop";
import { useUserAgent } from "@/app/context/user-agent";
import { useSearchParams } from 'next/navigation';
import { useUUID } from "@/app/store/useUUID";

export default memo(function Detail(props: any) {
  const { isMobile } = useUserAgent();
  const search = useSearchParams();
  const from = search.get('from');
  const uuid = search.get('uuid');
  const address = search.get('address');
  const { uuids, set }: any = useUUID();

  useEffect(() => {
    if (uuid && address) {
      set({ uuids: { ...uuids, [address as string]: uuid as string } });
    }
  }, [uuid, address]);

  return isMobile ? <Mobile {...props} from={from} /> : <Laptop {...props} from={from} />;
});
