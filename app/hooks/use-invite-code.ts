import { httpAuthGet } from "@/app/utils";
import { useEffect, useState } from "react";
import { fail, success } from "@/app/utils/toast";

export default function useInviteCodes(accountRefresher: number) {
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

  const onCopyShareLink = async () => {
    if (!codeInfo?.code) return;
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/ref?code=${codeInfo?.code}`
      );
      success("Copied successfully!");
    } catch (err) {
      fail("Copied failed!");
    }
  };

  useEffect(() => {
    if (accountRefresher) onQuery();
  }, [accountRefresher]);

  return {
    codeInfo,
    loading,
    onCopyShareLink,
    onUpdateCode: onQuery
  };
}
