"use client";

import React, { useState } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export const NavbarFloating = ({
    navItems,
    className,
}: {
    navItems: {
        name: string;
        link: string;
        icon?: JSX.Element;
    }[];
    className?: string;
}) => {
    const { scrollYProgress } = useScroll();
    const [visible, setVisible] = useState(true);

    useMotionValueEvent(scrollYProgress, "change", (current) => {
        // Check if current is not undefined and is a number
        if (typeof current === "number") {
            const direction = current - scrollYProgress.getPrevious()!;
            if (scrollYProgress.get() < 0.05) {
                setVisible(true);
            } else {
                if (direction < 0) {
                    setVisible(true);
                } else {
                    setVisible(false);
                }
            }
        }
    });

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{
                    opacity: 1,
                    y: -100,
                }}
                animate={{
                    y: visible ? 0 : -100,
                    opacity: visible ? 1 : 0,
                }}
                transition={{
                    duration: 0.2,
                }}
                className={cn(
                    // Elite Precision Design
                    "flex max-w-fit fixed top-4 inset-x-0 mx-auto border border-zinc-800/60 bg-zinc-900/80 backdrop-blur-md shadow-sm z-[5000] px-6 py-2 items-center justify-center space-x-6 rounded-full",
                    className
                )}
            >
                {navItems.map((navItem: any, idx: number) => (
                    <Link
                        key={`link=${idx}`}
                        href={navItem.link}
                        className={cn(
                            "relative dark:text-neutral-400 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-200 hover:text-neutral-500 transition-colors text-sm font-medium tracking-tight"
                        )}
                    >
                        <span className="block sm:hidden">{navItem.icon}</span>
                        <span className="hidden sm:block">{navItem.name}</span>
                    </Link>
                ))}
                {/* Precision Separator */}
                <div className="h-4 w-[1px] bg-zinc-800"></div>
                <button className="border text-sm font-medium relative border-zinc-800 dark:border-zinc-800/[0.2] text-zinc-400 dark:text-white px-4 py-1.5 rounded-full hover:bg-zinc-800 transition-colors">
                    <span>Login</span>
                    <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-linear-to-r from-transparent via-indigo-500 to-transparent  h-px" />
                </button>
            </motion.div>
        </AnimatePresence>
    );
};
