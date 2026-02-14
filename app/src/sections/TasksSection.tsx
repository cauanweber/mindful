import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DragEvent } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckSquare, Plus } from 'lucide-react'
import { m } from 'motion/react'
import type { Task } from '../types/task'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'
import { getApiErrorMessage } from '../utils/apiError'
import { useToast } from '../context/ToastContext'
import SectionState from '../components/SectionState'
import { dashboardKeys, fetchTasks } from '../services/dashboardQueries'
import TaskItem from '../components/dashboard/TaskItem'

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
  const queryClient = useQueryClient()
  const {
    data: tasks = [],
    isLoading: loading,
    error: tasksLoadError,
    refetch: refetchTasks,
  } = useQuery<Task[]>({
    queryKey: dashboardKeys.tasks,
    queryFn: fetchTasks,
  })
  const [focusToday, setFocusToday] = useState(false)
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
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
    if (!tasksLoadError) return
    const message = getApiErrorMessage(tasksLoadError, 'Não foi possível carregar as tarefas.')
    setError((current) => current || message)
    toast.error(message)
  }, [tasksLoadError, toast])

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

  const handleAdd = useCallback(async () => {
    if (!title.trim()) return

    try {
      const { data } = await http.post<Task>('/tasks', {
        title: title.trim(),
        dueDate: dueDate || undefined,
        priority,
      })

      queryClient.setQueryData<Task[]>(dashboardKeys.tasks, (prev: Task[] = []) => {
        const next = [data, ...prev]
        return next
      })
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
  }, [dueDate, priority, queryClient, title, toast])

  const toggleTask = useCallback(async (task: Task) => {
    try {
      const { data } = await http.patch<Task>(`/tasks/${task.id}`, {
        completed: !task.completed,
      })
      queryClient.setQueryData<Task[]>(dashboardKeys.tasks, (prev: Task[] = []) => {
        const next = prev.map((item) => (item.id === task.id ? data : item))
        return next
      })
      setError('')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a tarefa.')
      setError(message)
      toast.error(message)
    }
  }, [queryClient, toast])

  const startEdit = useCallback((task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '')
    setEditPriority(task.priority || 'MEDIUM')
  }, [])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditTitle('')
    setEditDueDate('')
    setEditPriority('MEDIUM')
  }, [])

  const saveEdit = useCallback(async (task: Task) => {
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
      queryClient.setQueryData<Task[]>(dashboardKeys.tasks, (prev: Task[] = []) => {
        const next = prev.map((item) => (item.id === task.id ? data : item))
        return next
      })
      cancelEdit()
      setError('')
      toast.success('Tarefa atualizada.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível atualizar a tarefa.')
      setError(message)
      toast.error(message)
    }
  }, [cancelEdit, editDueDate, editPriority, editTitle, queryClient, toast])

  const removeTask = useCallback(async (task: Task) => {
    try {
      await http.delete(`/tasks/${task.id}`)
      queryClient.setQueryData<Task[]>(dashboardKeys.tasks, (prev: Task[] = []) => {
        const next = prev.filter((item) => item.id !== task.id)
        return next
      })
      setError('')
      toast.success('Tarefa removida.')
    } catch (error) {
      const message = getApiErrorMessage(error, 'Não foi possível remover a tarefa.')
      setError(message)
      toast.error(message)
    }
  }, [queryClient, toast])

  const reorderTasks = useCallback((fromId: string, toId: string) => {
    if (fromId === toId) return null

    let nextOrder: string[] | null = null

    queryClient.setQueryData<Task[]>(dashboardKeys.tasks, (prev: Task[] = []) => {
      const fromIndex = prev.findIndex((task) => task.id === fromId)
      const toIndex = prev.findIndex((task) => task.id === toId)
      if (fromIndex < 0 || toIndex < 0) return prev

      const next = [...prev]
      const [moved] = next.splice(fromIndex, 1)
      next.splice(toIndex, 0, moved)
      nextOrder = next.map((task) => task.id)
      return next
    })

    return nextOrder
  }, [queryClient])

  const refreshTasks = useCallback(async () => {
    await refetchTasks()
  }, [refetchTasks])

  const persistTasksOrder = useCallback(async (ids: string[]) => {
    await http.put('/tasks/reorder', { ids })
  }, [])

  const handleDragStart = useCallback((taskId: string, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', taskId)
    setDraggedTaskId(taskId)
  }, [])

  const handleDragOver = useCallback((taskId: string, event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (dragOverTaskId !== taskId) setDragOverTaskId(taskId)
  }, [dragOverTaskId])

  const handleDrop = useCallback((taskId: string, event: DragEvent<HTMLDivElement>) => {
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
            await refreshTasks()
          } catch {}
        })
      }
    }
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }, [draggedTaskId, reorderTasks, persistTasksOrder, toast, refreshTasks])

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null)
    setDragOverTaskId(null)
  }, [])

  const completedCount = tasks.filter((task) => task.completed).length
  const visibleTasksCount = Object.values(groupedTasks).reduce(
    (count, group) => count + group.length,
    0,
  )

  return (
    <m.div
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
          <m.button
            type="button"
            onClick={handleAdd}
            className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            whileTap={{ scale: 0.92 }}
            aria-label="Adicionar tarefa"
          >
            <Plus size={18} />
          </m.button>
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
              <m.div layout="position" className="space-y-2">
                {groupItems.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    isEditing={editingId === task.id}
                    isDragged={draggedTaskId === task.id}
                    isDragOver={dragOverTaskId === task.id}
                    isNew={lastCreatedId === task.id}
                    editTitle={editTitle}
                    editDueDate={editDueDate}
                    editPriority={editPriority}
                    priorityOptions={PRIORITY_OPTIONS}
                    formatShortDate={formatShortDate}
                    onToggle={toggleTask}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onRemove={removeTask}
                    onCancelEdit={cancelEdit}
                    onEditTitleChange={setEditTitle}
                    onEditDueDateChange={setEditDueDate}
                    onEditPriorityChange={setEditPriority}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                  />
                ))}
              </m.div>
            </div>
          )
        })}
      </div>
    </m.div>
  )
}
