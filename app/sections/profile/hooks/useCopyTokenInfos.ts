import { useState, useEffect } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { defaultAvatar } from "@/app/utils/config";
import { getTokenMeta } from '@/app/utils/solanaScanApi';
import { Metaplex } from '@metaplex-foundation/js';

export function useCopyTokenInfos(tokens: any[] | undefined) {
    const { connection } = useConnection();
    const [tokenInfos, setTokenInfos] = useState<any[]>([]);

    useEffect(() => {
        const fetchTokenInfos = async () => {
            if (tokens) {
                const infos = await Promise.all(
                    tokens.map(async (item) => {
                        const info = await getTokenInfo(item.token);
                        return {
                            ...info,
                            address: item.token,
                            balance: item.balance
                        };
                    })
                );
                setTokenInfos(infos);
            }
        };
        fetchTokenInfos();
    }, [tokens, connection]);

    const getTokenInfo = async (address: string) => {
        try {
            if (process.env.NEXT_PUBLIC_NET === "Devnet") {
                const tokenSupply = await connection.getTokenSupply(
                    new PublicKey(address),
                    "confirmed"
                );
                return {
                    supply: tokenSupply.value.uiAmount || 0,
                    icon: defaultAvatar,
                    symbol: 'token'
                };
            } else {
                const metaplex = Metaplex.make(connection);
                const nft = await metaplex.nfts().findByMint({ mintAddress: new PublicKey(address) });
                const mintInfo = await connection.getTokenSupply(new PublicKey(address));
                let imageUrl = defaultAvatar;
                if (nft.uri) {
                    try {
                        const response = await fetch(nft.uri);
                        const metadata = await response.json();
                        imageUrl = metadata.image || defaultAvatar;
                    } catch (error) {
                        console.error('Error fetching NFT metadata:', error);
                    }
                }
                return {
                    supply: mintInfo.value.uiAmount || 0,
                    icon: imageUrl || defaultAvatar,
                    symbol: nft.symbol || 'token'
                };
            }
        } catch (error) {
            return {
                supply: 0,
                icon: defaultAvatar,
                symbol: 'token'
            };
        }
    };

    return tokenInfos;
}