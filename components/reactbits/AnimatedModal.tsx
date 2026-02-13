"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Modal = ({
    isOpen,
    onClose,
    children,
    className,
}: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-60 h-full w-full bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={cn(
                            "fixed left-[50%] top-[50%] z-70 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-900 p-6 shadow-lg sm:rounded-lg md:w-full",
                            "glass-panel",
                            className
                        )}
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>
                        {children}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
