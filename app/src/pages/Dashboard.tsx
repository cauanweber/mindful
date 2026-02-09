import { useState } from 'react'
import DiarySection from '../sections/DiarySection'
import NotesSection from '../sections/NotesSection'
import TasksSection from '../sections/TasksSection'
import WeeklyGoalsSection from '../sections/WeeklyGoalsSection'

const sections = [
  { id: 'diary', label: 'Diário' },
  { id: 'notes', label: 'Notas' },
  { id: 'tasks', label: 'Tarefas' },
  { id: 'weekly-goals', label: 'Metas semanais' },
]

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  background: '#ffffff',
}

export default function Dashboard() {
  const [active, setActive] = useState(sections[0].id)

  return (
    <section>
      <h2>Dashboard</h2>
      <nav style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActive(section.id)}
            style={{
              border: '1px solid #e5e7eb',
              background: active === section.id ? '#111827' : '#ffffff',
              color: active === section.id ? '#ffffff' : '#111827',
              padding: '6px 12px',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 16,
        }}
      >
        <div style={cardStyle}>
          <DiarySection />
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <div style={cardStyle}>
            <TasksSection />
          </div>
          <div style={cardStyle}>
            <WeeklyGoalsSection />
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16, ...cardStyle }}>
        <NotesSection />
      </div>
    </section>
  )
}
