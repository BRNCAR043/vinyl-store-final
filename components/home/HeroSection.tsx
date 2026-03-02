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
      <div className="max-w-6xl mx-auto md:py-12 py-8 px-4 relative z-10">
        {/* Rustic wooden frame wrapper */}
        <div className="relative">
          {/* Outer wood border */}
          <div className="absolute -inset-2 md:-inset-3 rounded-xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, #5c3d2e 0%, #3d2517 40%, #4a3122 70%, #5c3d2e 100%)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          />
          {/* Inner shadow frame */}
          <div className="absolute -inset-0.5 rounded-lg pointer-events-none"
            style={{
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
              border: '1px solid rgba(201,168,108,0.15)',
            }}
          />
          <div className="md:rounded-lg shadow-lg overflow-hidden relative z-10">
            {/* Unified slide container: all slides render the same way */}
            <div
              ref={containerRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={() => { finishDrag(); if (pointerIdRef.current != null) containerRef.current?.releasePointerCapture?.(pointerIdRef.current); }}
              onPointerCancel={() => { finishDrag(); if (pointerIdRef.current != null) containerRef.current?.releasePointerCapture?.(pointerIdRef.current); }}
              className="relative w-full h-[40vh] md:h-[48vh] overflow-hidden bg-[#1a0f0a]"
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

              {/* Warm vignette on carousel */}
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 60px rgba(13,8,6,0.5)' }} />
            </div>

            {/* Arrows — styled like worn metal buttons */}
            <button aria-label="Previous slide" onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(61,37,23,0.85), rgba(90,60,40,0.85))',
                border: '1px solid rgba(201,168,108,0.25)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                color: '#f5e6d3',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button aria-label="Next slide" onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, rgba(61,37,23,0.85), rgba(90,60,40,0.85))',
                border: '1px solid rgba(201,168,108,0.25)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                color: '#f5e6d3',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          </div>
        </div>

        {/* Slide indicator dots — outside the frame */}
        <div className="flex justify-center gap-2 mt-5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { setTrackIndex(i + 1); setIndex(i); }}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === index ? 'bg-[#c9a86c] scale-110' : 'bg-[#3d2a1e] hover:bg-[#5c3d2e]'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
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
