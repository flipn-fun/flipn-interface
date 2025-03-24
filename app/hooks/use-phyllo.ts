import { useState, useEffect, useCallback, useRef } from "react";
import { useUser } from "../store/useUser";
import { httpAuthPost } from "../utils";
import { fail } from "../utils/toast";

export default function usePhyllo() {
    const { userInfo }: any = useUser();
    const [token, setToken] = useState<string | null>('1111');
    const phylloConnectRef = useRef<any>(null);

    useEffect(() => {

        // if (!token || phylloConnectRef.current) return;

        const config = {
            clientDisplayName: 'FlipN', // the name of your app that you want the creators to see while granting access
            environment: 'sandbox', // the mode in which you want to use the SDK,  `sandbox`, `staging` or `production`
            // userId: userInfo?.user_external_id, // the unique user_id parameter returned by Phyllo API when you create a user (see https://docs.getphyllo.com/docs/api-reference/reference/openapi.v1.yml/paths/~1v1~1users/post)
            userId: '3333', // the unique user_id parameter returned by Phyllo API when you create a user (see https://docs.getphyllo.com/docs/api-reference/reference/openapi.v1.yml/paths/~1v1~1users/post)
            token,
            redirect: false, // (optional) flag to indicate that you want to use the redirect flow, this is `false` by default
            workPlatformId: '1', // (optional) the unique work_platform_id of a specific work platform, if you want the creator to skip the platform selection screen and just be able to connect just with a single work platform
        };

        // @ts-ignore
        const phylloConnect = window.PhylloConnect.initialize(config);
        phylloConnectRef.current = phylloConnect;
        console.log(" PhylloConnect", phylloConnect);

        phylloConnect.on(
            "accountDisconnected",
            (accountId: string, workplatformId: string, userId: string) => {
                // gives the successfully disconnected account ID and work platform ID for the given user ID
                console.log(
                    `onAccountDisconnected: ${accountId}, ${workplatformId}, ${userId}`
                );
            }
        );

        phylloConnect.on(
            "accountConnected",
            (accountId: string, workplatformId: string, userId: string) => {
                // gives the successfully connected account ID and work platform ID for the given user ID
                console.log(
                    `onAccountConnected: ${accountId}, ${workplatformId}, ${userId}`
                );
            }
        );

        phylloConnect.on("tokenExpired", (userId: string) => {
            // gives the user ID for which the token has expired
            console.log(`onTokenExpired: ${userId}`); // the SDK closes automatically in case the token has expired, and you need to handle this by showing an appropriate UI and messaging to the users
        });
        
        phylloConnect.on("exit", (reason: string, userId: string) => {
            // indicates that the user with given user ID has closed the SDK and gives an appropriate reason for it
            console.log(`onExit: ${reason}, ${userId}`);
        });

        phylloConnect.on(
            "connectionFailure",
            (reason: string, workplatformId: string, userId: string) => {
                // optional, indicates that the user with given user ID has attempted connecting to the work platform but resulted in a failure and gives an appropriate reason for it
                console.log(
                    `onConnectionFailure: ${reason}, ${workplatformId}, ${userId}`
                );
            }
        );

    }, [token, userInfo]);

    const getToken = useCallback(async () => {
        const res = await httpAuthPost('/sdk/token');
        console.log("res", res);
        if (res.code === 0 && res.data) {
            setToken(res.data);
        } else {
            fail('Load PhylloConnect token failed');
        }
    }, []);

    const connectPhyllo = useCallback(() => {
        console.log("connectPhyllo", phylloConnectRef.current);
        phylloConnectRef.current?.open();
    }, []);

    useEffect(() => {
        getToken();
    }, []);

    return { token, connectPhyllo };

}