import { useEffect, useMemo, useState } from 'react'
import { Check, CheckSquare, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { Task } from '../types/task'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import { getTasksData, setTasksData } from '../services/dashboardData'

const PRIORITY_OPTIONS = [
  { value: 'HIGH', label: 'Alta', className: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'MEDIUM', label: 'Média', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'LOW', label: 'Baixa', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
] as const

function parseDateOnly(value: string) {
  const [datePart] = value.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function formatShortDate(value: string) {
  const date = parseDateOnly(value)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function getTaskGroup(task: Task) {
  if (!task.dueDate) return 'sem-data'

  const today = startOfDay(new Date())
  const due = startOfDay(parseDateOnly(task.dueDate))
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000)

  if (diffDays < 0) return 'atrasadas'
  if (diffDays === 0) return 'hoje'
  if (diffDays === 1) return 'amanha'
  if (diffDays <= 7) return 'semana'
  return 'futuro'
}

const GROUP_LABELS: Record<string, string> = {
  atrasadas: 'Atrasadas',
  hoje: 'Hoje',
  amanha: 'Amanhã',
  semana: 'Esta semana',
  futuro: 'Próximas',
  'sem-data': 'Sem data',
}

export default function TasksSection() {
  const isMobile = useIsMobile()
  const toast = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [focusToday, setFocusToday] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>(
    'MEDIUM',
  )
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadTasks() {
      try {
        const data = await getTasksData()
        if (active) setTasks(data)
      } catch (error) {
        if (active) {
          const message = getApiErrorMessage(error, 'Não foi possível carregar as tarefas.')
          setError(message)
          toast.error(message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadTasks()

    return () => {
      active = false
    }
  }, [])

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {
      atrasadas: [],
      hoje: [],
      amanha: [],
      semana: [],
      futuro: [],
      'sem-data': [],
    }

    const todayDate = startOfDay(new Date()).toISOString().slice(0, 10)
    const filtered = focusToday
      ? tasks.filter((task) => task.dueDate?.slice(0, 10) === todayDate)
      : tasks

    filtered.forEach((task) => {
      groups[getTaskGroup(task)].push(task)
    })

    return groups
  }, [tasks, focusToday])

  async function handleAdd() {
    if (!title.trim()) return

    try {
      const { data } = await http.post<Task>('/tasks', {
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
      })

      setTasks([data, ...tasks])
      setTasksData([data, ...tasks])
      setTitle('')
      setPriority('MEDIUM')
      setDueDate('')
      setError('')
      setLastCreatedId(data.id)
      toast.success('Tarefa criada.')
      setTimeout(() => setLastCreatedId(null), 1200)
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível criar a tarefa.')
      setError(message)
      toast.error(message)
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { data } = await http.patch<Task>(`/tasks/${task.id}`, {
        completed: !task.completed,
      })
      const next = tasks.map((item) => (item.id === task.id ? data : item))
      setTasks(next)
      setTasksData(next)
      setError('')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a tarefa.')
      setError(message)
      toast.error(message)
    }
  }

  function startEdit(task: Task) {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setEditPriority(task.priority || 'MEDIUM')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDueDate('')
    setEditPriority('MEDIUM')
  }

  async function saveEdit(task: Task) {
    if (!editTitle.trim()) {
      setError('Título obrigatório.')
      return
    }

    try {
      const { data } = await http.patch<Task>(`/tasks/${task.id}`, {
        title: editTitle.trim(),
        dueDate: editDueDate || null,
        priority: editPriority,
      })
      const next = tasks.map((item) => (item.id === task.id ? data : item))
      setTasks(next)
      setTasksData(next)
      cancelEdit()
      setError('')
      toast.success('Tarefa atualizada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a tarefa.')
      setError(message)
      toast.error(message)
    }
  }

  async function removeTask(task: Task) {
    try {
      await http.delete(`/tasks/${task.id}`)
      const next = tasks.filter((item) => item.id !== task.id)
      setTasks(next)
      setTasksData(next)
      setError('')
      toast.success('Tarefa removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a tarefa.')
      setError(message)
      toast.error(message)
    }
  }

  function reorderTasks(fromId: string, toId: string) {
    if (fromId === toId) return null

    const fromIndex = tasks.findIndex((task) => task.id === fromId)
    const toIndex = tasks.findIndex((task) => task.id === toId)
    if (fromIndex < 0 || toIndex < 0) return null

    const next = [...tasks]
    const [moved] = next.splice(fromIndex, 1)
    next.splice(toIndex, 0, moved)
    setTasks(next)
    setTasksData(next)
    return next.map((task) => task.id)
  }

  async function loadTasks() {
    const data = await getTasksData({ force: true })
    setTasks(data)
    setTasksData(data)
  }

  async function persistTasksOrder(ids: string[]) {
    await http.put('/tasks/reorder', { ids })
  }

  function handleDragStart(taskId: string, event: React.DragEvent<HTMLDivElement>) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', taskId)
    setDraggedTaskId(taskId)
  }

  function handleDragOver(taskId: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (dragOverTaskId !== taskId) setDragOverTaskId(taskId)
  }

  function handleDrop(taskId: string, event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    const fromId = event.dataTransfer.getData('text/plain') || draggedTaskId
    if (fromId) {
      const nextOrder = reorderTasks(fromId, taskId)
      if (nextOrder) {
        persistTasksOrder(nextOrder).catch(async (error) => {
          const message = getApiErrorMessage(error, 'Não foi possível salvar a ordem.')
          setError(message)
          toast.error(message)
          try {
            await loadTasks()
          } catch {}
        })
      }
    }
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  function handleDragEnd() {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }

  const completedCount = tasks.filter((task) => task.completed).length
  const visibleTasksCount = Object.values(groupedTasks).reduce(
    (count, group) => count + group.length,
    0,
  )

  return (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm flex flex-col overflow-visible"
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckSquare size={20} className="text-accent" />
          </div>
          <div>
            <h3 className="text-[1.125rem]">Tarefas</h3>
            <p className="text-muted-foreground text-[0.8125rem]">
              {completedCount}/{tasks.length} concluídas
            </p>
          </div>
        </div>
        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm">
          <input
            type="checkbox"
            className="accent-[color:var(--accent)]"
            checked={focusToday}
            onChange={(event) => setFocusToday(event.target.checked)}
            aria-label="Filtrar tarefas para somente hoje"
          />
          Somente hoje
        </label>
      </div>

      <div className="flex flex-col gap-2 mb-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova tarefa"
          className="w-full px-4 py-2.5 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
            }
            className="w-[120px] px-3 py-2.5 bg-secondary/50 border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-[150px] px-3 py-2.5 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
          />
          <motion.button
            type="button"
            onClick={handleAdd}
            className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            whileTap={{ scale: 0.92 }}
            aria-label="Adicionar tarefa"
          >
            <Plus size={18} />
          </motion.button>
        </div>
      </div>

      {error && (
        <div className="text-center py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      <div className="space-y-4 overflow-visible">
        {loading && <SectionState type="loading" message="Carregando tarefas..." />}
        {!loading && visibleTasksCount === 0 && (
          <SectionState
            type="empty"
            message={focusToday ? 'Nenhuma tarefa para hoje.' : 'Nenhuma tarefa criada.'}
          />
        )}

        {Object.entries(groupedTasks).map(([groupKey, groupItems]) => {
          if (groupItems.length === 0) return null

          return (
            <div key={groupKey} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {GROUP_LABELS[groupKey]}
              </p>
              <motion.div layout="position" className="space-y-2">
                {groupItems.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-xl"
                  >
                    <div
                      draggable={editingId !== task.id}
                      onDragStart={(event) => handleDragStart(task.id, event)}
                      onDragOver={(event) => handleDragOver(task.id, event)}
                      onDrop={(event) => handleDrop(task.id, event)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        dragOverTaskId === task.id
                          ? 'border-accent/60 bg-accent/[0.04]'
                          : 'border-border hover:border-accent/40'
                      } ${draggedTaskId === task.id ? 'opacity-70' : ''}`}
                      style={
                        lastCreatedId === task.id
                          ? { boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.15)' }
                          : undefined
                      }
                    >
                      <span
                        className="text-muted-foreground/70 cursor-grab active:cursor-grabbing shrink-0"
                        title="Arrastar tarefa"
                      >
                        <GripVertical size={16} />
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
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

                      {editingId === task.id ? (
                        <div className="flex-1 grid gap-2">
                          <input
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                            placeholder="Título"
                            className="px-3 py-2 bg-secondary/50 border border-input rounded-lg"
                          />
                          <select
                            value={editPriority}
                            onChange={(event) =>
                              setEditPriority(event.target.value as 'LOW' | 'MEDIUM' | 'HIGH')
                            }
                            className="px-3 py-2 bg-secondary/50 border border-input rounded-lg text-sm"
                          >
                            {PRIORITY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="date"
                            value={editDueDate}
                            onChange={(event) => setEditDueDate(event.target.value)}
                            className="px-3 py-2 bg-secondary/50 border border-input rounded-lg"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => saveEdit(task)}
                              className="text-sm"
                            >
                              Salvar
                            </button>
                            <button type="button" onClick={cancelEdit} className="text-sm">
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
                            {(() => {
                              const option =
                                PRIORITY_OPTIONS.find((item) => item.value === task.priority) ||
                                PRIORITY_OPTIONS[1]
                              return (
                                <span
                                  className={`text-[11px] px-2 py-0.5 rounded-full border ${option.className} shrink-0`}
                                >
                                  {option.label}
                                </span>
                              )
                            })()}
                          </div>
                          {task.dueDate && (
                            <p className="text-xs text-muted-foreground">
                              {formatShortDate(task.dueDate)}
                            </p>
                          )}
                        </div>
                      )}

                      {editingId !== task.id && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEdit(task)}
                            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                            aria-label={`Editar tarefa "${task.title}"`}
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeTask(task)}
                            className="p-2 rounded-lg hover:bg-secondary transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                            aria-label={`Remover tarefa "${task.title}"`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
