import { memo } from 'react'
import type { DragEvent } from 'react'
import { Check, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { m } from 'motion/react'
import type { Task } from '../../types/task'

type PriorityOption = {
  value: 'HIGH' | 'MEDIUM' | 'LOW'
  label: string
  className: string
}

type TaskItemProps = {
  task: Task
  isEditing: boolean
  isDragged: boolean
  isDragOver: boolean
  isNew: boolean
  editTitle: string
  editDueDate: string
  editPriority: 'LOW' | 'MEDIUM' | 'HIGH'
  priorityOptions: readonly PriorityOption[]
  formatShortDate: (value: string) => string
  onToggle: (task: Task) => void
  onStartEdit: (task: Task) => void
  onSaveEdit: (task: Task) => void
  onRemove: (task: Task) => void
  onCancelEdit: () => void
  onEditTitleChange: (value: string) => void
  onEditDueDateChange: (value: string) => void
  onEditPriorityChange: (value: 'LOW' | 'MEDIUM' | 'HIGH') => void
  onDragStart: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  onDragOver: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  onDrop: (taskId: string, event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
}

function TaskItemComponent({
  task,
  isEditing,
  isDragged,
  isDragOver,
  isNew,
  editTitle,
  editDueDate,
  editPriority,
  priorityOptions,
  formatShortDate,
  onToggle,
  onStartEdit,
  onSaveEdit,
  onRemove,
  onCancelEdit,
  onEditTitleChange,
  onEditDueDateChange,
  onEditPriorityChange,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: TaskItemProps) {
  const option =
    priorityOptions.find((item) => item.value === task.priority) || priorityOptions[1]

  return (
    <m.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl"
    >
      <div
        draggable={!isEditing}
        onDragStart={(event) => onDragStart(task.id, event)}
        onDragOver={(event) => onDragOver(task.id, event)}
        onDrop={(event) => onDrop(task.id, event)}
        onDragEnd={onDragEnd}
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
          isDragOver ? 'border-accent/60 bg-accent/[0.04]' : 'border-border hover:border-accent/40'
        } ${isDragged ? 'opacity-70' : ''}`}
        style={isNew ? { boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.15)' } : undefined}
      >
        <span
          className="text-muted-foreground/70 cursor-grab active:cursor-grabbing shrink-0"
          title="Arrastar tarefa"
        >
          <GripVertical size={16} />
        </span>
        <button
          type="button"
          onClick={() => onToggle(task)}
          className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-accent border-accent text-accent-foreground'
              : 'border-muted-foreground/40 text-muted-foreground'
          } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`}
          aria-label={
            task.completed
              ? `Marcar tarefa "${task.title}" como não concluída`
              : `Marcar tarefa "${task.title}" como concluída`
          }
          aria-pressed={task.completed}
        >
          {task.completed && <Check size={14} />}
        </button>

        {isEditing ? (
          <div className="flex-1 grid gap-2">
            <input
              value={editTitle}
              onChange={(event) => onEditTitleChange(event.target.value)}
              placeholder="Título"
              className="px-3 py-2 bg-secondary/50 border border-input rounded-lg"
            />
            <select
              value={editPriority}
              onChange={(event) =>
                onEditPriorityChange(event.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
              }
              className="px-3 py-2 bg-secondary/50 border border-input rounded-lg text-sm"
            >
              {priorityOptions.map((priorityOption) => (
                <option key={priorityOption.value} value={priorityOption.value}>
                  {priorityOption.label}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={editDueDate}
              onChange={(event) => onEditDueDateChange(event.target.value)}
              className="px-3 py-2 bg-secondary/50 border border-input rounded-lg"
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => onSaveEdit(task)} className="text-sm">
                Salvar
              </button>
              <button type="button" onClick={onCancelEdit} className="text-sm">
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  task.completed ? 'line-through text-muted-foreground' : ''
                }`}
                title={task.title}
              >
                {task.title}
              </p>
              <span className={`text-[11px] px-2 py-0.5 rounded-full border ${option.className} shrink-0`}>
                {option.label}
              </span>
            </div>
            {task.dueDate && (
              <p className="text-xs text-muted-foreground">{formatShortDate(task.dueDate)}</p>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onStartEdit(task)}
              className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Editar tarefa "${task.title}"`}
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              onClick={() => onRemove(task)}
              className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={`Remover tarefa "${task.title}"`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
    </m.div>
  )
}

const TaskItem = memo(TaskItemComponent)

export default TaskItem
