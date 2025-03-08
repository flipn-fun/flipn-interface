import { httpAuthPost } from "@/app/utils/";
import { useEffect } from "react";
import { useAuth } from "../context/auth";
import { useSearchParams } from "next/navigation";

export function useShare() {
  const { accountRefresher } = useAuth();
  const searchParams = useSearchParams();

  const reportReferral = async () => {
    const project = searchParams.get("address");
    const user = searchParams.get("from");

    if (project && user) {
      try {
        await httpAuthPost(
          `/project/share?token_address=${project}&account_address=${user}`,
          { token_address: project, account_address: user }
        );
      } catch (err) {
        console.error("Failed to report referral:", err);
      }
    }
  };

  useEffect(() => {
    if (accountRefresher) {
      reportReferral();
    }
  }, [accountRefresher]);
}
