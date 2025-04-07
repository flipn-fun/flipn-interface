import { useUserAgent } from "@/app/context/user-agent";
import Image from "next/image";

export default function Claim() {
  const { isMobile } = useUserAgent();

  return (
    <a href="https://claimfreesol.com/A4CFInyv" target="_blank">
      {isMobile ? (
        <img 
          style={{ marginLeft: 16, width: 'calc(100% - 32px)', marginTop: 16 }}
          src="/img/mining/claim-mobile.svg"
        />
      ) : (
        <img
          style={{ marginTop: 16, width: '100%' }}
          src="/img/mining/claim-pc.png" 
        />
      )}
    </a>
  );
}
