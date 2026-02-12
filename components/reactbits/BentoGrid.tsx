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
}: {
    className?: string;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    header?: React.ReactNode;
    icon?: React.ReactNode;
}) => {
    return (
        <div
            className={cn(
                "row-span-1 rounded-lg group/bento hover:shadow-xl transition duration-200 shadow-none p-4",
                "bg-[#11151A] border border-[#222730] justify-between flex flex-col space-y-4",
                "hover:bg-[#161B22] hover:border-[#30363D]",
                className
            )}
        >
            {header}
            <div className="group-hover/bento:translate-x-2 transition duration-200">
                {icon}
                <div className="font-mono font-bold text-zinc-200 mb-2 mt-2 text-sm uppercase tracking-wider">
                    {title}
                </div>
                <div className="font-sans font-normal text-zinc-500 text-xs leading-relaxed">
                    {description}
                </div>
            </div>
        </div>
    );
};
