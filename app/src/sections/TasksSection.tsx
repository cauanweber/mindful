import { useEffect, useState } from 'react'
import type { Task } from '../types/task'
import http from '../services/http'

export default function TasksSection() {
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

  return (
    <div>
      <h3>Tarefas</h3>
      <p>Ações pontuais que você executa uma única vez.</p>

      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Nova tarefa"
          style={{ padding: 10 }}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          style={{ padding: 10 }}
        />
        <button type="button" onClick={handleAdd}>
          Adicionar tarefa
        </button>
      </div>

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {loading && <li>Carregando...</li>}
        {!loading && tasks.length === 0 && <li>Nenhuma tarefa criada.</li>}
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: 8,
              border: '1px solid #e5e7eb',
              marginTop: 8,
            }}
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => toggleTask(task)}
            />
            {editingId === task.id ? (
              <div style={{ flex: 1, display: 'grid', gap: 6 }}>
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  placeholder="Título"
                />
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(event) => setEditDueDate(event.target.value)}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => saveEdit(task)}>
                    Salvar
                  </button>
                  <button type="button" onClick={cancelEdit}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                  {task.title}
                </span>
                {task.dueDate && (
                  <small style={{ marginLeft: 'auto' }}>
                    até {task.dueDate.slice(0, 10)}
                  </small>
                )}
                <button
                  type="button"
                  onClick={() => startEdit(task)}
                  style={{ marginLeft: 8 }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => removeTask(task)}
                  style={{ marginLeft: 8 }}
                >
                  Remover
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
