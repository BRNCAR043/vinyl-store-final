// components/home/HeroSection.tsx
"use client";
import Link from "next/link";
import React from "react";

export default function HeroSection(): React.ReactElement {
  return (
    <section
      aria-label="Hero — Discover Rock Records"
      className="fade-in overflow-hidden"
    >
      <div className="max-w-7xl mx-auto md:py-12 py-8 px-4">
        <div className="flex flex-col md:flex-row items-stretch md:rounded-lg shadow-lg overflow-hidden">
          {/* Left: Rock & Roll Visual */}
          <figure
            className="relative md:w-1/2 w-full min-h-[48vh] md:min-h-[60vh] bg-cover bg-center bg-no-repeat"
            role="img"
            aria-label="Collage of rock records and posters"
          >
            <div className="absolute inset-0 bg-[url('/hero.png')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-black/25" />
            <figcaption className="relative z-10 h-full flex items-center justify-center px-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight font-extrabold text-[#f7efe6] tracking-widest text-center font-anton">
                <span className="block">ROCK</span>
                <span className="block">ROLL</span>
                <span className="block">RECORDS</span>
              </h2>
            </figcaption>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-black/10" />
          </figure>

          {/* Right: Content Panel */}
          <div className="md:w-1/2 w-full bg-[#f7f1e6] flex items-center">
            <div className="p-8 md:p-12 lg:p-16 w-full">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#4a0f12]">
                Discover Rock Records
              </h1>
              <p className="mt-4 text-base md:text-lg text-[#25432f] max-w-prose">
                Finding new and pre-loved rock records from your favourite artists — carefully curated for collectors and music lovers.
              </p>

              <div className="mt-8">
                <Link
                  href="/shop"
                  className="inline-block rounded-full px-6 py-3 bg-[#25432f] text-[#f7f1e6] font-medium shadow-sm transform transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#25432f]"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeInUp 700ms ease 120ms forwards;
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
    </section>
  );
}
