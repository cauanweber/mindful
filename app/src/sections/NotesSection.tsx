import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { Plus, StickyNote } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import type { Note } from '../types/note'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import { getNotesData, setNotesData } from '../services/dashboardData'
import NoteCard from '../components/dashboard/NoteCard'

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
  }, [toast])

  const notesWithColor = useMemo(
    () => notes.map((note, index) => ({ note, color: NOTE_COLORS[index % NOTE_COLORS.length] })),
    [notes],
  )

  const handleAdd = useCallback(async () => {
    if (!title.trim() && !content.trim()) return

    try {
      const { data } = await http.post<Note>('/notes', {
        title: title.trim() || 'Sem título',
        content: content.trim(),
      })

      setNotes((prev) => {
        const next = [data, ...prev]
        setNotesData(next)
        return next
      })
      setTitle('')
      setContent('')
      setError('')
      toast.success('Nota criada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível criar a nota.')
      setError(message)
      toast.error(message)
    }
  }, [content, title, toast])

  const startEdit = useCallback((note: Note) => {
    setEditingId(note.id)
    setEditTitle(note.title)
    setEditContent(note.content)
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
  }, [])

  const saveEdit = useCallback(
    async (note: Note) => {
      if (!editTitle.trim()) {
        setError('Título obrigatório.')
        return
      }

      try {
        const { data } = await http.patch<Note>(`/notes/${note.id}`, {
          title: editTitle.trim(),
          content: editContent.trim(),
        })

        setNotes((prev) => {
          const next = prev.map((item) => (item.id === note.id ? data : item))
          setNotesData(next)
          return next
        })
        cancelEdit()
        setError('')
        toast.success('Nota atualizada.')
      } catch (error) {
        const message = getApiErrorMessage(error, 'Não foi possível atualizar a nota.')
        setError(message)
        toast.error(message)
      }
    },
    [cancelEdit, editContent, editTitle, toast],
  )

  const removeNote = useCallback(async (note: Note) => {
    try {
      await http.delete(`/notes/${note.id}`)
      setNotes((prev) => {
        const next = prev.filter((item) => item.id !== note.id)
        setNotesData(next)
        return next
      })
      setError('')
      toast.success('Nota removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a nota.')
      setError(message)
      toast.error(message)
    }
  }, [toast])

  const reorderNotes = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return null

    let nextOrder: string[] | null = null

    setNotes((prev) => {
      const fromIndex = prev.findIndex((note) => note.id === fromId)
      const toIndex = prev.findIndex((note) => note.id === toId)
      if (fromIndex < 0 || toIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      nextOrder = next.map((note) => note.id)
      setNotesData(next)
      return next
    })

    return nextOrder
  }, [])

  const refreshNotes = useCallback(async () => {
    const data = await getNotesData({ force: true })
    setNotes(data)
    setNotesData(data)
  }, [])

  const persistNotesOrder = useCallback(async (ids: string[]) => {
    await http.put('/notes/reorder', { ids })
  }, [])

  const handleDragStart = useCallback((noteId: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', noteId)
    setDraggedNoteId(noteId)
  }, [])

  const handleDragOver = useCallback((noteId: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (dragOverNoteId !== noteId) setDragOverNoteId(noteId)
  }, [dragOverNoteId])

  const handleDrop = useCallback((noteId: string, event: DragEvent<HTMLDivElement>) => {
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
            await refreshNotes()
          } catch {
            // ignore refresh error to keep current UI state
          }
        })
      }
    }
    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }, [draggedNoteId, persistNotesOrder, refreshNotes, reorderNotes, toast])

  const handleDragEnd = useCallback(() => {
    setDraggedNoteId(null)
    setDragOverNoteId(null)
  }, [])

  return (
    <m.div
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
          {notesWithColor.map(({ note, color }) => (
            <NoteCard
              key={note.id}
              note={note}
              color={color}
              isEditing={editingId === note.id}
              isDragged={draggedNoteId === note.id}
              isDragOver={dragOverNoteId === note.id}
              editTitle={editTitle}
              editContent={editContent}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onRemove={removeNote}
              onCancelEdit={cancelEdit}
              onEditTitleChange={setEditTitle}
              onEditContentChange={setEditContent}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          ))}
        </AnimatePresence>
      </div>
    </m.div>
  )
}
