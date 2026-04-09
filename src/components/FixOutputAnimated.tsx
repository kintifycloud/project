"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, BookOpen, CheckCircle2, Loader2, Search, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/analyzer";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  TypewriterText                                                     */
/* ------------------------------------------------------------------ */

function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed("");
    setDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(timer);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, prefersReducedMotion]);

  return (
    <>
      {displayed}
      {!done && (
        <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-current align-middle" />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STAGE_DELAYS = [300, 400, 500, 500, 500];
const COMPLETION_BUFFER = 800;

const fadeSlide = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

/* ------------------------------------------------------------------ */
/*  FixOutputAnimated                                                  */
/* ------------------------------------------------------------------ */

type FixOutputAnimatedProps = {
  result: AnalysisResult;
  className?: string;
  onComplete?: () => void;
};

export function FixOutputAnimated({ result, className, onComplete }: FixOutputAnimatedProps) {
  const [stage, setStage] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion) {
      setStage(5);
      setTimeout(() => onCompleteRef.current?.(), 100);
      return;
    }

    let cumulative = 0;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGE_DELAYS.forEach((delay, i) => {
      cumulative += delay;
      timers.push(setTimeout(() => setStage(i + 1), cumulative));
    });

    timers.push(
      setTimeout(() => onCompleteRef.current?.(), cumulative + COMPLETION_BUFFER),
    );

    return () => timers.forEach(clearTimeout);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (stage === 1 && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [stage]);

  const isComplete = stage >= 5;

  return (
    <div ref={containerRef} className={cn("grid gap-4 sm:gap-5", className)}>
      {/* Status label */}
      <motion.div
        animate={{ opacity: 1 }}
        className="flex items-center justify-center gap-2 py-2"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {!isComplete ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
            <p className="text-sm font-medium text-slate-400">
              Kintify AI is analyzing your system...
            </p>
          </>
        ) : (
          <motion.p
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-emerald-400"
            initial={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            Analysis complete
          </motion.p>
        )}
      </motion.div>

      {/* Problem */}
      {stage >= 1 && (
        <motion.div
          animate="visible"
          initial="hidden"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={fadeSlide}
        >
          <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
            <CardContent className="flex items-start gap-4 p-4 sm:p-6">
              <div className="mt-0.5 shrink-0 text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  className={cn(
                    "mb-2 border-rose-400/20 bg-rose-400/12 text-rose-200",
                    stage === 1 && "animate-pulse",
                  )}
                >
                  What&apos;s happening
                </Badge>
                <p className="text-sm leading-relaxed text-slate-200">
                  <TypewriterText text={result.problem} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Cause */}
      {stage >= 2 && (
        <motion.div
          animate="visible"
          initial="hidden"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={fadeSlide}
        >
          <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
            <CardContent className="flex items-start gap-4 p-4 sm:p-6">
              <div className="mt-0.5 shrink-0 text-amber-400">
                <Search className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  className={cn(
                    "mb-2 border-amber-400/20 bg-amber-400/12 text-amber-200",
                    stage === 2 && "animate-pulse",
                  )}
                >
                  Why it happens
                </Badge>
                <p className="text-sm leading-relaxed text-slate-200">
                  <TypewriterText text={result.cause} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Explanation */}
      {stage >= 3 && (
        <motion.div
          animate="visible"
          initial="hidden"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={fadeSlide}
        >
          <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
            <CardContent className="flex items-start gap-4 p-4 sm:p-6">
              <div className="mt-0.5 shrink-0 text-sky-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  className={cn(
                    "mb-2 border-sky-400/20 bg-sky-400/12 text-sky-200",
                    stage === 3 && "animate-pulse",
                  )}
                >
                  Explanation
                </Badge>
                <p className="text-sm leading-relaxed text-slate-200">
                  <TypewriterText text={result.explanation} speed={12} />
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Fix Steps */}
      {stage >= 4 && (
        <motion.div
          animate="visible"
          initial="hidden"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={fadeSlide}
        >
          <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
            <CardContent className="flex items-start gap-4 p-4 sm:p-6">
              <div className="mt-0.5 shrink-0 text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  className={cn(
                    "mb-3 border-emerald-400/20 bg-emerald-400/12 text-emerald-200",
                    stage === 4 && "animate-pulse",
                  )}
                >
                  How to fix it
                </Badge>
                <ol className="space-y-2">
                  {result.fix.map((step, index) => (
                    <motion.li
                      key={step}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 rounded-lg px-2 py-1 text-sm leading-relaxed text-slate-200 transition-colors hover:bg-white/5"
                      initial={{ opacity: 0, x: -8 }}
                      transition={{ delay: index * 0.1, duration: 0.25 }}
                    >
                      <span className="shrink-0 font-semibold text-emerald-400">
                        {index + 1}.
                      </span>
                      {step}
                    </motion.li>
                  ))}
                </ol>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Prevention Tips */}
      {stage >= 5 && (
        <motion.div
          animate="visible"
          initial="hidden"
          transition={{ duration: 0.3, ease: "easeOut" }}
          variants={fadeSlide}
        >
          <Card className="rounded-xl border-white/8 bg-white/[0.03] shadow-sm">
            <CardContent className="flex items-start gap-4 p-4 sm:p-6">
              <div className="mt-0.5 shrink-0 text-violet-400">
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge className="mb-3 border-violet-400/20 bg-violet-400/12 text-violet-200">
                  How to prevent it
                </Badge>
                <ul className="space-y-2">
                  {result.prevention.map((tip, index) => (
                    <motion.li
                      key={tip}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3 rounded-lg px-2 py-1 text-sm leading-relaxed text-slate-200 transition-colors hover:bg-white/5"
                      initial={{ opacity: 0, x: -8 }}
                      transition={{ delay: index * 0.1, duration: 0.25 }}
                    >
                      <span className="shrink-0 text-violet-400">&bull;</span>
                      {tip}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
