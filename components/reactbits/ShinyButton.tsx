"use client";

import { type AnimationProps, motion } from "framer-motion";
import { cn } from "@/lib/utils";

const animationProps = {
    initial: { "--x": "100%", scale: 0.8 },
    animate: { "--x": "-100%", scale: 1 },
    whileTap: { scale: 0.95 },
    transition: {
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 1,
        type: "spring",
        stiffness: 20,
        damping: 15,
        mass: 2,
        scale: {
            type: "spring",
            stiffness: 200,
            damping: 5,
            mass: 0.5,
        },
    },
} as AnimationProps;

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
}

export const ShinyButton = ({ children, className, ...props }: ShinyButtonProps) => {
    return (
        <motion.button
            {...animationProps}
            {...props}
            className={cn(
                
                "relative rounded-md px-6 py-2.5 font-medium transition-all duration-200 ease-out",
                "bg-zinc-900 border border-zinc-800 text-zinc-100",
                "hover:bg-zinc-800 hover:border-zinc-700 hover:text-white",
                "active:scale-[0.98] active:bg-zinc-800/80",
                "shadow-xs",
                className,
            )}
        >
            <span
                className="relative block h-full w-full text-sm font-medium tracking-tight"
                style={{
                    maskImage:
                        "linear-gradient(-75deg,hsl(var(--foreground)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--foreground)) calc(var(--x) + 100%))",
                }}
            >
                {children}
            </span>
            {}
            <span
                style={{
                    mask: "linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box,linear-gradient(rgb(0,0,0), rgb(0,0,0))",
                    maskComposite: "exclude",
                }}
                className="absolute inset-0 z-10 block rounded-[inherit] bg-[linear-gradient(-75deg,white_calc(var(--x)+20%),transparent_calc(var(--x)+30%),white_calc(var(--x)+100%))] p-px opacity-20"
            ></span>
        </motion.button>
    );
};
