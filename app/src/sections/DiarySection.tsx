import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Calendar, Plus } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import type { DiaryEntry } from '../types/diary'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import { dashboardKeys, fetchDiaryToday } from '../services/dashboardQueries'

function todayISO() {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

export default function DiarySection() {
  const isMobile = useIsMobile()
  const toast = useToast()
  const queryClient = useQueryClient()
  const today = useMemo(() => todayISO(), [])
  const {
    data: diaryData,
    isLoading: loading,
    error: diaryLoadError,
  } = useQuery<DiaryEntry | null>({
    queryKey: dashboardKeys.diaryToday,
    queryFn: fetchDiaryToday,
  })
  const [entry, setEntry] = useState<DiaryEntry>({
    id: 'today',
    date: today,
    content: '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!diaryData) return
    setEntry({
      id: diaryData.id,
      date: diaryData.date,
      content: diaryData.content,
    })
  }, [diaryData])

  useEffect(() => {
    if (!diaryLoadError) return
    const message = getApiErrorMessage(diaryLoadError, 'Não foi possível carregar o diário.')
    setError((current) => current || message)
    toast.error(message)
  }, [diaryLoadError, toast])

  async function handleSave() {
    try {
      setSaving(true)
      const { data } = await http.put<DiaryEntry>('/diary/today', {
        content: entry.content,
      })
      setEntry({ id: data.id, date: data.date, content: data.content })
      queryClient.setQueryData(dashboardKeys.diaryToday, data)
      setSaved(true)
      setError('')
      toast.success('Diário salvo.')
      setTimeout(() => setSaved(false), 1200)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível salvar o diário.')
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const todayLabel = new Date(entry.date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <m.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <BookOpen size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[1.125rem]">Diário</h3>
          <p className="text-muted-foreground text-[0.8125rem]">
            Um registro por dia
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 text-muted-foreground text-[0.875rem]">
        <Calendar size={16} />
        <span>{todayLabel}</span>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {loading ? (
          <SectionState type="loading" message="Carregando diário..." />
        ) : (
          <textarea
            value={entry.content}
            onChange={(event) => setEntry({ ...entry, content: event.target.value })}
            placeholder="Como foi o seu dia? O que você aprendeu?"
            className="w-full h-full min-h-[180px] px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200 resize-none"
            style={{ fontSize: '0.9375rem', lineHeight: '1.6' }}
            disabled={loading}
          />
        )}

        <AnimatePresence mode="wait">
          {error && (
            <m.div
              key="error"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-center py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm"
            >
              {error}
            </m.div>
          )}
          {saving && !error && (
            <m.div
              key="saving"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-center py-2 px-4 bg-muted text-muted-foreground rounded-lg text-sm"
            >
              Salvando...
            </m.div>
          )}
          {!saving && saved && !error && (
            <m.div
              key="saved"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="text-center py-2 px-4 bg-accent/10 text-accent rounded-lg text-sm"
            >
              Entrada salva ✓
            </m.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading || saving}
          className="mt-auto w-full bg-accent text-accent-foreground py-2.5 px-4 rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Salvar</span>
        </button>
      </div>
    </m.div>
  )
}
