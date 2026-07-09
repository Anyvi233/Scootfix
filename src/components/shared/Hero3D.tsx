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
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  // Subtle mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const canvasX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 20 });
  const canvasY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-8, 8]), { stiffness: 80, damping: 20 });

  const totalFrames = 300;

  // WebGL references for high performance chroma keying
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);

  // ─── 1. Preload all 300 frames ─────────────────────────────────────────────
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

  // ─── 2. Initialize WebGL Shader Program ────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }
    glRef.current = gl;

    // Vertex Shader: full-screen quad
    const vsSource = `
      attribute vec2 a_position;
      varying vec2 v_texCoord;
      void main() {
        v_texCoord = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment Shader: Key out #b9bec4 dynamically on GPU
    const fsSource = `
      precision mediump float;
      varying vec2 v_texCoord;
      uniform sampler2D u_image;
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
        // Key color: #b9bec4 (approx R: 0.725, G: 0.745, B: 0.769)
        vec3 keyColor = vec3(0.725, 0.745, 0.769);
        float dist = distance(color.rgb, keyColor);
        
        // Feather the edges of the mask to prevent jagged lines
        float threshold = 0.09;
        float slope = 0.04;
        float alpha = smoothstep(threshold, threshold + slope, dist);
        
        gl_FragColor = vec4(color.rgb, color.a * alpha);
      }
    `;

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vsSource, gl.VERTEX_SHADER);
    const fs = compileShader(fsSource, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    // Set up full-screen quad vertices
    const vertices = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    positionBufferRef.current = positionBuffer;

    // Create texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    textureRef.current = texture;
  }, []);

  // ─── 3. Render frame on WebGL context ──────────────────────────────────────
  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const texture = textureRef.current;
    const positionBuffer = positionBufferRef.current;

    if (!gl || !program || !texture || !positionBuffer || !isPreloaded) return;

    const img = imagesRef.current[frameIndex - 1];
    if (!img || !img.complete) return;

    // Clear WebGL canvas
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Bind vertices
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Upload texture to GPU
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

    const imageLocation = gl.getUniformLocation(program, "u_image");
    gl.uniform1i(imageLocation, 0);

    // Draw quad
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, [frameIndex, isPreloaded]);

  // ─── 4. Register GSAP ScrollTrigger and Scrub frames ──────────────────────
  useEffect(() => {
    if (!isPreloaded || !scrollContainerRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const obj = { f: 1 };

    // Frame scrub animation
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
    /* Outer scroll region triggering ScrollTrigger. The pinned elements live inside. */
    <div ref={scrollContainerRef} style={{ height: "250vh" }} className="relative w-full">

      {/* Sticky/Pinned full screen view deck - Match the dark theme background exactly (#0A0A0A) */}
      <div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="sticky top-0 h-screen w-full overflow-hidden bg-background flex items-center justify-center"
      >
        {/* Soft radial gradients and ambient glow orbs behind the transparent scooter */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />

        {/* Vignette overlay for seamless blending into Categories section */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 z-20"
          style={{
            height: "15vh",
            background: "linear-gradient(to bottom, transparent 0%, var(--color-background) 100%)",
          }}
        />

        {/* Loading Overlay */}
        {!isPreloaded && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-background">
            <div className="w-11 h-11 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-xs uppercase font-bold tracking-widest text-text-primary">Loading 3D Experience</p>
              <p className="text-[10px] font-mono text-text-secondary mt-1">{loadingProgress}% Preloaded</p>
            </div>
            <div className="w-52 h-[3px] rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="relative z-10 h-full container mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-0">

          {/* Left Column: Editorial Info */}
          <div ref={textRef} className="lg:col-span-5 flex flex-col gap-7">
            <span className="inline-flex w-fit items-center gap-2 px-3 py-[5px] rounded-full border border-primary/20 bg-primary/5 text-primary text-[11px] font-bold uppercase tracking-widest">
              <FiZap size={11} className="text-primary animate-pulse" />
              India&rsquo;s #1 EV Spare Parts
            </span>

            <h1 className="font-display font-extrabold text-text-primary leading-[1.08] tracking-tight text-[clamp(2.2rem,5vw,3.8rem)]">
              Power Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Electric Ride
              </span>
            </h1>

            <p className="text-text-secondary text-[clamp(0.9rem,1.5vw,1.1rem)] leading-relaxed max-w-md">
              High-performance batteries, motors, controllers, chargers, brakes &amp; accessories — delivered across India.
            </p>

            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-7 rounded-full text-sm font-semibold bg-primary hover:bg-primary-hover text-white active:scale-95 transition-all shadow-glow"
                style={{ height: "3.25rem" }}
              >
                Shop Now
              </Link>
              <button
                onClick={scrollToCategories}
                className="inline-flex items-center justify-center px-7 rounded-full text-sm font-semibold border border-border bg-surface/30 text-text-primary hover:bg-surface/50 active:scale-95 transition-all backdrop-blur-sm"
                style={{ height: "3.25rem" }}
              >
                Explore Parts
              </button>
            </div>
          </div>

          {/* Right Column: Borderless 100% Transparent WebGL Canvas */}
          <div className="lg:col-span-7 h-full flex items-center justify-end">
            <motion.div
              style={{ x: canvasX, y: canvasY }}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Gentle floating animation */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
                className="w-[115%] -mr-[5%]"
              >
                <canvas
                  ref={canvasRef}
                  width={1920}
                  height={1080}
                  className="w-full h-auto"
                  style={{
                    display: "block",
                    backgroundColor: "transparent",
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">
            Scroll to Explode
          </span>
          <div className="w-5 h-9 border-2 border-border rounded-full flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 11, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
              className="w-1 h-1 rounded-full bg-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
