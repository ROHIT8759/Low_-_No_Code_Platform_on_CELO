import { cn } from "@/lib/utils";
import React from "react";
import { createTransitionStyle } from "@/lib/motion";

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
                // Responsive grid layouts:
                // Mobile: 1 column (stacked)
                // Tablet: 2 columns
                // Desktop: 3 columns
                "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 max-w-7xl mx-auto",
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
    accentColor?: "blue" | "emerald" | "amber" | "zinc";
}) => {
    // Map accent colors to border classes
    const accentStripClass = {
        blue: "border-t-[rgba(59,130,246,0.5)]",
        emerald: "border-t-[rgba(16,185,129,0.5)]",
        amber: "border-t-[rgba(244,183,64,0.55)]",
        zinc: "border-t-[rgba(113,113,122,0.5)]",
    }[accentColor];

    return (
        <div
            className={cn(
                // Infrastructure-grade styling with reduced border radius (12px)
                "row-span-1 rounded-[12px] group/bento",
                // Subtle top accent strip (2px)
                "border-t-2",
                accentStripClass,
                // Surface and border system
                "bg-[var(--surface-1)] border-x border-b border-white/[0.06]",
                // Increased information density (reduced padding from p-4 to p-3)
                "p-3",
                // Hover state: background shift only (no translateY)
                "hover:bg-[var(--surface-2)]",
                // Layout
                "justify-between flex flex-col space-y-3",
                className
            )}
            style={createTransitionStyle(['background-color'], 'normal')}
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
