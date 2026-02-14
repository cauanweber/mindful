import { useEffect, useState } from 'react'
import { Edit2, GripVertical, Plus, StickyNote, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Note } from '../types/note'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import { getNotesData, setNotesData } from '../services/dashboardData'

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
  const [draggedNoteId, setDraggedNoteId] = useState<string | null>(null)
  const [dragOverNoteId, setDragOverNoteId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadNotes() {
      try {
        const data = await getNotesData()
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

      const next = [data, ...notes]
      setNotes(next)
      setNotesData(next)
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
      const next = notes.map((item) => (item.id === note.id ? data : item))
      setNotes(next)
      setNotesData(next)
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
      const next = notes.filter((item) => item.id !== note.id)
      setNotes(next)
      setNotesData(next)
      setError('')
      toast.success('Nota removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a nota.')
      setError(message)
      toast.error(message)
    }
  }

  function reorderNotes(fromId: string, toId: string) {
    if (fromId === toId) return null

    const fromIndex = notes.findIndex((note) => note.id === fromId)
    const toIndex = notes.findIndex((note) => note.id === toId)
    if (fromIndex < 0 || toIndex < 0) return null

    const next = [...notes]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setNotes(next)
    setNotesData(next)
    return next.map((note) => note.id)
  }

  async function loadNotes() {
    const data = await getNotesData({ force: true })
    setNotes(data)
    setNotesData(data)
  }

  async function persistNotesOrder(ids: string[]) {
    await http.put('/notes/reorder', { ids })
  }

  function handleDragStart(noteId: string, event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', noteId)
    setDraggedNoteId(noteId)
  }

  function handleDragOver(noteId: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (dragOverNoteId !== noteId) setDragOverNoteId(noteId)
  }

  function handleDrop(noteId: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const fromId = event.dataTransfer.getData('text/plain') || draggedNoteId
    if (fromId) {
      const nextOrder = reorderNotes(fromId, noteId)
      if (nextOrder) {
        persistNotesOrder(nextOrder).catch(async (error) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar a ordem.')
          setError(message)
          toast.error(message)
          try {
            await loadNotes()
          } catch {}
        })
      }
    }
    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }

  function handleDragEnd() {
    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }

  return (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col overflow-visible"
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
          className="w-full bg-accent text-accent-foreground py-2.5 px-4 rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
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

      <div className="overflow-visible overflow-x-hidden space-y-3 pr-1">
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
                className="rounded-xl"
              >
                <div
                  draggable={editingId !== note.id}
                  onDragStart={(event) => handleDragStart(note.id, event)}
                  onDragOver={(event) => handleDragOver(note.id, event)}
                  onDrop={(event) => handleDrop(note.id, event)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 rounded-xl border transition-all duration-200 ${color.bg} ${color.border} ${color.text} ${
                    dragOverNoteId === note.id ? 'ring-2 ring-accent/30' : ''
                  } ${draggedNoteId === note.id ? 'opacity-75' : ''}`}
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
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span
                          className="text-muted-foreground/70 cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
                          title="Arrastar nota"
                        >
                          <GripVertical size={16} />
                        </span>
                        <h4 className="font-semibold leading-snug break-words [overflow-wrap:anywhere] min-w-0">
                          {note.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEdit(note)}
                          className="p-1 rounded-md hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                          aria-label={`Editar nota "${note.title}"`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeNote(note)}
                          className="p-1 rounded-md hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                          aria-label={`Remover nota "${note.title}"`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {note.content || 'Sem conteúdo'}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      Atualizado em {new Date(note.updatedAt).toLocaleString()}
                    </p>
                  </>
                )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
