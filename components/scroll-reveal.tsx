"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ScrollRevealProps {
    children: ReactNode;
    delay?: number;
}

export function ScrollReveal({ children, delay = 0 }: ScrollRevealProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: delay / 1000 }}
        >
            {children}
        </motion.div>
    );
}
