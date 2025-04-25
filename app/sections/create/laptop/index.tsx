import CreateNode from "../CreateNode";
// import PreviewNode from "./preview";
import { motion } from "framer-motion";
import { useState, useRef, useMemo } from "react";
import { fail } from "@/app/utils/toast";
import { httpAuthPost, sleep } from "@/app/utils";
import type { Project } from "@/app/type";
import styles from "./index.module.css";
import Steps from "./step";
import PreviewNode from "../PreviewNode";
import { useUserAgent } from "@/app/context/user-agent";

import { useRay } from "@/app/hooks/useRay";
import { Button } from "antd-mobile";
import { useMeteoraToken } from "@/app/hooks/useMeteoraToken";

export default function Laptop() {
  const [step, setStep] = useState(1);
  const [dataAdd, setDataAdd] = useState<Project>();
  const createRef = useRef<any>();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isMobile } = useUserAgent();
  const { createMint, getQoute, trade, createPlatform } = useRay({
    token: {
      address: '5FqUeNGvTY4kThG8pckse4haAdMA64CrqVBuY9LbaB4i',
      about: '',
      tokenImg: '',
      tokenName: '',
      ticker: '',
    }
  });

  

  const { createMint: createMintMeteora, trade: tradeMeteora, getQoute: getQouteMeteora } = useMeteoraToken({
    token: {
      address: '5FqUeNGvTY4kThG8pckse4haAdMA64CrqVBuY9LbaB4i',
      about: '',
      tokenImg: '',
      tokenName: '',
      ticker: '',
    }
  })

  const query = useMemo(() => {
    const query: any = {
      about_us: dataAdd?.about,
      discord: dataAdd?.discord,
      icon: dataAdd?.tokenIcon,
      tg: dataAdd?.tg,
      ticker: dataAdd?.ticker,
      token_name: dataAdd?.tokenName,
      token_symbol: dataAdd?.tokenSymbol,
      video: dataAdd?.tokenImg,
      website: dataAdd?.website,
      x: dataAdd?.x
    };

    const queryStr = Object.keys(query)
      .map((key) => `${key}=${encodeURIComponent(query[key])}`)
      .join("&");

    return queryStr;
  }, [dataAdd]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={styles.Wrapper}
      >
        { step <= 3 && <Steps step={step} /> }
        <div className={styles.Container}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={styles.EditWrapper}
          >
            <div style={{ height: step === 1 ? '60px' : '0px' }}></div>
            <CreateNode
                ref={createRef}
                step={step}
                // @ts-ignore
                show={step === 1}
                onNext={() => {
                  setStep(step + 1);
                }}
                onBack={() => {
                  setStep(step - 1);
                }}
                onAddDataFill={(value: any) => {
                  setDataAdd(value);
                  setStep(2);
                  window.scrollTo(0, 0);
                }}
              />
            
          </motion.div>
          { step >= 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <PreviewNode
                show={true}
                step={step}
                data={dataAdd!}
                onNext={() => {
                  setStep(step + 1);
                }}
                goBackTo={() => {
                  setStep(2)
                }}
                onBack={() => {
                  setStep(step - 1);
                }} />
            </motion.div>
          )}
        </div>

        <div>
        <Button onClick={async () => {    
          const tx = await createMint({
            tokenName: 'test',
            ticker: 'test',
            about: 'test',
            tokenImg: 'test',
            tokenIcon: 'test'
          }, '10000000')
        }}>Raudium</Button>

        <Button onClick={async () => {
          const quote = await getQoute('10000', 'buy')
          console.log('quote', quote)
        }}>Get Quote</Button>

        <Button onClick={async () => {
          const tx = await trade('100000000', 'buy', 100)
          console.log('tx', tx)
        }}>Buy</Button>

        <Button onClick={async () => {
          const tx = await trade('100000000000', 'sell', 100)
          console.log('tx', tx)
        }}>Sell</Button>  

        <Button onClick={async () => {
          const tx = await createPlatform()
          console.log('tx', tx)
        }}>Create Platform</Button>
        </div>

        <div>
          <Button onClick={async () => {
            const tx = await createMintMeteora({
              tokenName: 'test',
              ticker: 'test',
              about: 'test',
              tokenImg: 'test',
              tokenIcon: 'test'
            }, '10000000')
            console.log('tx', tx)
          }}>Create Mint</Button>

          <Button onClick={async () => {  
            const quote = await getQouteMeteora('10000', 'buy')
            console.log('quote', quote)
          }}>Get Quote</Button>

          <Button onClick={async () => {
            const tx = await tradeMeteora('100000000', 'buy', 100)
            console.log('tx', tx)
          }}>Buy</Button>   

          <Button onClick={async () => {
            const tx = await tradeMeteora('100000000000', 'sell', 100)
            console.log('tx', tx)
          }}>Sell</Button>
        </div>

      </motion.div>
    </>
  );
}
