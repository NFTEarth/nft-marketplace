import ReactCanvasConfetti from "react-canvas-confetti";
import * as React from "react";
import {forwardRef, useCallback, useImperativeHandle, useRef} from "react";
import {CreateTypes} from "canvas-confetti";

const Confetti = forwardRef((props, ref) =>  {
  const refAnimationInstance = useRef<CreateTypes | null>();

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
    refAnimationInstance.current({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio)
    });
  }, [refAnimationInstance]);

  const fireConfetti = useCallback(() => {
    makeShot(0.35, {
      spread: 46,
      startVelocity: 55
    });

    makeShot(0.3, {
      spread: 60
    });

    makeShot(0.45, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    makeShot(0.2, {
      spread: 150,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    makeShot(0.2, {
      spread: 220,
      startVelocity: 45
    });
  }, [makeShot]);

  useImperativeHandle(ref, () => ({
    fireConfetti
  }));

  return (
    <ReactCanvasConfetti
      refConfetti={(instance) => {
        refAnimationInstance.current = instance;
      }}
      style={{
        position: "fixed",
        pointerEvents: "none",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 100000,
      }}
    />
  )
});

export default Confetti