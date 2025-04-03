import { useCallback, useEffect, useState } from "react";
import { httpAuthGet, httpAuthPost, httpGet } from "../utils";
import { success, fail } from "@/app/utils/toast";
import { useSearchParams } from "next/navigation";
import { Project } from "../type";
import { mapDataToProject } from "../utils/mapTo";

export default function useXShare({ openSelf, token }: { openSelf: (token: Project) => void, token: Project | undefined }) {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const code = searchParams.get("code");
    const address = searchParams.get("address");
    const [xUserInfo, setXUserInfo] = useState<any>(null);

    const shareToTwitter = useCallback(async () => {
        if (loading || !token) return false;
        setLoading(true);

        try {
            const result = await httpAuthGet('/twitter/user_info');
            if (result.code === 0) {
                setXUserInfo(result.data);
                setLoading(false);
                return true;
            }

            let redirectUri = window.location.href;

            if (redirectUri.includes("?")) {
                redirectUri += '&address=' + token.address;
            } else {
                redirectUri += '?address=' + token.address;
            }

            redirectUri = encodeURIComponent(redirectUri.replace(/\/$/, ''));

            const path = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=NWZlaG93WlNfNW4xVmxNZHdvUVo6MTpjaQ&redirect_uri=${redirectUri}&scope=tweet.read%20users.read%20follows.read%20like.read%20tweet.write&state=state&code_challenge=challenge&code_challenge_method=plain`;
            window.open(path, "_blank");
            setLoading(false);
            return true;
        } catch (err: any) {
            setLoading(false);
            fail(err.message || "Share failed!");
            return false;
        }
    }, [token]);

    useEffect(() => {
        if (code && address) {
            (async () => {
                const url = new URL(window.location.href);
                url.searchParams.delete('state');
                url.searchParams.delete('code');
                const cleanedRedirectUri = url.toString();

                const res = await httpAuthPost(`/bind/twitter?code=${code}&redirect_uri=${encodeURIComponent(cleanedRedirectUri)}`);
                console.log('res:', res);
                if (res.code === 0) {
                    // success("Share successfully");
                    setXUserInfo(res.data);

                    // 移除url中的state和code参数,不刷新页面
                    const newUrl = new URL(window.location.href);
                    newUrl.searchParams.delete('state');
                    newUrl.searchParams.delete('code');
                    newUrl.searchParams.delete('address');
                    window.history.replaceState({}, '', newUrl.toString());

                    const v = await httpGet(`/project?address=${address}`);

                    if (v.code === 0) {
                        const data = v.data[0];
                        const _token = mapDataToProject(data)
                        openSelf(_token);
                    }
                }

            })();
        }
    }, [code, address])

    const clear = useCallback(() => {
        setXUserInfo(null);
    }, []);

    return {
        loading,
        code,
        xUserInfo,
        shareToTwitter,
        clear,
    };
}
