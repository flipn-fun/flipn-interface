import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/auth";
import { httpAuthGet, httpGet } from "@/app/utils";
import { mapDataToProject } from "@/app/utils/mapTo";

export default function useTokenDetail({ token, cb }: any) {
  const [infoData, setInfoData] = useState<any>();
  const params = useSearchParams();
  const [isLoading, setIsLoading] = useState(!token);
  const { userInfo, accountRefresher } = useAuth();

  const getDetailInfo = useCallback(
    (opts?: { isSkipLoading?: boolean }) => {
      const { isSkipLoading } = opts ?? {};
      const address = params.get("address") || token?.address;
      if (!address) {
        setIsLoading(false);
        return;
      }

      if (!token && !isSkipLoading) {
        setIsLoading(true);
      }

      const httpFn = userInfo?.address ? httpAuthGet : httpGet;

      return httpFn("/project", { address: address })
        .then((res) => {
          if (res.code === 0 && res.data && res.data.length) {
            const infoData = mapDataToProject(res.data[0]);
            setInfoData(infoData);
            cb?.();
          }
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
        });
    },
    [params, userInfo, token]
  );

  useEffect(() => {
    getDetailInfo();
  }, [params, token, accountRefresher]);

  return { infoData, isLoading, getDetailInfo };
}
