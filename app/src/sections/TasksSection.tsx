import { useEffect, useMemo, useState } from 'react'
import { Check, CheckSquare, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { Task } from '../types/task'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'

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

  useEffect(() => {
    let active = true

    async function loadTasks() {
      try {
        const { data } = await http.get<Task[]>('/tasks')
        if (active) setTasks(data)
      } catch {
        if (active) setError('Não foi possível carregar as tarefas.')
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
      setTitle('')
      setPriority('MEDIUM')
      setDueDate('')
    } catch {
      setError('Não foi possível criar a tarefa.')
    }
  }

  async function toggleTask(task: Task) {
    try {
      const { data } = await http.patch<Task>(`/tasks/${task.id}`, {
        completed: !task.completed,
      })
      setTasks(tasks.map((item) => (item.id === task.id ? data : item)))
    } catch {
      setError('Não foi possível atualizar a tarefa.')
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
      setTasks(tasks.map((item) => (item.id === task.id ? data : item)))
      cancelEdit()
      setError('')
    } catch {
      setError('Não foi possível atualizar a tarefa.')
    }
  }

  async function removeTask(task: Task) {
    try {
      await http.delete(`/tasks/${task.id}`)
      setTasks(tasks.filter((item) => item.id !== task.id))
    } catch {
      setError('Não foi possível remover a tarefa.')
    }
  }

  const completedCount = tasks.filter((task) => task.completed).length

  return (
    <motion.div
      initial={isMobile ? { opacity: 0, y: 16 } : { opacity: 0, y: 12 }}
      animate={!isMobile ? { opacity: 1, y: 0 } : undefined}
      whileInView={isMobile ? { opacity: 1, y: 0 } : undefined}
      viewport={isMobile ? { once: true, amount: 0.3 } : undefined}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-2xl border border-border p-6 shadow-sm h-full flex flex-col"
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
          <button
            type="button"
            onClick={handleAdd}
            className="w-11 h-11 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-all duration-200"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {error && (
        <div className="text-center py-2 px-4 bg-destructive/10 text-destructive rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!loading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa criada.</p>
        )}

        {Object.entries(groupedTasks).map(([groupKey, groupItems]) => {
          if (groupItems.length === 0) return null

          return (
            <div key={groupKey} className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {GROUP_LABELS[groupKey]}
              </p>
              {groupItems.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border hover:border-accent/40 transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                      task.completed
                        ? 'bg-accent border-accent text-accent-foreground'
                        : 'border-muted-foreground/40 text-muted-foreground'
                    }`}
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
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        {(() => {
                          const option =
                            PRIORITY_OPTIONS.find((item) => item.value === task.priority) ||
                            PRIORITY_OPTIONS[1]
                          return (
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-full border ${option.className}`}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(task)}
                        className="p-2 rounded-lg hover:bg-secondary transition-all duration-200"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTask(task)}
                        className="p-2 rounded-lg hover:bg-secondary transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
