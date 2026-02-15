// components/home/CrateFlipDemo.tsx
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type RecordItem = {
  id: number;
  title: string;
  artist: string;
  price: string;
};

const records: RecordItem[] = [
  { id: 1, title: "Dark Side of the Moon", artist: "Pink Floyd", price: "R499" },
  { id: 2, title: "Abbey Road", artist: "The Beatles", price: "R459" },
  { id: 3, title: "Rumours", artist: "Fleetwood Mac", price: "R429" },
  { id: 4, title: "Thriller", artist: "Michael Jackson", price: "R479" },
];

export default function CrateFlipDemo() {
  const [index, setIndex] = useState(0);

  const handleNext = () => {
    if (index < records.length - 1) {
      setIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-10">Flip Through the Crate</h1>
      <div className="relative w-80 h-96 bg-neutral-800 rounded-2xl border-4 border-neutral-700 shadow-2xl perspective-[1600px] p-4">
        <div className="absolute top-0 left-0 right-0 h-6 bg-neutral-700 rounded-t-xl z-20" />
        <div className="relative w-full h-full mt-4">
          <AnimatePresence>
            {records.slice(index, index + 3).map((record, stackIndex) => (
              <RecordCard
                key={record.id}
                record={record}
                stackIndex={stackIndex}
                isTop={stackIndex === 0}
                onFlip={handleNext}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export type RecordCardProps = {
  record: RecordItem;
  stackIndex: number;
  isTop: boolean;
  onFlip: () => void;
};

function RecordCard({ record, stackIndex, isTop, onFlip }: RecordCardProps) {
  const [showBuy, setShowBuy] = useState(false);

  return (
    <motion.div
      className="absolute inset-x-2 bottom-0 cursor-pointer"
      style={{
        transformOrigin: "bottom center",
        zIndex: 10 - stackIndex,
      }}
      initial={{
        y: stackIndex * 18,
        scale: 1 - stackIndex * 0.05,
      }}
      animate={{
        y: stackIndex * 18,
        scale: 1 - stackIndex * 0.05,
      }}
      exit={{
        rotateX: 120,
        y: 220,
        z: 200,
        scale: 0.85,
        opacity: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 110,
        damping: 18,
      }}
      onClick={() => isTop && onFlip()}
      onHoverStart={() => isTop && setShowBuy(true)}
      onHoverEnd={() => setShowBuy(false)}
    >
      <motion.div className="relative w-full h-72 rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-900 shadow-xl flex items-center justify-center">
        <AnimatePresence>
          {isTop && showBuy && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-neutral-900 px-4 py-2 rounded-full font-semibold shadow-lg"
            >
              Buy - {record.price}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="text-center pointer-events-none">
          <p className="font-semibold text-lg">{record.title}</p>
          <p className="text-sm text-neutral-300">{record.artist}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
