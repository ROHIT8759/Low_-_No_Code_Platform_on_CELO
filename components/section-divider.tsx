"use client"

export default function SectionDivider({ label }: { label?: string }) {
  return (
    <div className="my-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative flex items-center">
          <div className="w-full">
            {}
            <div className="h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent shadow-[0_8px_26px_rgba(53,208,127,0.06)]" />
          </div>

          {}
          <span className="absolute left-0 -ml-4 w-4 h-4 rounded-full bg-emerald-400 opacity-80 blur-md" aria-hidden />

          {}
          <span className="absolute right-0 -mr-4 w-4 h-4 rounded-full bg-amber-400 opacity-80 blur-md" aria-hidden />

          {label ? (
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card/70 px-3 py-1 rounded-full text-sm border border-border text-muted-foreground">
              {label}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}
