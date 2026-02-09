import DiarySection from '../sections/DiarySection'
import NotesSection from '../sections/NotesSection'
import TasksSection from '../sections/TasksSection'
import WeeklyGoalsSection from '../sections/WeeklyGoalsSection'

const cardStyle: React.CSSProperties = {
  border: '1px solid #e5e7eb',
  borderRadius: 12,
  padding: 16,
  background: '#ffffff',
}

export default function Dashboard() {
  return (
    <section>
      <h2>Dashboard</h2>

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
