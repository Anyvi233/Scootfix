"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiMaximize2, FiCpu, FiNavigation, FiZap } from "react-icons/fi";
import Link from "next/link";

interface Hotspot {
  id: string;
  label: string;
  category: string;
  price: string;
  x: number; // percentage X
  y: number; // percentage Y
  frameStart: number;
  frameEnd: number;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: "bearings",
    label: "High-Performance Bearings",
    category: "Bearings",
    price: "From ₹499",
    x: 35,
    y: 80,
    frameStart: 1,
    frameEnd: 45,
  },
  {
    id: "disk-brakes",
    label: "Premium Disk Brakes",
    category: "Disk Brakes",
    price: "From ₹1,299",
    x: 30,
    y: 72,
    frameStart: 50,
    frameEnd: 85,
  },
  {
    id: "drum-brakes",
    label: "Genuine Rear Drum Brakes",
    category: "Drum brakes",
    price: "From ₹899",
    x: 75,
    y: 68,
    frameStart: 90,
    frameEnd: 125,
  },
  {
    id: "battery-charger",
    label: "Lithium Iron Charger",
    category: "Lithium Iron Chargers",
    price: "From ₹5,499",
    x: 50,
    y: 55,
    frameStart: 130,
    frameEnd: 175,
  },
  {
    id: "switches",
    label: "Handlebar Switches",
    category: "switches",
    price: "From ₹349",
    x: 48,
    y: 22,
    frameStart: 180,
    frameEnd: 230,
  },
  {
    id: "key-sets",
    label: "Ignition Key Sets",
    category: "key sets",
    price: "From ₹1,199",
    x: 45,
    y: 38,
    frameStart: 235,
    frameEnd: 270,
  },
];

export function PartsExplorer() {
  const [frameIndex, setFrameIndex] = useState(1);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartFrame = useRef(1);

  const totalFrames = 270;

  // Preload images
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    // Pre-create image elements
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
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
  }, [frameIndex, isPreloaded]);

  // Handle slide input
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFrameIndex(parseInt(e.target.value));
  };

  // Handle Drag gestures on Canvas for interactive rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartFrame.current = frameIndex;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    
    // 1 full screen drag = 1 complete rotation (270 frames)
    const containerWidth = containerRef.current?.offsetWidth || 800;
    const frameDelta = Math.round((deltaX / containerWidth) * totalFrames * 0.8);
    
    let newFrame = dragStartFrame.current + frameDelta;
    
    // Wrap around or clamp
    while (newFrame < 1) newFrame += totalFrames;
    while (newFrame > totalFrames) newFrame -= totalFrames;
    
    setFrameIndex(newFrame);
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    dragStartFrame.current = frameIndex;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    const containerWidth = containerRef.current?.offsetWidth || 800;
    const frameDelta = Math.round((deltaX / containerWidth) * totalFrames * 0.8);
    
    let newFrame = dragStartFrame.current + frameDelta;
    while (newFrame < 1) newFrame += totalFrames;
    while (newFrame > totalFrames) newFrame -= totalFrames;
    
    setFrameIndex(newFrame);
  };

  // Filter hotspots active in current frame range
  const visibleHotspots = HOTSPOTS.filter(
    (h) => frameIndex >= h.frameStart && frameIndex <= h.frameEnd
  );

  return (
    <div className="bg-surface-elevated border border-border rounded-3xl p-8 max-w-6xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Dynamic light rays */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
        
        {/* Left Side: Info */}
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 text-primary text-xs font-semibold rounded-full uppercase tracking-wider">
            <FiCpu className="animate-spin" /> Interactive 3D
          </span>
          <h3 className="text-3xl font-display font-bold text-text-primary leading-tight">
            Exploded Parts Explorer
          </h3>
          <p className="text-text-secondary text-sm leading-relaxed">
            Drag your finger or mouse over the scooter to rotate and disassemble it. Tap on the flashing hotspots to discover and purchase spare parts instantly.
          </p>

          {/* Scroller Guide */}
          <div className="bg-surface/50 border border-border p-4 rounded-2xl flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
              <FiNavigation className="rotate-45" size={16} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">How to Interact:</p>
              <p className="text-[11px] text-text-secondary mt-0.5">
                Drag horizontally to rotate. Hotspots appear automatically as components explode outward.
              </p>
            </div>
          </div>

          {/* Current Frame Status */}
          <div className="flex items-center justify-between text-xs text-text-muted font-mono pt-4 border-t border-border">
            <span>Assembly Frame:</span>
            <span>{frameIndex} / 270</span>
          </div>
        </div>

        {/* Center/Right Side: Canvas Scrubber */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center space-y-6">
          <div 
            ref={containerRef}
            className="relative w-full max-w-2xl aspect-video bg-background/30 rounded-2xl border border-border overflow-hidden cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            {/* Loading Overlay */}
            {!isPreloaded && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-text-secondary">Preloading 3D assembly models...</p>
              </div>
            )}

            {/* Interactive Canvas */}
            <canvas 
              ref={canvasRef}
              width={1920}
              height={1080}
              className="w-full h-full object-contain"
            />

            {/* Hotspots Overlay */}
            {isPreloaded && visibleHotspots.map((hotspot) => (
              <div
                key={hotspot.id}
                className="absolute z-20 group"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              >
                {/* Flashing Ring */}
                <button
                  className="w-6 h-6 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary flex items-center justify-center text-white font-bold relative focus:outline-none shadow-glow transition-transform active:scale-95"
                  onClick={() => setActiveHotspot(activeHotspot?.id === hotspot.id ? null : hotspot)}
                  aria-label={`Highlight ${hotspot.label}`}
                >
                  <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping pointer-events-none" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white" />
                </button>

                {/* Hover / Click Card */}
                <AnimatePresence>
                  {activeHotspot?.id === hotspot.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                      exit={{ opacity: 0, scale: 0.9, y: 10, x: "-50%" }}
                      className="absolute bottom-full left-1/2 mb-4 bg-surface border border-border rounded-xl p-4 w-52 shadow-2xl text-left pointer-events-auto"
                    >
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-surface border-r border-b border-border rotate-45" />

                      <p className="text-xs font-semibold text-text-primary leading-tight">{hotspot.label}</p>
                      <p className="text-[10px] text-text-muted mt-0.5">{hotspot.price}</p>
                      <div className="h-px bg-border my-2.5" />
                      <Link 
                        href={`/shop?categories=${encodeURIComponent(hotspot.category)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                      >
                        Browse Spares <FiChevronRight />
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Slider Controller */}
          <div className="w-full max-w-xl flex items-center gap-4 bg-background/40 border border-border/50 px-6 py-3 rounded-full">
            <span className="text-[10px] font-bold text-text-muted font-mono uppercase tracking-wider">Rotate</span>
            <input
              type="range"
              min="1"
              max={totalFrames}
              value={frameIndex}
              onChange={handleSliderChange}
              className="flex-1 accent-primary h-1 rounded-full cursor-pointer bg-border/50"
            />
            <span className="text-[10px] font-bold text-text-muted font-mono uppercase tracking-wider">Explode</span>
          </div>
        </div>

      </div>
    </div>
  );
}
