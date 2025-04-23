import { useEffect, useRef } from "react";
import { useAuth } from "@/app/context/auth";
import { httpAuthGet } from "@/app/utils";
import { Toast } from "antd-mobile";
import useRead from "../components/messages/use-read";
import { useUserAgent } from "@/app/context/user-agent";
import { useDebounceFn } from "ahooks";

/**
 * content_1 token name
 * content_2 token symbol
 * content_5 token amount
 * content_6 token icon
 * content_7 sol amount
 */
export default function useNotice() {
  const { accountRefresher } = useAuth();
  const timerRef = useRef<any>();
  const { onRead } = useRead();
  const { isWindowVisible } = useUserAgent();

  const onToast = (list: any) => {
    const notice = list.shift();
    const toast = Toast.show({
      content: (
        <div
          style={{
            padding: notice.type === "token_launching_owner" ? "20px 0px" : 0,
            position: "relative"
          }}
        >
          <div
            style={{
              color: "#000",
              wordBreak: "break-word",
              backgroundColor: "#C9FF5D",
              borderRadius: 20,
              boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.25)",
              display: "flex",
              gap: 8,
              padding: "10px 30px 10px 10px",
              position: "relative"
            }}
          >
            {notice.content_6 && (
              <img
                src={notice.content_6}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 60,
                  border: "2px solid #000",
                  flexShrink: 0,
                  objectFit: "cover"
                }}
              />
            )}
            {notice.type === "token_launching_owner" && (
              <div style={{ fontSize: 13, fontWeight: 300 }}>
                The token{" "}
                <span style={{ fontWeight: 600 }}>{notice.content_2}</span> you
                created just bonding!
              </div>
            )}

            {/* {notice.type === "token_launching" && (
              <div style={{ fontSize: 13, fontWeight: 300 }}>
                <span style={{ fontWeight: 600 }}>{notice.content_2}</span> goes
                to bonding progress. You have
                <span style={{ fontWeight: 600 }}>
                  {" "}
                  {numberFormatter(notice.content_5, 2, true)}{" "}
                  {notice.content_2}
                </span>{" "}
                to be claimed.{"  "}
                <span
                  style={{
                    textDecoration: "underline",
                    fontSize: 13,
                    fontWeight: 600
                  }}
                  className="button"
                  onClick={() => {
                    setClaimToken({
                      tokenName: notice.content_1,
                      tokenSymbol: notice.content_2,
                      tokenIcon: notice.content_6,
                      tokenAmount: notice.content_5,
                      prepaidAmount: notice.content_7
                    });
                  }}
                >
                  Claim
                </span>
              </div>
            )} */}
          </div>
          {notice.type === "token_launching_owner" && (
            <div
              style={{
                position: "absolute",
                right: -20,
                top: 1,
                fontSize: 60,
                transform: "rotate(-45deg)"
              }}
            >
              🚀️
            </div>
          )}
        </div>
      ),
      position: "top",
      duration: 5000,
      afterClose: () => {
        onRead({ ids: [notice.id] });
        if (list.length) {
          onToast(list);
        } else {
          clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
            onQuery();
          }, 10000);
        }
      }
    });
  };

  const onQuery = async () => {
    try {
      const response = await httpAuthGet(
        `/inform/list?limit=10&offset=0&read=0`
      );
      const filterdList = response.data?.list?.filter((item: any) => {
        if (item.read) return false;

        if (!["token_launching_owner"].includes(item.type)) return false;

        return true;
      });

      if (filterdList?.length) {
        onToast(filterdList);
      } else {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          onQuery();
        }, 10000);
      }
    } catch (err) {}
  };

  const { run } = useDebounceFn(
    () => {
      if (accountRefresher) {
        onQuery();
      }
    },
    { wait: 1000 }
  );

  useEffect(() => {
    if (!isWindowVisible) {
      clearTimeout(timerRef.current);
      return;
    }
    run();
  }, [accountRefresher, isWindowVisible]);
}
