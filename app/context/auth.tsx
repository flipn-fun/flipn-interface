import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from "react";
import { useDebounceFn } from "ahooks";
import { useUser } from "@/app/store/useUser";
import useUserInfo from "@/app/hooks/useUserInfo";
import { useAccount } from "@/app/hooks/useAccount";
import { usePathname, useRouter } from "next/navigation";
import { useWallet } from "@/app/hooks/use-wallet";
import useInviteCode from "../hooks/use-invite-code";
import { logOut } from "@/app/utils";
import LoginModal from "@/app/components/loginModal";
import SignatureModal from "../components/signature-modal";
import CustomizeLink from "@/app/sections/mining/component/customize-link";
import type { ReactNode } from "react";
import { UN_REDIRECT_PATH } from "@/app/config/invite";

const AuthContext = React.createContext<any | null>(null);

export const AuthProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const { disconnect } = useWallet();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { address, walletProvider } = useAccount();
  const userStore: any = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showCustomizeLinkModal, setShowCustomizeLinkModal] = useState(false);
  const timer = useRef<any>();
  const [accountRefresher, setAccountRefresher] = useState(0);
  const { onQueryInfo, setUserInfo, fecthUserInfo } = useUserInfo(
    address,
    true,
    0
  );
  const { codeInfo, onCopyShareLink, onUpdateCode } =
    useInviteCode(accountRefresher);
  const isTerms = ["/privacy-policy", "/terms-and-conditions"].includes(
    pathname
  );

  const { run: updateAccount } = useDebounceFn(
    async () => {
      window.walletProvider = walletProvider;
      window.sexAddress = address;
      console.log(
        "%cWindow.sexAddress: %o",
        "background:#B82132;color:#fff;",
        window.sexAddress
      );

      if (address === userStore.userInfo?.address) {
        setAccountRefresher(1);
        updateCurrentUserInfo();
        return;
      }

      setShowSignatureModal(true);
    },
    { wait: 800 }
  );

  useEffect(() => {
    window.connect = (params?: { isClose?: boolean; }) => {
      if (UN_REDIRECT_PATH.some((reg) => reg.test(pathname)) || params?.isClose) {
        setShowLoginModal(false);
        return;
      }
      setShowLoginModal(true);
    };
    window.sign = () => {
      if (address) {
        setShowSignatureModal(true);
      } else {
        setShowLoginModal(true);
      }
    };
    window.disconnect = disconnect;
  }, [pathname]);

  const logout = useCallback(
    async (isRedirect?: boolean) => {
      await disconnect?.();
      // @ts-ignore
      setUserInfo(undefined);
      userStore.set({
        userInfo: null
      });
      logOut();
      // fix#REF-9292
      isRedirect && router.replace("/");
    },
    [address]
  );

  const updateCurrentUserInfo = useCallback(async () => {
    if (!address) return;
    const userInfo = await fecthUserInfo(address);
    userStore.setUserInfo(userInfo);
  }, [address]);

  useEffect(() => {
    if (!address) {
      setAccountRefresher(0);
      timer.current = setTimeout(() => {
        console.log(
          "%cBefore logout - Window.sexAddress: %o",
          "background:#B82132;color:#fff;",
          window.sexAddress
        );
        if (!window.sexAddress) {
          console.log(
            "%cTriggered logout - Window.sexAddress: %o",
            "background:#B82132;color:#fff;",
            window.sexAddress
          );
          logout();
        }
      }, 5000);
      return;
    }

    updateAccount();
    clearTimeout(timer.current);

    return () => {
      clearTimeout(timer.current);
    };
  }, [address]);

  return (
    <AuthContext.Provider
      value={{
        userInfo: userStore.userInfo,
        address,
        pathname,
        accountRefresher,
        onQueryInfo,
        logout,
        updateCurrentUserInfo,
        updateUserLikeNum(num: number) {
          userStore.setUserInfo({
            using_like_num: num
          });
        },
        codeInfo,
        onCopyShareLink() {
          if (codeInfo?.revise_number === 0 && codeInfo?.invites_number === 0) {
            setShowCustomizeLinkModal(true);
          } else {
            onCopyShareLink();
          }
        }
      }}
    >
      {children}
      <LoginModal
        modalShow={showLoginModal}
        onHide={() => {
          setShowLoginModal(false);
        }}
      />
      <SignatureModal
        {...{
          showSignatureModal: showSignatureModal && !isTerms,
          updateCurrentUserInfo,
          setAccountRefresher,
          setShowSignatureModal,
          accountRefresher
        }}
      />
      <CustomizeLink
        show={showCustomizeLinkModal}
        info={codeInfo}
        onClose={() => {
          setShowCustomizeLinkModal(false);
        }}
        onSuccess={() => {
          onUpdateCode();
          setShowCustomizeLinkModal(false);
        }}
        onCopyShareLink={onCopyShareLink}
      />
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("");
  }

  return context;
}
