"use client";

import { useState, useEffect } from "react";

// Breakpoints matching standard "Apple" style responsiveness
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

export function useDevice() {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const [width, setWidth] = useState(0);

    useEffect(() => {
        // Initial check
        const checkDevice = () => {
            const w = window.innerWidth;
            setWidth(w);
            if (w < MOBILE_BREAKPOINT) return setDevice("mobile");
            if (w < TABLET_BREAKPOINT) return setDevice("tablet");
            if (w < DESKTOP_BREAKPOINT) return setDevice("laptop");
            return setDevice("desktop");
        };

        // Debounced resize handler
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkDevice, 150); // 150ms debounce
        };

        // Run once on mount
        checkDevice();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return {
        device,
        width,
        isMobile: device === "mobile",
        isTablet: device === "tablet", // iPad Vertical
        isLaptop: device === "laptop", // MacBook Air range
        isDesktop: device === "desktop", // Large displays
        isTouch: device === "mobile" || device === "tablet",
    };
}
