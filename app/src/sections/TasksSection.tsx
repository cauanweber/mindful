import { useState } from 'react'
import type { Task } from '../types/task'

export default function TasksSection() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')

  function handleAdd() {
    if (!title.trim()) return

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      dueDate: dueDate || undefined,
      completed: false,
    }

    setTasks([newTask, ...tasks])
    setTitle('')
    setDueDate('')
  }

  function toggleTask(id: string) {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    )
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

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {tasks.length === 0 && <li>Nenhuma tarefa criada.</li>}
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
              onChange={() => toggleTask(task.id)}
            />
            <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
              {task.title}
            </span>
            {task.dueDate && (
              <small style={{ marginLeft: 'auto' }}>até {task.dueDate}</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
