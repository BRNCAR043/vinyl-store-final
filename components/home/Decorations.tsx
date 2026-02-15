"use client";
import Image from "next/image";

export default function Decorations() {
  return (
    <>
      {/* Vinyl posters / collage */}
      <div aria-hidden className="pointer-events-none">
        <div className="hidden lg:block fixed top-20 left-6 transform -rotate-6">
          <Image src="/poster1.png" alt="" width={160} height={220} className="rounded-sm shadow-2xl" />
        </div>
        <div className="hidden lg:block fixed top-36 right-6 transform rotate-6">
          <Image src="/poster2.png" alt="" width={140} height={190} className="rounded-sm shadow-2xl" />
        </div>

        {/* Fairy lights */}
        <div className="fixed inset-x-0 top-0 z-30 flex justify-center pointer-events-none">
          <div className="relative w-full max-w-7xl px-4 py-6">
            <ul className="flex items-center justify-center gap-4">
              {Array.from({ length: 14 }).map((_, i) => (
                <li
                  key={i}
                  className="w-2 h-2 rounded-full bg-yellow-300/90 shadow-[0_0_6px_rgba(255,200,80,0.8)] animate-twinkle"
                  style={{ animationDelay: `${(Math.random() * 2).toFixed(2)}s` }}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-twinkle {
          animation: twinkle 2.5s infinite ease-in-out;
        }
        @keyframes twinkle {
          0% { opacity: 0.4; transform: translateY(0) scale(0.9); filter: blur(0.2px); }
          40% { opacity: 1; transform: translateY(-2px) scale(1.05); filter: blur(0); }
          100% { opacity: 0.5; transform: translateY(0) scale(0.95); filter: blur(0.2px); }
        }
      `}</style>
    </>
  );
}
