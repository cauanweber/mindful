import { describe, expect, it } from 'vitest'
import { buildProgressData } from './ProgressPanel'

describe('buildProgressData', () => {
  it('calcula o progresso geral com tarefas, metas e diário', () => {
    const { overallProgress } = buildProgressData({
      tasksDone: 1,
      tasksTotal: 2,
      goalsDone: 0,
      goalsTotal: 1,
      notesTotal: 3,
      diaryFilled: true,
    })

    expect(overallProgress).toBe(50)
  })

  it('ignora tarefas/metas sem total e considera diário no cálculo', () => {
    const { overallProgress } = buildProgressData({
      tasksDone: 0,
      tasksTotal: 0,
      goalsDone: 0,
      goalsTotal: 0,
      notesTotal: 0,
      diaryFilled: true,
    })

    expect(overallProgress).toBe(100)
  })
})
