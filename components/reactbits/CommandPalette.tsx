"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Modal } from "./AnimatedModal";

export const CommandPalette = ({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const [query, setQuery] = React.useState("");

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="p-0">
            <div className="flex items-center border-b border-zinc-800 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    className={cn(
                        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    )}
                    placeholder="Type a command or search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </div>
            <div className="max-h-[300px] overflow-y-auto p-2">
                {/* Placeholder results */}
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No results found.
                </div>
            </div>
        </Modal>
    );
};
