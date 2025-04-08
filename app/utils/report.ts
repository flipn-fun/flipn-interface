import { httpAuthPost } from "@/app/utils";

export async function reportTradeData(type: number, txHash: string, uuid: string = '') {
  try {
    const data = {
      t: type, // 2 for swap, 3 for flip
      v: JSON.stringify({
        uuid: uuid || '',
        tx_hash: txHash
      })
    };

    const response = await httpAuthPost('/report/data', { 
      list: [data]
    }, true, true);

    return response;
  } catch (error) {
    console.error('Error reporting trade data:', error);
    return null;
  }
}


export const ReportDataType = {
  SWAP: 2,
  FLIP: 3
} as const;
