
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const ratingColors = [
  { range: [0, 10], ring: "#FF3B30", bg: "rgba(255, 59, 48, 0.2)" },
  { range: [11, 20], ring: "#FF5E3A", bg: "rgba(255, 94, 58, 0.2)" },
  { range: [21, 30], ring: "#FF9500", bg: "rgba(255, 149, 0, 0.2)" },
  { range: [31, 40], ring: "#FFCC00", bg: "rgba(255, 204, 0, 0.2)" },
  { range: [41, 50], ring: "#FFFF66", bg: "rgba(255, 255, 102, 0.2)" },
  { range: [51, 60], ring: "#CCFF66", bg: "rgba(204, 255, 102, 0.2)" },
  { range: [61, 70], ring: "#66FF66", bg: "rgba(102, 255, 102, 0.2)" },
  { range: [71, 80], ring: "#33CC99", bg: "rgba(51, 204, 153, 0.2)" },
  { range: [81, 90], ring: "#3399FF", bg: "rgba(51, 153, 255, 0.2)" },
  { range: [91, 100], ring: "#007AFF", bg: "rgba(0, 122, 255, 0.2)" },
];

const getRatingColor = (percentage: number) => {
  const color = ratingColors.find(
    (c) => percentage >= c.range[0] && percentage <= c.range[1]
  );
  return color || { ring: "#FFFFFF", bg: "rgba(255, 255, 255, 0.2)" };
};

type RatingCircleProps = {
  percentage: number;
  className?: string;
};

export const RatingCircle = ({ percentage, className }: RatingCircleProps) => {
  const size = 44;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  const { ring, bg } = getRatingColor(percentage);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: bg
      }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ring}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-white">
        {Math.round(percentage)}
        <sup className="text-[0.6rem]">%</sup>
      </span>
    </div>
  );
};
