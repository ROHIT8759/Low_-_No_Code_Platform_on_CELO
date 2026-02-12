import { cn } from "@/lib/utils";
import React from "react";

export const BentoGrid = ({
    className,
    children,
}: {
    className?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "grid grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto",
                className
            )}
        >
            {children}
        </div>
    );
};

export const BentoGridItem = ({
    className,
    title,
    description,
    header,
    icon,
    accentColor = "blue",
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
    accentColor?: "blue" | "emerald" | "purple" | "zinc";
}) => {
    // Map accent colors to border classes
    const accentStripClass = {
        blue: "border-t-[rgba(59,130,246,0.5)]",
        emerald: "border-t-[rgba(16,185,129,0.5)]",
        purple: "border-t-[rgba(139,92,246,0.5)]",
        zinc: "border-t-[rgba(113,113,122,0.5)]",
    }[accentColor];

    return (
        <div
            className={cn(
                // Infrastructure-grade styling with reduced border radius (12px)
                "row-span-1 rounded-[12px] group/bento transition-infrastructure shadow-none",
                // Subtle top accent strip (2px)
                "border-t-2",
                accentStripClass,
                // Surface and border system
                "bg-[#11151A] border-x border-b border-[rgba(255,255,255,0.06)]",
                // Increased information density (reduced padding from p-4 to p-3)
                "p-3",
                // Hover state: background shift only (no translateY)
                "hover:bg-[#161B22]",
                // Layout
                "justify-between flex flex-col space-y-3",
                className
            )}
        >
            {header}
            <div className="flex flex-col">
                {icon}
                <div className="font-mono font-bold text-zinc-200 mb-1.5 mt-2 text-sm uppercase tracking-wider">
                    {title}
                </div>
                <div className="font-sans font-normal text-zinc-500 text-xs leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
