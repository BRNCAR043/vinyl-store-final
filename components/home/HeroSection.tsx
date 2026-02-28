// components/home/HeroSection.tsx
"use client";
import React, { useEffect, useState } from "react";

const SLIDES = ["/info0.png", "/info1.png", "/info2.png"];

export default function HeroSection(): React.ReactElement {
  const [index, setIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0); // pixels
  const [disableTransition, setDisableTransition] = useState(false);
  // trackIndex accounts for clones: starts at 1 => shows slides[0]
  const [trackIndex, setTrackIndex] = useState(1);
  const N = SLIDES.length;
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const pointerIdRef = React.useRef<number | null>(null);
  const startXRef = React.useRef(0);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    if (isDragging) return; // pause auto-advance while dragging
    const t = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(t);
  }, [isDragging]);

  useEffect(() => {
    function updateWidth() {
      setContainerWidth(containerRef.current?.clientWidth || 0);
    }
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // when the track finishes a transition, if we moved into a cloned slide, jump without transition
  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;
    function onTransitionEnd() {
      // if moved beyond last clone (N+1) -> reset to 1
      if (trackIndex === N + 1) {
        setDisableTransition(true);
        setTrackIndex(1);
        // logical index already set by next/prev calls
        requestAnimationFrame(() => requestAnimationFrame(() => setDisableTransition(false)));
      }
      // if moved before first clone (0) -> reset to N
      if (trackIndex === 0) {
        setDisableTransition(true);
        setTrackIndex(N);
        requestAnimationFrame(() => requestAnimationFrame(() => setDisableTransition(false)));
      }
    }
    node.addEventListener('transitionend', onTransitionEnd);
    return () => node.removeEventListener('transitionend', onTransitionEnd);
  }, [trackIndex, N]);

  const prev = () => {
    // move track back one
    setTrackIndex((t) => t - 1);
    setIndex((i) => (i - 1 + N) % N);
  };
  const next = () => {
    setTrackIndex((t) => t + 1);
    setIndex((i) => (i + 1) % N);
  };

  const handleNext = () => next();
  const handlePrev = () => prev();

  const onPointerDown = (e: React.PointerEvent) => {
    // only left button / touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    containerRef.current?.setPointerCapture?.(e.pointerId);
    pointerIdRef.current = e.pointerId;
    startXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging || pointerIdRef.current !== e.pointerId) return;
    const dx = e.clientX - startXRef.current;
    setDragOffset(dx);
  };

  const finishDrag = () => {
    if (!isDragging) return;
    const width = containerRef.current?.clientWidth || 1;
    const threshold = Math.max(40, width * 0.12); // pixels to trigger
    if (dragOffset > threshold) {
      handlePrev();
    } else if (dragOffset < -threshold) {
      handleNext();
    } else {
      // snap back
      setDisableTransition(false);
    }
    setIsDragging(false);
    setDragOffset(0);
    pointerIdRef.current = null;
  };


  return (
    <section aria-label="Hero — Discover Rock Records" className="fade-in overflow-hidden relative">
      <div className="max-w-7xl mx-auto md:py-12 py-8 px-4 relative z-10">
        <div className="md:rounded-lg shadow-lg overflow-hidden relative">
          {/* Unified slide container: all slides render the same way */}
          <div
            ref={containerRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => { finishDrag(); if (pointerIdRef.current != null) containerRef.current?.releasePointerCapture?.(pointerIdRef.current); }}
            onPointerCancel={() => { finishDrag(); if (pointerIdRef.current != null) containerRef.current?.releasePointerCapture?.(pointerIdRef.current); }}
            className="relative w-full h-[40vh] md:h-[48vh] overflow-hidden"
          >
            <div
              ref={trackRef}
              className="flex h-full"
              style={{
                width: `${(N + 2) * 100}%`,
                transform: `translate3d(${(-trackIndex * containerWidth + dragOffset) || 0}px, 0, 0)`,
                transition: (isDragging || disableTransition) ? 'none' : 'transform 420ms cubic-bezier(.2,.9,.2,1)',
              }}
            >
              {/* clone last */}
              <div className="w-full h-full flex-shrink-0 flex items-center justify-center" style={{ width: `${100 / (N + 2)}%` }}>
                <div className="w-full h-full bg-no-repeat bg-center" style={{ backgroundImage: `url('${SLIDES[N - 1]}')`, backgroundSize: 'contain' }} />
              </div>

              {SLIDES.map((src) => (
                <div key={src} className="w-full h-full flex-shrink-0 flex items-center justify-center" style={{ width: `${100 / (N + 2)}%` }}>
                  <div className="w-full h-full bg-no-repeat bg-center" style={{ backgroundImage: `url('${src}')`, backgroundSize: 'contain' }} />
                </div>
              ))}

              {/* clone first */}
              <div className="w-full h-full flex-shrink-0 flex items-center justify-center" style={{ width: `${100 / (N + 2)}%` }}>
                <div className="w-full h-full bg-no-repeat bg-center" style={{ backgroundImage: `url('${SLIDES[0]}')`, backgroundSize: 'contain' }} />
              </div>
            </div>
          </div>

          {/* Arrows */}
          <button aria-label="Previous slide" onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
            ‹
          </button>
          <button aria-label="Next slide" onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full">
            ›
          </button>
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeInUp 700ms ease 120ms forwards;
        }

        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
