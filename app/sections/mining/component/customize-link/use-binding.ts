import { httpAuthPut } from "@/app/utils";
import { fail, success } from "@/app/utils/toast";
import { useState } from "react";
export default function useBindingInviteCode(onSuccess: Function) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [code, setCode] = useState("");

  const onBind = async () => {
    try {
      setLoading(true);
      const response = await httpAuthPut(`/airdrop/code?code=${code}`);
      if (response.code === 0) {
        success("Customize successfully");
        onSuccess();
        return;
      }
      if (response.message) {
        setErrorMsg(response.message);
      }
    } catch (err) {
      fail("Customize failed");
    } finally {
      setLoading(false);
    }
  };

  return { loading, onBind, code, setCode, errorMsg };
}
