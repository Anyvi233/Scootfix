"use client";

import React, { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FiArrowRight, FiZap } from "react-icons/fi";
import Link from "next/link";

const FLOATING_PARTS = [
  { src: "/images/exploded/ezgif-frame-001.png", x: "72%", y: "12%", size: 220, delay: 0,    dur: 6 },
  { src: "/images/exploded/ezgif-frame-060.png", x: "58%", y: "55%", size: 160, delay: 0.8,  dur: 7 },
  { src: "/images/exploded/ezgif-frame-120.png", x: "82%", y: "62%", size: 130, delay: 1.4,  dur: 5 },
  { src: "/images/exploded/ezgif-frame-180.png", x: "65%", y: "30%", size: 100, delay: 0.4,  dur: 8 },
  { src: "/images/exploded/ezgif-frame-240.png", x: "88%", y: "38%", size: 90,  delay: 1.0,  dur: 6 },
];

const STATS = [
  { value: "500+", label: "Spare Parts" },
  { value: "15+",  label: "EV Brands" },
  { value: "2–5",  label: "Day Delivery" },
  { value: "30",   label: "Day Returns" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export function HeroSection() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });

  const rotateX = useTransform(springY, [-300, 300], [6, -6]);
  const rotateY = useTransform(springX, [-400, 400], [-8, 8]);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width  / 2);
      mouseY.set(e.clientY - rect.top  - rect.height / 2);
    };
    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 120% 80% at 65% 40%, #d0d8dc 0%, #b5bfc8 55%, #9aa4b0 100%)",
      }}
    >
      {/* ── Ambient orbs ─────────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-[-10%] right-[20%] w-[480px] h-[480px] rounded-full bg-white/20 blur-[120px]" />
        <div className="absolute bottom-0 left-[10%] w-[360px] h-[360px] rounded-full bg-slate-600/10 blur-[100px]" />
      </motion.div>

      {/* ── Floating EV part images (parallax with mouse) ───── */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ rotateX, rotateY, perspective: 1200 }}
      >
        {FLOATING_PARTS.map((part, i) => (
          <motion.img
            key={i}
            src={part.src}
            alt=""
            className="absolute select-none"
            style={{
              left:   part.x,
              top:    part.y,
              width:  part.size,
              filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.18))",
            }}
            initial={{ opacity: 0, scale: 0.7, y: 40 }}
            animate={{
              opacity: [0, 0.85, 0.85],
              scale:   [0.7, 1, 1],
              y:       [40, 0, -14, 0, -14, 0],
            }}
            transition={{
              opacity:  { duration: 0.8, delay: part.delay },
              scale:    { duration: 0.8, delay: part.delay },
              y:        {
                duration: part.dur,
                delay:    part.delay + 0.8,
                repeat:   Infinity,
                ease:     "easeInOut",
              },
            }}
          />
        ))}
      </motion.div>

      {/* ── Bottom fade ──────────────────────────────────────── */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-40"
        style={{ background: "linear-gradient(to bottom, transparent, #9aa4b0)" }}
      />

      {/* ── Content ──────────────────────────────────────────── */}
      <div className="relative z-20 container mx-auto px-6 md:px-10 py-32 md:py-40">
        <motion.div
          className="max-w-2xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-700/30 bg-white/25 text-slate-800 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm"
          >
            <FiZap size={11} className="text-primary animate-pulse" />
            India&rsquo;s #1 EV Spare Parts
          </motion.span>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-display font-extrabold text-slate-900 leading-[1.08] tracking-tight text-[clamp(2.6rem,5.5vw,4.2rem)] mb-6"
          >
            Power Your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-slate-600">
              Electric Ride
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-slate-700 text-[clamp(1rem,1.6vw,1.15rem)] leading-relaxed max-w-lg mb-10"
          >
            High-performance batteries, motors, controllers, chargers, brakes&nbsp;&amp;
            accessories — delivered across India.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-16">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-8 h-[3.25rem] rounded-full text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform duration-200"
            >
              Shop Now <FiArrowRight size={16} />
            </Link>
            <Link
              href="/vehicle-compatibility"
              className="inline-flex items-center px-8 h-[3.25rem] rounded-full text-sm font-semibold border border-slate-500/50 bg-white/25 text-slate-900 hover:bg-white/45 transition-colors backdrop-blur-sm"
            >
              Find Parts for My EV
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 sm:grid-cols-4 gap-6"
          >
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center sm:text-left">
                <p className="text-2xl font-display font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
