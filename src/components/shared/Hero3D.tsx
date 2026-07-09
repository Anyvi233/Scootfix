"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function Hero3D() {
  const [frameIndex, setFrameIndex] = useState(90); // Start in exploded state (around frame 90)
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [isAssembled, setIsAssembled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Parallax mouse trackers
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Create smooth springs for parallax rotation
  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 100, damping: 20 });
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 20 });

  const totalFrames = 270;

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNum = String(i).padStart(3, "0");
      img.src = `/images/exploded/ezgif-frame-${paddedNum}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setIsPreloaded(true);
        }
      };
      images.push(img);
    }
    imagesRef.current = images;
  }, []);

  // Draw frame on canvas
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

  // Handle loading animations, slow rotation & auto-assembly after 3 seconds
  useEffect(() => {
    if (!isPreloaded) return;

    let startTime = Date.now();
    let animationFrameId: number;

    const tick = () => {
      const elapsed = Date.now() - startTime;

      if (elapsed < 3000) {
        // Stage 1: Exploded & slowly rotating/pulsing (first 3 seconds)
        // Oscillate frame index gently around the exploded state (frame 90 +/- 8 frames)
        const frameOffset = Math.sin(elapsed * 0.002) * 8;
        setFrameIndex(Math.round(90 + frameOffset));
      } else if (elapsed >= 3000 && elapsed < 4500) {
        // Stage 2: Assembling (3s to 4.5s)
        // Interpolate smoothly from exploded frame (90) down to fully assembled frame (1)
        const progress = (elapsed - 3000) / 1500; // 0 to 1
        // Smooth easing out cubic
        const ease = 1 - Math.pow(1 - progress, 3);
        const targetFrame = Math.round(90 - ease * 89);
        setFrameIndex(targetFrame);
      } else {
        // Stage 3: Fully assembled
        if (!isAssembled) {
          setIsAssembled(true);
          setFrameIndex(1);
        }
        return; // Stop animation loop after assembly is complete
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPreloaded, isAssembled]);

  // Handle mouse movement for subtle parallax & interactive rotation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    mouseX.set(x);
    mouseY.set(y);

    // If already assembled, allow user's mouse position to rotate the scooter slightly
    if (isAssembled) {
      // Map horizontal mouse position to a small frame range around the assembled state (1 to 20 or 250 to 270)
      const targetFrameOffset = Math.round(x * 30);
      let targetFrame = 1 + targetFrameOffset;
      if (targetFrame < 1) targetFrame += totalFrames;
      if (targetFrame > totalFrames) targetFrame -= totalFrames;
      setFrameIndex(targetFrame);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    if (isAssembled) {
      setFrameIndex(1); // Return to default front-facing assembled view
    }
  };

  // Trigger exploded state transition when "Explore Parts" is clicked
  const handleExplorePartsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isPreloaded) return;
    
    // Animate assembling back and forth
    setIsAssembled(false);
    
    // Scroll down smoothly to the categories section
    const catSection = document.getElementById("categories-heading");
    if (catSection) {
      catSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-16"
    >
      {/* Premium background radial gradients & soft lights */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/5 to-transparent blur-[160px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-4rem)]">
        
        {/* Left Side: Editorial Typography */}
        <div className="lg:col-span-5 space-y-8 text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="space-y-4"
          >
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
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-base md:text-lg text-text-secondary leading-relaxed max-w-xl"
          >
            High-performance batteries, motors, controllers, chargers, brakes and accessories delivered across India.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-wrap gap-4 pt-2"
          >
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
          </motion.div>
        </div>

        {/* Right Side: Interactive 3D Canvas with Parallax */}
        <div className="lg:col-span-7 flex justify-center items-center h-full relative">
          <motion.div
            style={{ rotateX: rotateXSpring, rotateY: rotateYSpring }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.1 }}
            className="relative w-full max-w-2xl aspect-video flex items-center justify-center pointer-events-none"
          >
            {/* Soft backdrop glow behind the scooter */}
            <div className="absolute w-[80%] h-[80%] rounded-full bg-primary/5 blur-[80px]" />

            {/* Loading Indicator */}
            {!isPreloaded && (
              <div className="absolute flex flex-col items-center justify-center gap-2">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] uppercase font-bold tracking-widest text-text-muted">Loading 3D asset...</p>
              </div>
            )}

            {/* Gentle float animation wrapper */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
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

      {/* Down arrow indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 animate-bounce">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Scroll Down</span>
        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </div>
  );
}
