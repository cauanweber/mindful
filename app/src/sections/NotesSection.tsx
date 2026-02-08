import { useState } from 'react'
import type { Note } from '../types/note'

function nowISO() {
  return new Date().toISOString()
}

export default function NotesSection() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  function handleAdd() {
    if (!title.trim() && !content.trim()) return

    const newNote: Note = {
      id: crypto.randomUUID(),
      title: title.trim() || 'Sem título',
      content: content.trim(),
      updatedAt: nowISO(),
    }

    setNotes([newNote, ...notes])
    setTitle('')
    setContent('')
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

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {notes.length === 0 && <li>Nenhuma nota criada.</li>}
        {notes.map((note) => (
          <li
            key={note.id}
            style={{ border: '1px solid #e5e7eb', padding: 12, marginTop: 8 }}
          >
            <strong>{note.title}</strong>
            <p style={{ margin: '8px 0' }}>{note.content || 'Sem conteúdo'}</p>
            <small>Atualizado em {new Date(note.updatedAt).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  )
}
