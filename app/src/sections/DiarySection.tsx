import { useEffect, useMemo, useState } from 'react'
import type { DiaryEntry } from '../types/diary'
import http from '../services/http'

function todayISO() {
  const now = new Date()
  return now.toISOString().slice(0, 10)
}

export default function DiarySection() {
  const today = useMemo(() => todayISO(), [])
  const [entry, setEntry] = useState<DiaryEntry>({
    id: 'today',
    date: today,
    content: '',
  })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadEntry() {
      try {
        const { data } = await http.get<DiaryEntry | null>('/diary/today')
        if (active && data) {
          setEntry({
            id: data.id,
            date: data.date,
            content: data.content,
          })
        }
      } catch {
        if (active) setError('Não foi possível carregar o diário.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEntry()

    return () => {
      active = false
    }
  }, [])

  async function handleSave() {
    try {
      const { data } = await http.put<DiaryEntry>('/diary/today', {
        content: entry.content,
      })
      setEntry({ id: data.id, date: data.date, content: data.content })
      setSaved(true)
      setError('')
      setTimeout(() => setSaved(false), 1200)
    } catch {
      setError('Não foi possível salvar o diário.')
    }
  }

  return (
    <div>
      <h3>Diário</h3>
      <p>Um registro por dia para contexto e reflexões.</p>

      <label style={{ display: 'block', fontWeight: 600, marginTop: 12 }}>
        {entry.date}
      </label>
      <textarea
        value={entry.content}
        onChange={(event) => setEntry({ ...entry, content: event.target.value })}
        placeholder="Como foi o seu dia?"
        rows={6}
        style={{ width: '100%', padding: 12, marginTop: 8 }}
        disabled={loading}
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <button type="button" onClick={handleSave}>
          Salvar
        </button>
        {saved && <span style={{ color: '#16a34a' }}>Salvo</span>}
      </div>
      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  )
}
