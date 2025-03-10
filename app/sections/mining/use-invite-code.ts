import { httpAuthGet } from "@/app/utils";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/context/auth";
import { fail, success } from "@/app/utils/toast";

export default function useInviteCodes() {
  const { accountRefresher } = useAuth();
  const [codeInfo, setCodeInfo] = useState<any>();
  const [loading, setLoading] = useState(false);

  const onQuery = async () => {
    try {
      setLoading(true);
      const response = await httpAuthGet("/airdrop/code");
      setCodeInfo(response.data.code_list[0]);
    } catch (err) {
      setCodeInfo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountRefresher) onQuery();
  }, [accountRefresher]);

  return {
    codeInfo,
    loading
  };
}
