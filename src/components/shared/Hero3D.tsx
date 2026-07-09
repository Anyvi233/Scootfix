"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FiZap } from "react-icons/fi";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Hero3D() {
  const [frameIndex, setFrameIndex] = useState(1);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const canvasX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 20 });
  const canvasY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 20 });

  const totalFrames = 300;

  // ─── 1. Preload all 270 frames ─────────────────────────────────────────────
  useEffect(() => {
    let loaded = 0;
    const imgs: HTMLImageElement[] = [];
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      img.src = `/images/exploded/ezgif-frame-${String(i).padStart(3, "0")}.png`;
      img.onload = () => {
        loaded++;
        setLoadingProgress(Math.round((loaded / totalFrames) * 100));
        if (loaded === totalFrames) setIsPreloaded(true);
      };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  // ─── 2. Draw frame on canvas ───────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPreloaded) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const img = imagesRef.current[frameIndex - 1];
    if (img?.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [frameIndex, isPreloaded]);

  // ─── 3. GSAP ScrollTrigger scrubbing ──────────────────────────────────────
  useEffect(() => {
    if (!isPreloaded || !scrollContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const obj = { f: 1 };

    // Frame scrub
    const st1 = gsap.to(obj, {
      f: totalFrames,
      ease: "none",
      scrollTrigger: {
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: () =>
          setFrameIndex(Math.min(totalFrames, Math.max(1, Math.round(obj.f)))),
      },
    });

    // Fade text out over first half of scroll
    const st2 = gsap.to(textRef.current, {
      opacity: 0,
      y: -60,
      ease: "none",
      scrollTrigger: {
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "40% top",
        scrub: true,
      },
    });

    return () => {
      st1.scrollTrigger?.kill();
      st2.scrollTrigger?.kill();
    };
  }, [isPreloaded]);

  // ─── Mouse tracking ────────────────────────────────────────────────────────
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - r.left) / r.width - 0.5);
    mouseY.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const scrollToCategories = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("categories-heading")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    /* ── Scroll region: 250 vh gives plenty of scrub depth ─────────────────── */
    <div ref={scrollContainerRef} style={{ height: "250vh" }} className="relative w-full">

      {/* ── Pinned viewport ─────────────────────────────────────────────────── */}
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="sticky top-0 h-screen w-full overflow-hidden"
        /* Studio-light gradient that matches the JPEG background #bcc4c6
           so the canvas edges vanish completely. Bright at centre-right
           (where the scooter sits), slightly darker at the edges. */
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 68% 48%, #dde3e6 0%, #bcc4c6 55%, #aab4b8 100%)",
        }}
      >
        {/* ── Ambient colour spills – pure CSS, zero JS ─────────────────── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 60%, rgba(16,185,129,0.07) 0%, transparent 55%)",
          }}
        />

        {/* ── Edge vignette so the hero bleeds into the page below ─────── */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
          style={{
            height: "18vh",
            background:
              "linear-gradient(to bottom, transparent 0%, #bcc4c6 100%)",
          }}
        />
        {/* Left vignette */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10"
          style={{
            width: "10vw",
            background:
              "linear-gradient(to right, #bcc4c6 0%, transparent 100%)",
          }}
        />

        {/* ── Loading overlay ───────────────────────────────────────────── */}
        {!isPreloaded && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5"
            style={{ background: "#bcc4c6" }}
          >
            <div className="w-11 h-11 border-[3px] border-slate-700 border-t-transparent rounded-full animate-spin" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700">
              Loading 3D Experience&ensp;{loadingProgress}%
            </p>
            <div className="w-52 h-[3px] rounded-full bg-slate-300 overflow-hidden">
              <div
                className="h-full bg-slate-700 transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Main layout ────────────────────────────────────────────────── */}
        <div className="relative z-10 h-full container mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-0">

          {/* Left: editorial text */}
          <div ref={textRef} className="lg:col-span-5 flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 px-3 py-[5px] rounded-full border border-slate-500/40 bg-white/20 text-slate-800 text-[11px] font-bold uppercase tracking-widest">
              <FiZap size={11} className="text-primary animate-pulse" />
              India&rsquo;s #1 EV Spare Parts
            </span>

            <h1 className="font-display font-extrabold text-slate-900 leading-[1.08] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
              Power Your<br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #0f172a 0%, #334155 60%, #0f172a 100%)",
                }}
              >
                Electric Ride
              </span>
            </h1>

            <p className="text-slate-700 text-[clamp(0.9rem,1.5vw,1.1rem)] leading-relaxed max-w-md">
              High-performance batteries, motors, controllers, chargers,
              brakes &amp; accessories — delivered across India.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 h-13 px-7 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all shadow-lg"
                style={{ height: "3.25rem" }}
              >
                Shop Now
              </Link>
              <button
                onClick={scrollToCategories}
                className="inline-flex items-center gap-2 px-7 rounded-full text-sm font-semibold border border-slate-600/50 bg-white/30 text-slate-900 hover:bg-white/50 active:scale-95 transition-all backdrop-blur-sm"
                style={{ height: "3.25rem" }}
              >
                Explore Parts
              </button>
            </div>
          </div>

          {/* Right: borderless floating canvas */}
          <div className="lg:col-span-7 h-full flex items-center justify-end">
            <motion.div
              style={{ x: canvasX, y: canvasY }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Gentle perpetual float */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="w-[115%] -mr-[5%]"  // Bleed slightly beyond grid to remove right gap
              >
                <canvas
                  ref={canvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  style={{
                    /* multiply makes every white/light-grey pixel vanish against
                       the matching hero background — zero visible edges */
                    mixBlendMode: "multiply",
                    display: "block",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* ── Scroll nudge ─────────────────────────────────────────────── */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Scroll to Explode
          </span>
          <div className="w-5 h-9 border-2 border-slate-500/50 rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 11, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1 h-1 rounded-full bg-slate-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
