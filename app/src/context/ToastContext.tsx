import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Info, XCircle } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

type ToastType = 'success' | 'error' | 'info'

type ToastItem = {
  id: number
  type: ToastType
  message: string
}

type ToastContextValue = {
  success: (message: string, durationMs?: number) => void
  error: (message: string, durationMs?: number) => void
  info: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function toastIcon(type: ToastType) {
  if (type === 'success') return <CheckCircle2 size={18} />
  if (type === 'error') return <XCircle size={18} />
  return <Info size={18} />
}

function toastClassName(type: ToastType) {
  if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (type === 'error') return 'border-red-200 bg-red-50 text-red-800'
  return 'border-blue-200 bg-blue-50 text-blue-800'
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(0)

  const removeToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (type: ToastType, message: string, durationMs = 3200) => {
      const id = ++idRef.current
      setToasts((current) => [...current, { id, type, message }])
      window.setTimeout(() => removeToast(id), durationMs)
    },
    [removeToast],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (message, durationMs) => pushToast('success', message, durationMs),
      error: (message, durationMs) => pushToast('error', message, durationMs),
      info: (message, durationMs) => pushToast('info', message, durationMs),
    }),
    [pushToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(92vw,360px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto rounded-xl border px-3 py-2 shadow-sm ${toastClassName(toast.type)}`}
            >
              <div className="flex items-start gap-2">
                <span className="mt-0.5">{toastIcon(toast.type)}</span>
                <p className="text-sm leading-relaxed">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
