import { useState } from 'react'

const sections = [
  { id: 'diario', label: 'Diário' },
  { id: 'notas', label: 'Notas' },
  { id: 'tarefas', label: 'Tarefas' },
  { id: 'metas', label: 'Metas semanais' },
]

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

      {active === 'diario' && (
        <div>
          <h3>Diário</h3>
          <p>Um registro por dia para contexto e reflexões.</p>
        </div>
      )}

      {active === 'notas' && (
        <div>
          <h3>Notas</h3>
          <p>Base de conhecimento e ideias atemporais.</p>
        </div>
      )}

      {active === 'tarefas' && (
        <div>
          <h3>Tarefas</h3>
          <p>Ações pontuais que você executa uma única vez.</p>
        </div>
      )}

      {active === 'metas' && (
        <div>
          <h3>Metas semanais</h3>
          <p>Direção de médio prazo para guiar o foco da semana.</p>
        </div>
      )}
    </section>
  )
}
