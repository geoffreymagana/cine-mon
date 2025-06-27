"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

export const CineMonLogo = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("w-6 h-6", className)}
    {...props}
  >
    <title>Cine-Mon Logo</title>
    <path d="M4 4h16v16H4z" />
    <path d="M8 4v16" />
    <path d="M16 4v16" />
    <path d="M4 8h4" />
    <path d="M4 16h4" />
    <path d="M16 8h4" />
    <path d="M16 16h4" />
    <path d="M12 4v2" />
    <path d="M12 18v2" />
  </svg>
);
