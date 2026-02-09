import { useEffect, useState } from 'react'
import { Check, CheckSquare, Pencil, Plus, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import type { Task } from '../types/task'
import http from '../services/http'
import useIsMobile from '../hooks/useIsMobile'

export default function TasksSection() {
  const isMobile = useIsMobile()
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDueDate, setEditDueDate] = useState('')

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

  async function handleAdd() {
    if (!title.trim()) return

    try {
      const { data } = await http.post<Task>('/tasks', {
        title: title.trim(),
        dueDate: dueDate || undefined,
      })

      setTasks([data, ...tasks])
      setTitle('')
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
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditDueDate('')
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
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova tarefa"
          className="flex-1 min-w-0 px-4 py-2.5 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
        />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            className="w-full sm:w-[140px] px-3 py-2.5 bg-secondary/50 border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all duration-200"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center hover:bg-accent/90 transition-all duration-200"
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

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!loading && tasks.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma tarefa criada.</p>
        )}
        {tasks.map((task) => (
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
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                  className="px-3 py-2 bg-secondary/50 border border-input rounded-lg"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => saveEdit(task)} className="text-sm">
                    Salvar
                  </button>
                  <button type="button" onClick={cancelEdit} className="text-sm">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    task.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  {task.title}
                </p>
                {task.dueDate && (
                  <p className="text-xs text-muted-foreground">
                    até {task.dueDate.slice(0, 10)}
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
    </motion.div>
  )
}
