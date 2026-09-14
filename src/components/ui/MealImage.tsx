import React from "react";
import { MealType } from "@/types/meal";

interface MealImageProps {
  type: MealType;
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  aspectRatio?: "1/1" | "4/3" | "16/9";
}

export function MealImage({
  type,
  imageUrl,
  alt = "อาหาร",
  className = "",
  aspectRatio = "4/3",
}: MealImageProps) {
  const aspectClass =
    aspectRatio === "1/1"
      ? "aspect-square"
      : aspectRatio === "16/9"
      ? "aspect-video"
      : "aspect-[4/3]";

  if (imageUrl) {
    return (
      <div
        className={`relative overflow-hidden rounded-[16px] bg-[var(--background-soft)] ${aspectClass} ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // Graceful, Warm Minimal Food Illustrations based on MealType
  return (
    <div
      className={`relative overflow-hidden rounded-[16px] flex items-center justify-center select-none ${aspectClass} ${className}`}
      aria-hidden="true"
    >
      {type === "BREAKFAST" && (
        <div className="w-full h-full bg-[#FAF3E7] dark:bg-[#2A241A] flex flex-col items-center justify-center p-4 transition-colors">
          <svg
            className="w-12 h-12 text-[#DDA34E] dark:text-[#E7B362]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Sunny Egg & Warm Morning Bowl */}
            <circle cx="32" cy="32" r="24" fill="#FFFDF8" stroke="#E9DFD0" strokeWidth="2" className="dark:fill-[#362E21] dark:stroke-[#4A3F2F]" />
            <ellipse cx="32" cy="32" rx="14" ry="14" fill="#FFF8E8" stroke="#E2C98D" strokeWidth="1.5" className="dark:fill-[#423522] dark:stroke-[#5E4C31]" />
            <circle cx="32" cy="32" r="8" fill="#F4B84D" stroke="#E39C2D" />
            <circle cx="30" cy="30" r="2.5" fill="#FFF9ED" opacity="0.8" />
            {/* Little Garnish Dots */}
            <circle cx="21" cy="24" r="1.5" fill="#668A62" />
            <circle cx="43" cy="36" r="1.5" fill="#668A62" />
            <circle cx="25" cy="41" r="1.5" fill="#668A62" />
          </svg>
          <span className="text-[11px] font-medium text-[#9E8357] dark:text-[#CBB58F] mt-2 tracking-wide">
            มื้อเช้าสดใส
          </span>
        </div>
      )}

      {type === "LUNCH" && (
        <div className="w-full h-full bg-[#EEF4EC] dark:bg-[#1E281C] flex flex-col items-center justify-center p-4 transition-colors">
          <svg
            className="w-12 h-12 text-[#668A62] dark:text-[#8AAA82]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Healthy Lunch Plate */}
            <circle cx="32" cy="32" r="25" fill="#FFFDF9" stroke="#DFE7DC" strokeWidth="2" className="dark:fill-[#263124] dark:stroke-[#384635]" />
            {/* Veggie & Protein Silhouettes */}
            <path
              d="M24 36c0-6 4-10 8-10s8 4 8 10"
              fill="#E3EFE0"
              stroke="#668A62"
              strokeWidth="2"
              className="dark:fill-[#2F3D2C]"
            />
            <circle cx="25" cy="25" r="4" fill="#80A57C" />
            <circle cx="32" cy="22" r="4.5" fill="#668A62" />
            <circle cx="39" cy="25" r="4" fill="#80A57C" />
            <path d="M22 38h20" stroke="#496746" strokeWidth="2" />
          </svg>
          <span className="text-[11px] font-medium text-[#587354] dark:text-[#A1BBA0] mt-2 tracking-wide">
            มื้อกลางวันเติมพลัง
          </span>
        </div>
      )}

      {type === "DINNER" && (
        <div className="w-full h-full bg-[#F3EFEA] dark:bg-[#25221F] flex flex-col items-center justify-center p-4 transition-colors">
          <svg
            className="w-12 h-12 text-[#8E8373] dark:text-[#B3A99B]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Cozy Dinner Bowl */}
            <circle cx="32" cy="32" r="24" fill="#FAF7F2" stroke="#E6E0D6" strokeWidth="2" className="dark:fill-[#2D2925] dark:stroke-[#423C36]" />
            <path
              d="M18 32c0 9 6.5 15 14 15s14-6 14-15H18Z"
              fill="#EAE3D7"
              stroke="#8E8373"
              strokeWidth="2"
              className="dark:fill-[#38332D]"
            />
            {/* Steam / Warmth Lines */}
            <path d="M28 20c0-2 1.5-3 1.5-4" stroke="#B8AEA0" strokeWidth="1.75" />
            <path d="M34 22c0-2 1.5-3 1.5-4" stroke="#B8AEA0" strokeWidth="1.75" />
          </svg>
          <span className="text-[11px] font-medium text-[#7C7365] dark:text-[#BCB4A8] mt-2 tracking-wide">
            มื้อเย็นสบายท้อง
          </span>
        </div>
      )}

      {type === "SNACK" && (
        <div className="w-full h-full bg-[#F2F7F0] dark:bg-[#1C261B] flex flex-col items-center justify-center p-4 transition-colors">
          <svg
            className="w-12 h-12 text-[#668A62] dark:text-[#8AAA82]"
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Fresh Fruit / Snack */}
            <circle cx="32" cy="32" r="24" fill="#FCFEFB" stroke="#E2EADF" strokeWidth="2" className="dark:fill-[#222F21] dark:stroke-[#344432]" />
            <path
              d="M32 24c-5-6-13-2-13 6 0 9 10 16 13 18 3-2 13-9 13-18 0-8-8-12-13-6Z"
              fill="#E3EFE0"
              stroke="#668A62"
              strokeWidth="2"
              className="dark:fill-[#2C3B2B]"
            />
            <path d="M32 18v6" stroke="#496746" strokeWidth="2" />
            <path d="M32 19c2-2 5-2 6 0" stroke="#668A62" strokeWidth="1.75" />
          </svg>
          <span className="text-[11px] font-medium text-[#5B7757] dark:text-[#9FB79D] mt-2 tracking-wide">
            ของว่างเบา ๆ
          </span>
        </div>
      )}
    </div>
  );
}
