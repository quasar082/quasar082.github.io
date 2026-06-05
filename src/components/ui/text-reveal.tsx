"use client"

import {
  useRef,
  type ComponentPropsWithoutRef,
  type FC,
  type ReactNode,
} from "react"
import { motion, MotionValue, useScroll, useTransform } from "motion/react"

import { cn } from "@/lib/utils"

type TextRevealToken =
  | { type: "word"; value: string }
  | { type: "break"; value: string }

export interface TextRevealProps extends ComponentPropsWithoutRef<"div"> {
  children: string
  italicWords?: string[]
}

export const TextReveal: FC<TextRevealProps> = ({
  children,
  className,
  italicWords = [],
}) => {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 55%"],
  })

  if (typeof children !== "string") {
    throw new Error("TextReveal: children must be a string")
  }

  const tokens: TextRevealToken[] = children.split(/(\n+)/).flatMap<TextRevealToken>((part) => {
    if (/^\n+$/.test(part)) {
      return [{ type: "break" as const, value: part }]
    }

    return part.split(" ").filter(Boolean).map((word) => ({ type: "word" as const, value: word }))
  })
  const revealTokens = tokens.filter((token) => token.type === "word")
  const italicWordSet = new Set(italicWords.map((word) => word.toLowerCase()))

  return (
    <div ref={sectionRef} className={cn("relative z-0", className)}>
      <span className="flex flex-wrap content-start leading-[inherit]">
        {tokens.map((token, i) => {
          if (token.type === "break") {
            return <span key={`${i}-${token.value}`} className="basis-full h-[0.6em]" aria-hidden="true" />
          }

          const revealIndex = revealTokens.indexOf(token)
          const start = revealIndex / revealTokens.length
          const end = start + 1 / revealTokens.length
          const normalizedWord = token.value.toLowerCase().replace(/[^a-z0-9]/gi, "")
          const isItalic = italicWordSet.has(normalizedWord)
          return (
            <Word
              key={`${i}-${token.value}`}
              progress={scrollYProgress}
              range={[start, end]}
              className={isItalic ? "italic" : undefined}
            >
              {token.value}
            </Word>
          )
        })}
      </span>
    </div>
  )
}

interface WordProps {
  children: ReactNode
  progress: MotionValue<number>
  range: [number, number]
  className?: string
}

const Word: FC<WordProps> = ({ children, progress, range, className }) => {
  const opacity = useTransform(progress, range, [0, 1])
  return (
    <span className="relative mx-1 leading-[inherit] lg:mx-1.5">
      <span className={cn("absolute leading-[inherit] opacity-30", className)}>{children}</span>
      <motion.span
        style={{ opacity: opacity }}
        className={cn("leading-[inherit] text-inherit", className)}
      >
        {children}
      </motion.span>
    </span>
  )
}
