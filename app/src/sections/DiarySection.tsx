import { useMemo, useState } from 'react'
import type { DiaryEntry } from '../types/diary'

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

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
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
      />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 12 }}>
        <button type="button" onClick={handleSave}>
          Salvar
        </button>
        {saved && <span style={{ color: '#16a34a' }}>Salvo</span>}
      </div>
    </div>
  )
}
