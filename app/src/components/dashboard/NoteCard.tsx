import { memo } from 'react'
import type { DragEvent } from 'react'
import { Edit2, GripVertical, Trash2 } from 'lucide-react'
import { m } from 'motion/react'
import type { Note } from '../../types/note'

type NoteColor = {
  bg: string
  border: string
  text: string
}

type NoteCardProps = {
  note: Note
  color: NoteColor
  isEditing: boolean
  isDragged: boolean
  isDragOver: boolean
  editTitle: string
  editContent: string
  onStartEdit: (note: Note) => void
  onSaveEdit: (note: Note) => void
  onRemove: (note: Note) => void
  onCancelEdit: () => void
  onEditTitleChange: (value: string) => void
  onEditContentChange: (value: string) => void
  onDragStart: (noteId: string, event: DragEvent<HTMLDivElement>) => void
  onDragOver: (noteId: string, event: DragEvent<HTMLDivElement>) => void
  onDrop: (noteId: string, event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
}

function NoteCardComponent({
  note,
  color,
  isEditing,
  isDragged,
  isDragOver,
  editTitle,
  editContent,
  onStartEdit,
  onSaveEdit,
  onRemove,
  onCancelEdit,
  onEditTitleChange,
  onEditContentChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: NoteCardProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl"
    >
      <div
        draggable={!isEditing}
        onDragStart={(event) => onDragStart(note.id, event)}
        onDragOver={(event) => onDragOver(note.id, event)}
        onDrop={(event) => onDrop(note.id, event)}
        onDragEnd={onDragEnd}
        className={`p-4 rounded-xl border transition-all duration-200 ${color.bg} ${color.border} ${color.text} ${
          isDragOver ? 'ring-2 ring-accent/30' : ''
        } ${isDragged ? 'opacity-75' : ''}`}
      >
        {isEditing ? (
          <div className="space-y-3">
            <input
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              className="w-full px-3 py-2 bg-white/70 border border-border rounded-lg"
            />
            <textarea
              value={editContent}
              onChange={(event) => onEditContentChange(event.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-white/70 border border-border rounded-lg resize-none"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => onSaveEdit(note)}>
                Salvar
              </button>
              <button type="button" onClick={onCancelEdit}>
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
                  onClick={() => onStartEdit(note)}
                  className="p-1 rounded-md hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                  aria-label={`Editar nota "${note.title}"`}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(note)}
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
    </m.div>
  )
}

const NoteCard = memo(NoteCardComponent)

export default NoteCard
