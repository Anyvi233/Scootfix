"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiZap as ZapIcon } from "react-icons/fi";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Hero3D() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);

  const heroRef      = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const textRef      = useRef<HTMLDivElement>(null);
  const scrollDotRef = useRef<HTMLDivElement>(null);

  // Cache ImageBitmaps in memory
  const bitmapsRef   = useRef<ImageBitmap[]>([]);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const rafRef       = useRef<number | null>(null);
  const lastFrameRef = useRef(-1);

  const TOTAL = 300;

  // ── 1. Cache desynchronized 2D canvas context ─────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
  }, []);

  // ── 2. Preload + Pre-decode every frame into ImageBitmaps ────────────────
  useEffect(() => {
    let loaded = 0;
    const bitmaps: ImageBitmap[] = new Array(TOTAL);

    const loadAndCreateBitmap = async (i: number) => {
      const img = new Image();
      img.src = `/images/exploded/ezgif-frame-${String(i + 1).padStart(3, "0")}.png`;
      
      try {
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        // Create fully decoded GPU-ready ImageBitmap representation
        const bitmap = await createImageBitmap(img);
        bitmaps[i] = bitmap;
      } catch (err) {
        console.error("Failed to load frame", i, err);
      }

      loaded++;
      // Batch progress updates to avoid React render spam
      if (loaded % 10 === 0 || loaded === TOTAL) {
        setLoadingProgress(Math.round((loaded / TOTAL) * 100));
      }
      if (loaded === TOTAL) {
        setIsPreloaded(true);
      }
    };

    for (let i = 0; i < TOTAL; i++) {
      loadAndCreateBitmap(i);
    }
    bitmapsRef.current = bitmaps;
  }, []);

  // ── 3. Map Canvas dimensions 1:1 with natural resolution ──────────────────
  useEffect(() => {
    if (!isPreloaded) return;
    const canvas = canvasRef.current;
    const firstBitmap = bitmapsRef.current[0];
    if (canvas && firstBitmap) {
      canvas.width = firstBitmap.width || 1920;
      canvas.height = firstBitmap.height || 1080;
    }
    renderFrame(0);
  }, [isPreloaded]);

  // ── Core render function — draws pre-decoded ImageBitmaps ──────────────────
  function renderFrame(index: number) {
    const clamped = Math.min(TOTAL - 1, Math.max(0, index));
    if (clamped === lastFrameRef.current) return;
    lastFrameRef.current = clamped;

    const ctx    = ctxRef.current;
    const canvas = canvasRef.current;
    const bitmap = bitmapsRef.current[clamped];
    if (!ctx || !canvas || !bitmap) return;

    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  }

  // ── 4. GSAP ScrollTrigger — pinned over 160vh ──────────────────────────────
  useEffect(() => {
    if (!isPreloaded || !heroRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const proxy = { p: 0 };

    const anim = gsap.to(proxy, {
      p: 1,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "+=120%",          // Shortened scroll depth: 120vh (1.2 screens)
        pin: true,
        anticipatePin: 1,
        scrub: 0.1,             // extremely tight scroll sync
        invalidateOnRefresh: true,
      },
      onUpdate() {
        if (rafRef.current !== null) return; // skip if a frame is already requested

        rafRef.current = requestAnimationFrame(() => {
          rafRef.current = null;
          const p = proxy.p;
          const currentFrame = Math.round(p * (TOTAL - 1));

          // ── Draw Frame ──
          renderFrame(currentFrame);

          // ── Text Fade (0% -> 35% of scroll) ──
          const txt = textRef.current;
          if (txt) {
            const tp = Math.min(1, p / 0.35);
            txt.style.opacity   = `${1 - tp}`;
            txt.style.transform = `translate3d(0,${-50 * tp}px,0)`;
          }

          // ── Scroll indicator fade ──
          const dot = scrollDotRef.current;
          if (dot) {
            dot.style.opacity = `${1 - Math.min(1, p / 0.08)}`;
          }
        });
      },
    });

    return () => {
      anim.kill();
      ScrollTrigger.getAll().forEach(t => t.kill());
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);

      // Close all ImageBitmaps to free GPU memory
      bitmapsRef.current.forEach(bitmap => {
        if (bitmap && typeof bitmap.close === "function") {
          bitmap.close();
        }
      });
    };
  }, [isPreloaded]);

  const scrollToCategories = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("categories-heading")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div
      ref={heroRef}
      className="relative w-full overflow-hidden"
      style={{
        height: "100vh",
        background:
          "radial-gradient(circle at 68% 48%, #d3dadc 0%, #b9bec4 60%, #a2aab0 100%)",
        willChange: "transform",
      }}
    >
      {/* Bottom fade into categories */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
        style={{
          height: "12vh",
          background: "linear-gradient(to bottom, transparent, #b9bec4)",
        }}
      />

      {/* Loading overlay */}
      {!isPreloaded && (
        <div
          className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5"
          style={{ backgroundColor: "#b9bec4" }}
        >
          <div className="w-11 h-11 border-[3px] border-slate-800 border-t-transparent rounded-full animate-spin" />
          <div className="text-center">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-800">
              Loading 3D Experience
            </p>
            <p className="text-[10px] font-mono text-slate-700 mt-1">
              {loadingProgress}%
            </p>
          </div>
          <div className="w-52 h-[3px] rounded-full bg-slate-300 overflow-hidden">
            <div
              className="h-full bg-slate-800 transition-all duration-150 ease-out"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Main layout */}
      <div className="relative z-10 h-full container mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 items-center">

        {/* Left Column: Headline */}
        <div
          ref={textRef}
          className="lg:col-span-5 flex flex-col gap-7"
          style={{ willChange: "transform, opacity" }}
        >
          <span className="inline-flex w-fit items-center gap-2 px-3 py-[5px] rounded-full border border-slate-700/30 bg-white/20 text-slate-800 text-[11px] font-bold uppercase tracking-widest">
            <ZapIcon size={11} className="text-primary animate-pulse" />
            India&rsquo;s #1 EV Spare Parts
          </span>

          <h1 className="font-display font-extrabold text-slate-900 leading-[1.08] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
            Power Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700">
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
              className="inline-flex items-center justify-center px-7 rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-lg"
              style={{ height: "3.25rem" }}
            >
              Shop Now
            </Link>
            <button
              onClick={scrollToCategories}
              className="inline-flex items-center justify-center px-7 rounded-full text-sm font-semibold border border-slate-500/50 bg-white/20 text-slate-900 hover:bg-white/40 transition-colors backdrop-blur-sm"
              style={{ height: "3.25rem" }}
            >
              Explore Parts
            </button>
          </div>
        </div>

        {/* Right Column: Canvas (GPU-accelerated and layer-promoted) */}
        <div className="lg:col-span-7 h-full flex items-center justify-end">
          <div
            className="w-[115%] -mr-[5%]"
            style={{
              willChange: "transform",
              transform: "translate3d(0, 0, 0)",
              backfaceVisibility: "hidden",
            }}
          >
            <canvas
              ref={canvasRef}
              className="w-full h-auto block"
              style={{
                backgroundColor: "transparent",
                willChange: "transform",
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
              }}
            />
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div
        ref={scrollDotRef}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
        style={{ willChange: "opacity" }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-700">
          Scroll to Explode
        </span>
        <div className="w-5 h-9 border-2 border-slate-700/50 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-1 rounded-full bg-slate-800 animate-scrollBounce" />
        </div>
      </div>
    </div>
  );
}
