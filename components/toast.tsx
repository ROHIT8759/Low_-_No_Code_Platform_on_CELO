"use client"

import { useState, useEffect, useCallback, createContext, useContext } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertTriangle, Info, X, Zap } from "lucide-react"

interface Toast {
    id: string
    type: "success" | "error" | "warning" | "info"
    message: string
    duration?: number
}

interface ToastContextType {
    addToast: (type: Toast["type"], message: string, duration?: number) => void
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} })

export function useToast() {
    return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addToast = useCallback((type: Toast["type"], message: string, duration = 3000) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`
        setToasts(prev => [...prev, { id, type, message, duration }])
        // Each toast gets its own independent dismiss timer
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration)
    }, [])

    const getIcon = (type: Toast["type"]) => {
        switch (type) {
            case "success": return <CheckCircle className="w-4 h-4 text-emerald-400" />
            case "error": return <AlertTriangle className="w-4 h-4 text-red-400" />
            case "warning": return <Zap className="w-4 h-4 text-amber-400" />
            case "info": return <Info className="w-4 h-4 text-blue-400" />
        }
    }

    const getBorder = (type: Toast["type"]) => {
        switch (type) {
            case "success": return "border-emerald-500/20"
            case "error": return "border-red-500/20"
            case "warning": return "border-amber-500/20"
            case "info": return "border-blue-500/20"
        }
    }

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-2.5 bg-[#0B0F14] border ${getBorder(toast.type)} rounded-lg shadow-2xl min-w-[240px] max-w-sm`}
                        >
                            {getIcon(toast.type)}
                            <span className="text-xs text-zinc-300 flex-1">{toast.message}</span>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    )
}
