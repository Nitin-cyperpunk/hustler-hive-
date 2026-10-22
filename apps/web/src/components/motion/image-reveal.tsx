"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion/gsap";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

interface ImageRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: "left" | "right" | "top" | "bottom";
  duration?: number;
}

export function ImageReveal({
  children,
  className,
  direction = "left",
  duration = 1,
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !ref.current) return;

      const clipFrom: Record<string, string> = {
        left: "inset(0 100% 0 0)",
        right: "inset(0 0 0 100%)",
        top: "inset(100% 0 0 0)",
        bottom: "inset(0 0 100% 0)",
      };

      gsap.fromTo(
        ref.current,
        { clipPath: clipFrom[direction] },
        {
          clipPath: "inset(0 0 0 0)",
          duration,
          ease: "power3.inOut",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
