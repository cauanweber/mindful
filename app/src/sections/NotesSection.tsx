import { useEffect, useState } from 'react'
import { Edit2, Plus, StickyNote, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Note } from '../types/note'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'

const NOTE_COLORS = [
  { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
  { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
]

export default function NotesSection() {
  const isMobile = useIsMobile()
  const toast = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    let active = true

    async function loadNotes() {
      try {
        const { data } = await http.get<Note[]>('/notes')
        if (active) setNotes(data)
      } catch (error) {
        if (active) {
          const message = getApiErrorMessage(error, 'Não foi possível carregar as notas.')
          setError(message)
          toast.error(message)
        }
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
      setError('')
      toast.success('Nota criada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível criar a nota.')
      setError(message)
      toast.error(message)
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }

  async function saveEdit(note: Note) {
    if (!editTitle.trim()) {
      setError('Título obrigatório.')
      return
    }

    try {
      const { data } = await http.patch<Note>(`/notes/${note.id}`, {
        title: editTitle.trim(),
        content: editContent.trim(),
      })
      setNotes(notes.map((item) => (item.id === note.id ? data : item)))
      cancelEdit()
      setError('')
      toast.success('Nota atualizada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a nota.')
      setError(message)
      toast.error(message)
    }
  }

  async function removeNote(note: Note) {
    try {
      await http.delete(`/notes/${note.id}`)
      setNotes(notes.filter((item) => item.id !== note.id))
      setError('')
      toast.success('Nota removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a nota.')
      setError(message)
      toast.error(message)
    }
  }

  return (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <StickyNote size={20} className="text-accent" />
        </div>
        <div>
          <h3 className="text-[1.125rem]">Notas</h3>
          <p className="text-muted-foreground text-[0.8125rem]">
            Base de conhecimento atemporal
          </p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título"
          className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
        />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva sua nota"
          rows={3}
          className="w-full px-4 py-3 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200 resize-none"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="w-full bg-accent text-accent-foreground py-2.5 px-4 rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Adicionar nota</span>
        </button>
      </div>

      {error && (
        <div className="text-center py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && <SectionState type="loading" message="Carregando notas..." />}
        {!loading && notes.length === 0 && (
          <SectionState type="empty" message="Nenhuma nota criada." />
        )}
        <AnimatePresence>
          {notes.map((note, index) => {
            const color = NOTE_COLORS[index % NOTE_COLORS.length]

            return (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`p-4 rounded-xl border ${color.bg} ${color.border} ${color.text}`}
              >
                {editingId === note.id ? (
                  <div className="space-y-3">
                    <input
                      value={editTitle}
                      onChange={(event) => setEditTitle(event.target.value)}
                      className="w-full px-3 py-2 bg-white/70 border border-border rounded-lg"
                    />
                    <textarea
                      value={editContent}
                      onChange={(event) => setEditContent(event.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-white/70 border border-border rounded-lg resize-none"
                    />
                    <div className="flex gap-2">
                      <button type="button" onClick={() => saveEdit(note)}>
                        Salvar
                      </button>
                      <button type="button" onClick={cancelEdit}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{note.title}</h4>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="p-1 rounded-md hover:bg-white/60"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNote(note)}
                          className="p-1 rounded-md hover:bg-white/60"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed">
                      {note.content || 'Sem conteúdo'}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      Atualizado em {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
