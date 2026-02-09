import { useEffect, useState } from 'react'
import type { Note } from '../types/note'
import http from '../services/http'

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadNotes() {
      try {
        const { data } = await http.get<Note[]>('/notes')
        if (active) setNotes(data)
      } catch {
        if (active) setError('Não foi possível carregar as notas.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadNotes()

    return () => {
      active = false
    }
  }, [])

  async function handleAdd() {
    if (!title.trim() && !content.trim()) return

    try {
      const { data } = await http.post<Note>('/notes', {
        title: title.trim() || 'Sem título',
        content: content.trim(),
      })

      setNotes([data, ...notes])
      setTitle('')
      setContent('')
    } catch {
      setError('Não foi possível criar a nota.')
    }
  }

  async function removeNote(note: Note) {
    try {
      await http.delete(`/notes/${note.id}`)
      setNotes(notes.filter((item) => item.id !== note.id))
    } catch {
      setError('Não foi possível remover a nota.')
    }
  }

  return (
    <div>
      <h3>Notas</h3>
      <p>Base de conhecimento e ideias atemporais.</p>

      <div style={{ display: 'grid', gap: 8, maxWidth: 520 }}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          style={{ padding: 10 }}
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva sua nota"
          rows={4}
          style={{ padding: 10 }}
        />
        <button type="button" onClick={handleAdd}>
          Adicionar nota
        </button>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {loading && <li>Carregando...</li>}
        {!loading && notes.length === 0 && <li>Nenhuma nota criada.</li>}
        {notes.map((note) => (
          <li
            key={note.id}
            style={{ border: '1px solid #e5e7eb', padding: 12, marginTop: 8 }}
          >
            <strong>{note.title}</strong>
            <p style={{ margin: '8px 0' }}>{note.content || 'Sem conteúdo'}</p>
            <small>Atualizado em {new Date(note.updatedAt).toLocaleString()}</small>
            <div style={{ marginTop: 8 }}>
              <button type="button" onClick={() => removeNote(note)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
