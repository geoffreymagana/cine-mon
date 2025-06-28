"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const ratingColors = [
  { range: [0, 10], color: "#FF3B30" },
  { range: [11, 20], color: "#FF5E3A" },
  { range: [21, 30], color: "#FF9500" },
  { range: [31, 40], color: "#FFCC00" },
  { range: [41, 50], color: "#FFFF66" },
  { range: [51, 60], color: "#CCFF66" },
  { range: [61, 70], color: "#66FF66" },
  { range: [71, 80], color: "#33CC99" },
  { range: [81, 90], color: "#3399FF" },
  { range: [91, 100], color: "#007AFF" },
];

const getRatingColor = (percentage: number) => {
  const color = ratingColors.find(
    (c) => percentage >= c.range[0] && percentage <= c.range[1]
  );
  return color?.color || "#FFFFFF";
};

type RatingProgressBarProps = {
  percentage: number;
  className?: string;
};

export const RatingProgressBar = ({ percentage, className }: RatingProgressBarProps) => {
  const color = getRatingColor(percentage);

  return (
    <div className={cn("flex w-full items-center gap-2", className)}>
      <ProgressPrimitive.Root
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
        value={percentage}
      >
        <ProgressPrimitive.Indicator
          className="h-full w-full flex-1 transition-all"
          style={{
            backgroundColor: color,
            transform: `translateX(-${100 - (percentage || 0)}%)`,
          }}
        />
      </ProgressPrimitive.Root>
      <span className="font-semibold text-sm w-12 text-right tabular-nums">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};
