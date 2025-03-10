import { httpAuthPut } from "@/app/utils";
import { useState } from "react";
export default function useBindingInviteCode() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [code, setCode] = useState("");

  const onBind = async () => {
    try {
      setLoading(true);
      const response = await httpAuthPut("/airdrop/code", {});
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  return { loading, onBind, code, setCode, errorMsg };
}
