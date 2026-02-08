"use client"

import { useEffect, useState } from "react"

export default function PageLoader({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isLoading) {
      document.body.classList.add("loading-lock")
    } else {
      document.body.classList.remove("loading-lock")
    }

    return () => {
      document.body.classList.remove("loading-lock")
    }
  }, [isLoading])

  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/98 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border border-white/20 border-t-white" />
            <div className="space-y-1">
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                Loading
              </p>
              <p className="text-xs text-white/40">
                Preparing the experience
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
