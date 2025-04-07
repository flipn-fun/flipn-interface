import { useUserAgent } from "@/app/context/user-agent";
import Image from "next/image";

export default function Claim() {
  const { isMobile } = useUserAgent();

  return (
    <a href="https://claimfreesol.com/A4CFInyv" target="_blank">
      {isMobile ? (
        <img 
          style={{ marginLeft: 16, marginTop: 16, marginRight: 16 }}
          src="/img/mining/claim-mobile.svg"
        />
      ) : (
        <img
          style={{ marginTop: 16 }}
          src="/img/mining/claim-pc.svg" 
        />
      )}
    </a>
  );
}
