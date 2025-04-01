import { useCallback, useEffect, useState } from "react";
import { httpAuthPost } from "../utils";
import { success, fail } from "@/app/utils/toast";
import { useSearchParams } from "next/navigation";

interface TwitterShareParams {
    text: string;
    media?: string;
}

export default function useXShare() {
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const shareToTwitter = useCallback(async (params: TwitterShareParams) => {
        if (loading) return;
        setLoading(true);

        try {
            const redirectUri = encodeURIComponent(window.location.href.replace(/\/$/, ''));
            const path = `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=NWZlaG93WlNfNW4xVmxNZHdvUVo6MTpjaQ&redirect_uri=${redirectUri}&scope=tweet.read%20users.read%20follows.read%20like.read%20tweet.write&state=state&code_challenge=challenge&code_challenge_method=plain`;
            window.open(path, "_blank");

            // const result = await httpAuthPost("/twitter/tweet", {
            //     text: params.text,
            //     media: params.media
            // });

            // if (result.code !== 0) throw new Error(result.msg);

            success("Share successfully!");
            setLoading(false);
            return true;
        } catch (err: any) {
            setLoading(false);
            fail(err.message || "Share failed!");
            return false;
        }
    }, []);


    return {
        loading,
        shareToTwitter
    };
}
