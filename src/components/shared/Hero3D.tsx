"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function Hero3D() {
  const [frameIndex, setFrameIndex] = useState(1);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pinContainerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const textContainerRef = useRef<HTMLDivElement | null>(null);

  // Parallax mouse movement tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 100, damping: 20 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 20 });

  const totalFrames = 270;

  // 1. Preload 270 frames of the exploded view
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNum = String(i).padStart(3, "0");
      img.src = `/images/exploded/ezgif-frame-${paddedNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        setLoadingProgress(Math.round((loadedCount / totalFrames) * 100));
        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // 2. Draw canvas frame dynamically
  useEffect(() => {
    if (!isPreloaded || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = imagesRef.current[frameIndex - 1];
    if (img && img.complete) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [frameIndex, isPreloaded]);

  // 3. Register GSAP ScrollTrigger and Scrub frames
  useEffect(() => {
    if (!isPreloaded || !scrollContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const playhead = { frame: 1 };

    // Scroll scrubbing animation for the 3D frame index
    const animation = gsap.to(playhead, {
      frame: totalFrames,
      ease: "none",
      scrollTrigger: {
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5, // Smooth scrubbing
        onUpdate: (self) => {
          const frame = Math.round(playhead.frame);
          setFrameIndex(Math.min(totalFrames, Math.max(1, frame)));
        },
      },
    });

    // Scroll scrubbing animation to fade out left text panel naturally
    const textFade = gsap.to(textContainerRef.current, {
      opacity: 0,
      y: -50,
      ease: "none",
      scrollTrigger: {
        trigger: scrollContainerRef.current,
        start: "top top",
        end: "center center",
        scrub: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      textFade.scrollTrigger?.kill();
    };
  }, [isPreloaded]);

  // Handle mouse moves for subtle parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!pinContainerRef.current) return;
    const rect = pinContainerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleExplorePartsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const target = document.getElementById("categories-heading");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    // Outer scroll zone triggering ScrollTrigger. The pinned elements live inside.
    <div 
      ref={scrollContainerRef}
      className="relative w-full z-10"
      style={{ height: "250vh" }} // Provides 2.5x screen height scroll depth
    >
      {/* Sticky/Pinned full screen view deck */}
      <div 
        ref={pinContainerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-background flex items-center justify-center"
      >
        {/* Soft atmospheric lights & premium gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/5 to-transparent blur-[160px] pointer-events-none" />

        {/* Loading Overlay */}
        {!isPreloaded && (
          <div className="absolute inset-0 bg-background z-50 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-xs uppercase font-bold tracking-widest text-text-primary">Loading 3D Experience</p>
              <p className="text-[10px] font-mono text-text-muted mt-1">{loadingProgress}% Preloaded</p>
            </div>
            {/* Loading progress bar */}
            <div className="w-48 h-1 bg-border rounded-full overflow-hidden mt-2">
              <div 
                className="h-full bg-primary transition-all duration-150" 
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center h-full relative">
          
          {/* Left Column: Editorial Info */}
          <div 
            ref={textContainerRef}
            className="lg:col-span-5 space-y-8 text-left z-20"
          >
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
                <FiZap size={12} className="animate-pulse text-accent" />
                Power Your Electric Ride
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold text-text-primary leading-[1.1] tracking-tight">
                Premium EV Spare Parts<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  for Every Electric Scooter
                </span>
              </h1>
            </div>

            <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl">
              High-performance batteries, motors, controllers, chargers, brakes and accessories delivered across India.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/shop">
                <Button size="lg" className="shadow-glow h-14 px-8 text-sm font-semibold rounded-full">
                  Shop Now
                </Button>
              </Link>
              <button
                onClick={handleExplorePartsClick}
                className="h-14 px-8 text-sm font-semibold rounded-full border border-border bg-surface/50 text-text-primary hover:bg-surface transition-colors focus:outline-none"
              >
                Explore Parts
              </button>
            </div>
          </div>

          {/* Right Column: 3D Exploded View Canvas with Parallax */}
          <div className="lg:col-span-7 flex justify-center items-center h-full z-10">
            <motion.div
              style={{ rotateX: rotateXSpring, rotateY: rotateYSpring }}
              className="relative w-full max-w-2xl aspect-video flex items-center justify-center"
            >
              {/* Soft backdrop lighting */}
              <div className="absolute w-[80%] h-[80%] rounded-full bg-primary/5 blur-[80px]" />

              {/* Gentle floating wrapper */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="w-full h-full"
              >
                <canvas 
                  ref={canvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-full object-contain filter drop-shadow-2xl"
                />
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Scroll to Explode</span>
          <div className="w-6 h-10 border-2 border-text-muted/50 rounded-full flex justify-center p-1.5">
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-primary rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
