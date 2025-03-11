import React, { useContext, useEffect, useState } from "react";
import { httpAuthGet } from "@/app/utils";
import { useAccount } from "@/app/hooks/useAccount";
import { useAuth } from "@/app/context/auth";
import { usePathname, useSearchParams } from 'next/navigation';
import { useDebounceFn } from "ahooks";
import { useReferralStore } from '@/app/store/useReferral';
import { useUser } from '@/app/store/useUser';
import Cookies from 'js-cookie';
import { UN_REDIRECT_PATH } from '@/app/config/invite';

const AirdropContext = React.createContext<Partial<IAirdropContext>>({});

export const AirdropContextProvider: React.FC<any> = ({ children }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setReferral } = useReferralStore();
  const { setReferer } = useUser();

  const isTerms = ["/privacy-policy", "/terms-and-conditions"].includes(
    pathname
  );

  const [airdropUserData, setAirdropUserData] = useState<any>();
  const [airdropDataLoading, setAirdropDataLoading] = useState(true);

  const { run: goToInviteCodeDelay, cancel: goToInviteCodeDelayCancel } =
    useDebounceFn(
      () => {
        setAirdropDataLoading(false);
        if (checkUnRedirectPathname(pathname) || isTerms) return;
        const _searchParams = new URLSearchParams();
        _searchParams.set("redirect", pathname + "?" + searchParams.toString());
        // router.replace(`/invite-code?${_searchParams.toString()}`);
      },
      { wait: 2000 }
    );

  const getAirdropData = async (params?: { isLoading?: boolean; }) => {
    const { isLoading = true } = params ?? {};
    isLoading && setAirdropDataLoading(true);
    const res = await httpAuthGet(`/airdrop/data?address=${address}`);
    if (res.code !== 0) {
      setAirdropDataLoading(false);
      return false;
    }
    setAirdropUserData(res.data);
    setReferral(res.data.referral_account);
    console.log("referral saved: %o", res.data.referral_account);
    Cookies.set("referral", res.data.referral_account, { path: "/" });
    setReferer(res.data.allow_login);
    if (
      !res.data?.allow_login &&
      !isTerms &&
      !checkUnRedirectPathname(pathname)
    ) {
      const _searchParams = new URLSearchParams();
      _searchParams.set("redirect", pathname + "?" + searchParams.toString());
      // router.replace(`/invite-code?${_searchParams.toString()}`);
    }
    setAirdropDataLoading(false);
    return res.data;
  };

  const { address } = useAccount();
  const { accountRefresher } = useAuth();

  useEffect(() => {
    goToInviteCodeDelayCancel();
    if (!address || !accountRefresher) {
      setAirdropUserData(void 0);
      goToInviteCodeDelay();
      return;
    }
    getAirdropData();
  }, [address, accountRefresher, pathname]);

  return (
    <AirdropContext.Provider
      value={{
        airdropUserData,
        airdropDataLoading,
        getAirdropData
      }}
    >
      {children}
    </AirdropContext.Provider>
  );
};

export function useAirdropContext() {
  return useContext(AirdropContext);
}

interface IAirdropContext {
  airdropUserData: {
    referral_account: string;
    airdrop_points: string;
    clime_create: boolean;
    clime_pump: boolean;
    invited: number;
    points: string;
    referral_points: string;
    allow_login: boolean;
  };
  airdropDataLoading: boolean;
  getAirdropData(params?: { isLoading?: boolean; }): Promise<void>;
}

export const checkUnRedirectPathname = (pathname: string) => {
  const unRedirectPathname = [
    /^\/$/,
    ...UN_REDIRECT_PATH
  ];
  return unRedirectPathname.some((item) => item.test(pathname));
};
