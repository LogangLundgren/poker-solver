"use client";

import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const SUIT_INFO: Record<string, { symbol: string; cls: string }> = {
  h: { symbol: "\u2665", cls: "suit-hearts" },
  d: { symbol: "\u2666", cls: "suit-diamonds" },
  c: { symbol: "\u2663", cls: "suit-clubs" },
  s: { symbol: "\u2660", cls: "suit-spades" },
};

interface PlayingCardProps {
  card: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const sizes = {
  sm: "w-10 h-14",
  md: "w-14 h-[4.5rem]",
  lg: "w-16 h-[5.5rem]",
};

const rankSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const suitSizes = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
};

export function PlayingCardFace({ card, size = "md", onClick, className }: PlayingCardProps) {
  const rank = card[0];
  const suit = card[1];
  const info = SUIT_INFO[suit];

  return (
    <button
      onClick={onClick}
      className={cn("playing-card-classic", sizes[size], className)}
    >
      {/* Top-left rank + suit */}
      <div className="absolute top-1 left-1.5 flex flex-col items-center leading-none">
        <span className={cn("font-bold text-gray-900", rankSizes[size])}>{rank}</span>
        <span className={cn(info.cls, "text-[10px] leading-none")}>{info.symbol}</span>
      </div>
      {/* Center suit */}
      <div className="flex items-center justify-center">
        <span className={cn(info.cls, suitSizes[size])}>{info.symbol}</span>
      </div>
      {/* Bottom-right rank + suit (rotated) */}
      <div className="absolute bottom-1 right-1.5 flex flex-col items-center leading-none rotate-180">
        <span className={cn("font-bold text-gray-900", rankSizes[size])}>{rank}</span>
        <span className={cn(info.cls, "text-[10px] leading-none")}>{info.symbol}</span>
      </div>
    </button>
  );
}

interface EmptySlotProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

export function EmptyCardSlot({ label, size = "md", onClick, className }: EmptySlotProps) {
  return (
    <button
      onClick={onClick}
      className={cn("card-slot-empty", sizes[size], className)}
    >
      <Plus className="w-3.5 h-3.5" />
      {label && <span className="text-[8px] font-medium">{label}</span>}
    </button>
  );
}

export { SUIT_INFO };
