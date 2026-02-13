"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop";

export function useDevice() {
    const [device, setDevice] = useState<DeviceType>("desktop");
    const [width, setWidth] = useState(0);

    useEffect(() => {
        
        const checkDevice = () => {
            const w = window.innerWidth;
            setWidth(w);
            if (w < MOBILE_BREAKPOINT) return setDevice("mobile");
            if (w < TABLET_BREAKPOINT) return setDevice("tablet");
            if (w < DESKTOP_BREAKPOINT) return setDevice("laptop");
            return setDevice("desktop");
        };

        
        let timeoutId: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(checkDevice, 150); 
        };

        
        checkDevice();

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return {
        device,
        width,
        isMobile: device === "mobile",
        isTablet: device === "tablet", 
        isLaptop: device === "laptop", 
        isDesktop: device === "desktop", 
        isTouch: device === "mobile" || device === "tablet",
    };
}
