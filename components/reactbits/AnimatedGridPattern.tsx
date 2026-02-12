"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps {
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    strokeDasharray?: any;
    numSquares?: number;
    className?: string;
    maxOpacity?: number;
    duration?: number;
    repeatDelay?: number;
}

export function AnimatedGridPattern({
    width = 40,
    height = 40,
    x = -1,
    y = -1,
    strokeDasharray = 0,
    numSquares = 50,
    className,
    maxOpacity = 0.5,
    duration = 4,
    repeatDelay = 0.5,
    ...props
}: GridPatternProps) {
    const id = useId();

    return (
        <div className={cn("absolute inset-0 h-full w-full [mask-image:radial-gradient(900px_circle_at_center,white,transparent)]", className)}>
            <svg
                aria-hidden="true"
                className={cn(
                    "pointer-events-none absolute inset-0 h-full w-full fill-gray-400/30 stroke-gray-400/30",
                    className
                )}
                {...props}
            >
                <defs>
                    <pattern
                        id={id}
                        width={width}
                        height={height}
                        patternUnits="userSpaceOnUse"
                        x={x}
                        y={y}
                    >
                        <path
                            d={`M.5 ${height}V.5H${width}`}
                            fill="none"
                            strokeDasharray={strokeDasharray}
                        />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
                <svg x={x} y={y} className="overflow-visible">
                    {Array.from({ length: numSquares }).map((_, i) => (
                        <rect
                            strokeWidth="0"
                            key={`${i}-${id}`}
                            width={width - 1}
                            height={height - 1}
                            x={(i % 10) * width + 1}
                            y={Math.floor(i / 10) * height + 1}
                            fill="currentColor"
                            className="text-neutral-600/30"
                        >
                            <animate
                                attributeName="opacity"
                                values={`0;${maxOpacity};0`}
                                dur={`${duration}s`}
                                begin={`${i * 0.1}s`}
                                repeatCount="indefinite"
                            />
                        </rect>
                    ))}
                </svg>
            </svg>
        </div>
    );
}
