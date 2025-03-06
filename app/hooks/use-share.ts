import Cookies from "js-cookie";
import { httpAuthPost } from "@/app/utils/";
import { useEffect } from "react";
import { useAccount } from "./useAccount";
import { useSearchParams } from "next/navigation";

export function useShare() {
  const { address } = useAccount();
  const searchParams = useSearchParams();

  const reportReferral = async () => {
    const project = searchParams.get("address");
    const user = searchParams.get("from");

    if (project && user) {
      try {
        const v = await httpAuthPost(
          `/project/share?token_address=${project}&account_address=${user}`,
          { token_address: project, account_address: user }
        );
        if (v.code === 0) {
          Cookies.remove("referral_upload_project");
          Cookies.remove("referral_upload_user");
        }
      } catch (err) {
        console.error("Failed to report referral:", err);
      }
    }
  };

  useEffect(() => {
    if (address) {
      reportReferral();
    }
  }, [address]);
}
