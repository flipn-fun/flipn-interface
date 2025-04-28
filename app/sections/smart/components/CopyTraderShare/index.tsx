import styles from './index.module.css';
import CopyTradeShareInfoCard from '@/app/sections/smart/components/CopyTraderShare/share-info';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useAccount } from '@/app/hooks/useAccount';
import { fail, success } from '@/app/utils/toast';
import html2canvas from 'html2canvas';
import { generateRandomString } from '@/app/utils';
import dayjs from 'dayjs';
import Loading from '@/app/components/icons/loading';
import Modal from '@/app/components/modal';
import { useUserAgent } from '@/app/context/user-agent';
import CloseIcon from "@/app/components/icons/modal-close";
import { postUpload, base64ToBlob } from '@/app/utils';
import { getShortUrl, shareToX } from "@/app/utils/share";

const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://stage.flipn.fun";

const CopyTradeShare = (props: any) => {
  const { onClose, copyTradersUserInfo, reqAddress } = props;
  const { isMobile } = useUserAgent();
  const { address } = useAccount();

  const cardRef = useRef<any>(null);

  const [loading, setLoading] = useState(false);
  const [downloadVisible, setDownloadVisible] = useState(false);
  const [downloadSrc, setDownloadSrc] = useState<any>();
  const [downloadFileName, setDownloadFileName] = useState<any>();
  const [shareImgUrl, setShareImgUrl] = useState<any>();
  const [isNoHead, setIsNoHead] = useState(false);

  const shareLink = useMemo(() => {
    const _shareLink = new URL(window?.location?.origin + '/smartDetail');
    _shareLink.searchParams.set("address",(reqAddress || address) ?? "");
    _shareLink.searchParams.set("referrer", 'copy-trader-share');
    return _shareLink.toString();
  }, [address, reqAddress]);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(shareLink.toString())
      .then(() => {
        success("Copied share link!", { maskStyle: { zIndex: 2000 } });
        const timer = setTimeout(() => {
          clearTimeout(timer);
          onClose?.();
        }, 1000);
      })
      .catch((err) => {
        fail("Copy failed!", { maskStyle: { zIndex: 2000 } });
      })
      .finally(() => {
      });
  };

  const getShareImage = async () => {
    if (loading) return;
    setLoading(true);
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { useCORS: true,backgroundColor: null  });

        const base64Url = canvas.toDataURL("image/webp");
        const newFileName = generateRandomString(10);
        // setDownloadSrc(base64Url);
        // setDownloadFileName(`${newFileName}.${dayjs().format('YYYY.MM.DD.HH.mm.ss')}.png`);
        // setDownloadVisible(true);
        const link = document.createElement("a");
        link.href = base64Url;
        link.download = `${newFileName}.${dayjs().format('YYYY.MM.DD.HH.mm.ss')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err: any) {
        console.log('get share image failed: %o', err);
        fail(`Got share image failed${err?.message ? ': ' + err?.message : ''}`);
      }
    }
    setLoading(false);
  };



  const getShareImg = async () => {
    if (loading) return;
    setLoading(true);
    
    if (cardRef.current) {
      try {
        // Add a small delay to ensure styles are loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        await new Promise(resolve => requestAnimationFrame(resolve));
        
        const element = cardRef.current;
        // Force a reflow to ensure styles are applied
        element.offsetHeight;
        
        const originalWidth = 420;  
        const originalHeight = 550; 
        const targetWidth = 420;  
        const scale = targetWidth / originalWidth;
        const targetHeight = originalHeight * scale;

        // Wait for images to load
        const images = element.getElementsByTagName('img');
        await Promise.all(
          Array.from(images).map(
            (img: any) => img.complete ? Promise.resolve() : new Promise(resolve => img.onload = resolve)
          )
        );

        const canvas = await html2canvas(element, { 
          useCORS: true,
          backgroundColor: '#000',
          scale: scale,
          logging: false,
          width: targetWidth,
          height: targetHeight,
          imageTimeout: 0,
          allowTaint: true,
          onclone: (clonedDoc) => {
            const clonedElement = clonedDoc.querySelector(`[class*="${styles.CopyTradeShareCard}"]`);
            if (clonedElement) {
              const el = clonedElement as HTMLElement;
              el.style.opacity = '1';
              el.style.visibility = 'visible';
              // Force styles to be applied in the cloned document
              el.style.display = 'block';
              el.style.position = 'relative';
              el.style.width = '420px';
              el.style.height = '550px';
            }
          }
        });

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob!);
          }, 'image/jpeg', 0.8);
        });
        const timestamp = dayjs().format('YYYYMMDDHHmmss');
        const randomString = generateRandomString(8);
        const filename = `copy_trader_${timestamp}_${randomString}.jpg`;

        const url = await postUpload(blob, filename, 'image/jpeg');
        if (url) {
          console.log('Upload successful:', url);
          setShareImgUrl(url);
        }
      } catch (err: any) {
        console.error('Share image generation/upload failed:', err);
        fail(`Failed to generate/upload share image${err?.message ? ': ' + err?.message : ''}`);
      }
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (!isNoHead) {
      getShareImg();
    }
  }, [isNoHead]);


  const handleCopyX = async () => {
    await setLoading(true);
    if (shareImgUrl) {
      const longUrl = `${domain}/api/copy?address=${encodeURIComponent(
        reqAddress || address || ''
      )}&imgUrl=${encodeURIComponent(
        shareImgUrl
      )}&title=${encodeURIComponent(
        'Copy Trader Share'
      )}&about=${encodeURIComponent('Copy Trader Share')}`;
      const shortUrl = await getShortUrl(longUrl);
      shareToX('Check out this copy trader on Flipn! 🚀', shortUrl);
    }
    await setLoading(false);
    onClose?.();
  }


  useEffect(() => {
    if (
      navigator.userAgent.toLowerCase().indexOf("phantom") > -1 ||
      navigator.userAgent.toLowerCase().indexOf("solflare") > -1
    ) {
      setIsNoHead(true);
    }
  }, []);


  const showError = useCallback(() => {
    fail("This feature is unavailable in the wallet's browser. ", {
      maskStyle: {
        zIndex: 9999
      }
    });
  }, []);

  return (
    <div className={isMobile? styles.CopyTradeShareContainer: styles.CopyTradeShareContainerPc}>
      {
        !isMobile && (
          <div className={styles.TopTraderShareHeaderPC} onClick={onClose}>
          <CloseIcon size={35} />
         </div>
        )
      }
      <div ref={cardRef} className={styles.CopyTradeShareCard}>
        <CopyTradeShareInfoCard shareLink={shareLink} copyTradersUserInfo={copyTradersUserInfo} accountAddress={reqAddress || address}/>
      </div>
      <div className={styles.CopyTradeShareFooter}>
        <button
          type="button"
          className={styles.AirdropShareButtonDark}
          onClick={getShareImage}
          disabled={loading}
        >
          {
            loading && (
              <Loading size={14} />
            )
          }
          <span>Save image</span>
        </button>
        <button
          type="button"
          className={styles.AirdropShareButtonPrimary}
          onClick={isNoHead ? handleCopy : handleCopyX}
          disabled={loading}
        >
          {
            loading && (
              <Loading size={14} />
            )
          }
          <span className={styles.ShareButtonText}><ShareIcon/> Share</span>
        </button>
      </div>
      {/*#region useless currently*/}
      <Modal
        open={downloadVisible}
        onClose={() => {
          setDownloadVisible(false);
        }}
      >
        <div className={styles.AirdropDownloadModalCard}>
          <div className={styles.AirdropDownloadModalTitle}>
            Shareable image is ready
          </div>
          <div className={styles.AirdropDownloadModalDesc}>
            Click the button below to download immediately
          </div>
          <a
            href={downloadSrc}
            download={downloadFileName}
            className={styles.AirdropDownloadModalButton}
          >
            Download
          </a>
        </div>
      </Modal>
      {/*#endregion*/}
    </div>
  );
};

const ShareIcon= () => {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10.0101 14.7104C9.99621 14.8066 10.0055 14.9047 10.0373 14.9969C10.0692 15.0891 10.1226 15.1729 10.1935 15.2417L10.1991 15.2461C10.2609 15.3086 10.3351 15.3584 10.4173 15.3924C10.4994 15.4265 10.5879 15.4441 10.6772 15.4443C10.8853 15.4443 11.0631 15.3463 11.1857 15.2036L17.8074 8.20618C17.8734 8.14237 17.9247 8.06565 17.9576 7.98115C17.9906 7.89665 18.0046 7.8063 17.9986 7.71616C18.0047 7.626 17.9907 7.53564 17.9578 7.45113C17.9248 7.36661 17.8735 7.2899 17.8074 7.22614L11.1486 0.189487C11.0211 0.0680545 10.8494 0 10.6705 0C10.4916 0 10.3199 0.0680545 10.1924 0.189487C10.1218 0.258539 10.0687 0.342407 10.0371 0.43457C10.0055 0.526734 9.99624 0.624711 10.0101 0.720888V4.51036C4.48195 4.51036 3.8411e-07 8.82905 3.8411e-07 14.1583C-0.000380367 15.4806 0.28231 16.7887 0.830245 18C1.62 13.9819 5.60018 10.9296 9.99887 10.9296L10.0101 14.7104Z" fill="black"/>
    </svg>
  )
}

export default CopyTradeShare;
