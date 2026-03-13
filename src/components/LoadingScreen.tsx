"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bouncy } from "ldrs/react";
import { Reuleaux } from "ldrs/react";
import "ldrs/react/Bouncy.css";
import "ldrs/react/Reuleaux.css";

const MIN_DISPLAY_MS = 1500;
const TIMEOUT_FALLBACK_MS = 8000;

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"loading" | "exiting" | "done">("loading");

  useEffect(() => {
    // Lock scroll during loading
    document.body.style.overflow = "hidden";

    const readyPromise = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });

    const minTimePromise = new Promise<void>((resolve) =>
      setTimeout(resolve, MIN_DISPLAY_MS)
    );

    // Timeout fallback -- never stay stuck indefinitely
    const timeoutPromise = new Promise<void>((resolve) =>
      setTimeout(resolve, TIMEOUT_FALLBACK_MS)
    );

    // Wait for BOTH readyState + minimum time, OR timeout (whichever comes first)
    Promise.race([
      Promise.all([readyPromise, minTimePromise]),
      timeoutPromise,
    ]).then(() => {
      setPhase("exiting");
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleExitComplete = () => {
    setPhase("done");
    document.body.style.overflow = "";
  };

  if (phase === "done") return null;

  return (
    <motion.div
      className="fixed inset-0 bg-white z-50 flex items-center justify-center"
      initial={{ opacity: 1, scale: 1 }}
      animate={
        phase === "exiting"
          ? { opacity: 0, scale: 0.95 }
          : { opacity: 1, scale: 1 }
      }
      transition={{ duration: 0.6, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (phase === "exiting") handleExitComplete();
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Reuleaux
          size="37"
          stroke="5"
          strokeLength="0.15"
          bgOpacity="0.1"
          speed="1.2"
          color="black"
        />
        <Bouncy size="45" speed="1.75" color="black" />
      </div>
    </motion.div>
  );
}
