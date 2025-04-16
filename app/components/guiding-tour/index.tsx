import React, { FC, useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Mask } from "./mask";
import { MaskPlacement } from "./get-style-rect";
import { useGuidingTour } from "@/app/store/use-guiding-tour";
import { Exit } from "./exit";
import styles from "./index.module.css";

export interface IGuidingTourProps {
  steps: GuidingTourStepConfig[];
  getContainer?: () => HTMLElement;
  onStepsEnd?: () => void;
  forceShow?: boolean;
}

export interface GuidingTourStepConfig {
  selector: () => HTMLElement | null;
  placement?: MaskPlacement;
  title?: string | React.ReactNode;
  content?: string | React.ReactNode;
  renderContent?: () => React.ReactNode;
  beforeForward?: (currentStep: number) => void;
  beforeBack?: (currentStep: number) => void;
  type?: string;
  showAction?: boolean;
  actionLocation?: 'left' | 'right';
  triggerEvent?: 'click' | 'hover' | null;
  showOuter?: boolean;
  eleOffset?: { left?: number, top?: number };
}

const GuidingTour: FC<IGuidingTourProps> = (props) => {
  const { steps, onStepsEnd, getContainer } = props;
  const { hasShownTour, setHasShownTour } = useGuidingTour();

  const [currentStep, setCurrentStep] = useState<number>(-1);
  const currentSelectedElement = steps[currentStep]?.selector();
  const currentContainerElement = getContainer?.() || document.body;
  const [done, setDone] = useState(false);
  const [isMaskMoving, setIsMaskMoving] = useState<boolean>(false);
  const [, setRenderTick] = useState<number>(0);
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [exit, setExit] = useState(false);

  const getCurrentStep = () => {
    return steps[currentStep];
  };

  const handleTourEnd = useCallback(async () => {
    setIsResetting(true);
    await onStepsEnd?.();
    setDone(true);
    setHasShownTour(true);
    setContentSize({ width: 0, height: 0 });
  }, [onStepsEnd, setHasShownTour]);

  const forward = async () => {
    if (currentStep === steps.length - 1) {
      await handleTourEnd();
      return;
    }

    const { beforeForward } = getCurrentStep();
    let nextEle = false;
    try {
      await beforeForward?.(currentStep);
      nextEle = true
    } catch (error) {
      console.error(error);
      nextEle = false;
    }

    if (nextEle) {
      setCurrentStep(currentStep + 1);
    } else {
      if (currentStep === steps.length - 2) {
        await handleTourEnd();
        return;
      }

      setCurrentStep(currentStep + 1);
    }

  };

  useEffect(() => {
    let timer: any = null;
    const check = () => {
      if (popoverRef.current) {
        setContentSize({
          width: popoverRef.current.offsetWidth,
          height: popoverRef.current.offsetHeight
        });
        clearTimeout(timer);
      } else {
        timer = setTimeout(() => {
          check();
        }, 1000);
      }
    };
    check();
  }, [popoverRef.current, currentStep]);

  const renderPopover = () => {
    const config = getCurrentStep();

    if (!config) {
      return null;
    }

    const { content, showAction, actionLocation = 'right' } = config;

    const operation = (
      <button className={styles.Button} style={{
        width: currentStep === steps.length - 1 ? '100%' : 'auto'
      }} onClick={() => forward()}>
        {
          currentStep === steps.length - 1 && 'Make Memes Great Again!'
        }

        {
          currentStep === 0 && 'Show me!'
        }

        {
          currentStep !== 0 && currentStep !== steps.length - 1 && (
            <span>Next</span>
          )
        }
      </button>
    );

    return isMaskMoving ? null : (
      <div ref={popoverRef} className={styles.Panel}>
        <div className={styles.Text} onClick={() => {
          if (!showAction) {
            forward()
          }
        }}>{content}</div>

        {
          showAction && (
            <div className={styles.Operation}  style={{
              justifyContent: actionLocation === 'left' ? 'flex-start' : 'flex-end',

            }}>
              {
                currentStep !== steps.length - 1 && (
                  <div onClick={() => {
                    setExit(true);
                  }} className={styles.OperationNo} style={{
                    order: actionLocation === 'left' ? 2 : -1
                  }}>
                    {
                      currentStep === 0 && 'No thanks'
                    }

                    {
                      currentStep !== 0 && 'Exit'
                    }
                  </div>
                )}
              {operation}
            </div>
          )
        }
      </div>
    );
  };

  useEffect(() => {
    setRenderTick(1);
    setCurrentStep(0);
  }, []);

  if ((!props?.forceShow && hasShownTour) || !currentSelectedElement || done) {
    return null;
  }

  if (exit) {
    const exitComponent = <Exit onConfirm={async () => {
      await handleTourEnd();
    }} onCancel={() => {
      setExit(false);
    }} />

    return createPortal(exitComponent, currentContainerElement);
  }



  const mask = (
    <Mask
      reset={isResetting}
      onAnimationStart={() => {
        setIsMaskMoving(true);
      }}
      onAnimationEnd={() => {
        setIsMaskMoving(false);
      }}
      placement={getCurrentStep().placement as unknown as MaskPlacement}
      container={currentContainerElement}
      element={currentSelectedElement}
      renderMaskContent={renderPopover}
      contentWidth={contentSize.width}
      contentHeight={contentSize.height}
      type={getCurrentStep().type}
      showAction={getCurrentStep().showAction}
      triggerEvent={getCurrentStep().triggerEvent}
      onNext={() => {
        forward();
      }}
      showOuter={getCurrentStep().showOuter}
      eleOffset={getCurrentStep().eleOffset}
    />
  );

  return createPortal(mask, currentContainerElement);
};

export default GuidingTour;
