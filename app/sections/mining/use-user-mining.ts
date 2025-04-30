import { httpAuthGet, httpAuthPost } from "@/app/utils";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";

export default function useUserMining() {
  const { accountRefresher, userInfo } = useAuth();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onQuery = async () => {
    try {
      setLoading(true);
      const response = await httpAuthGet("/account/mining");
      let clime_created = false;
      let RaydiumFeeResponse = null;
      try {
        const pointsResponse = await httpAuthGet(
          `/airdrop/account/level_points?account=${userInfo.address}`
        );
 
        RaydiumFeeResponse = await httpAuthGet(
          `/account/launchpad/fee?token=So11111111111111111111111111111111111111112`
        )

        clime_created = Number(pointsResponse?.data?.points) > 0;
      } catch (err) {}

      setInfo({
        ...response.data,
        clime_created,
        RaydiumFee: RaydiumFeeResponse?.data || 0
      });
    } catch (err) {
      console.log("err:", err);
    } finally {
      setLoading(false);
    }
  };

  const claimRaydiumFee = async (amount: number) => {
    try {
      const response = await httpAuthPost(`/account/launchpad/fee/claim?token=So11111111111111111111111111111111111111112&amount=${amount}`);
      if (response.code === 0) {
        onQuery();
      }
    } catch (err) {
      console.log("err:", err);
    }
  };

  useEffect(() => {
    if (accountRefresher) onQuery();
  }, [accountRefresher]);

  return {
    info,
    loading,
    onQuery,
    claimRaydiumFee
  };
}
