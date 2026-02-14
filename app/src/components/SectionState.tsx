import { Inbox, Loader2 } from 'lucide-react'
import { m } from 'motion/react'

type SectionStateProps = {
  type: 'loading' | 'empty'
  message: string
}

export default function SectionState({ type, message }: SectionStateProps) {
  const isLoading = type === 'loading'

  return (
    <m.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-xl border border-border/70 bg-secondary/35 px-4 py-5"
    >
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        {isLoading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Inbox size={16} />
        )}
        <p className="text-sm">{message}</p>
      </div>
    </m.div>
  )
}
