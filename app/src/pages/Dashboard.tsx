import { useEffect, useMemo, useState } from 'react'
import http from '../services/http'
import DiarySection from '../sections/DiarySection'
import NotesSection from '../sections/NotesSection'
import TasksSection from '../sections/TasksSection'
import WeeklyGoalsSection from '../sections/WeeklyGoalsSection'
import ProgressPanel from '../components/dashboard/ProgressPanel'
import type { Task } from '../types/task'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Note } from '../types/note'
import type { DiaryEntry } from '../types/diary'
import useMediaQuery from '../hooks/useMediaQuery'

export default function Dashboard() {
  const [summary, setSummary] = useState({
    tasksTotal: 0,
    tasksDone: 0,
    goalsTotal: 0,
    goalsDone: 0,
    notesTotal: 0,
    diaryFilled: false,
  })
  const [summaryError, setSummaryError] = useState('')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const layout = useMemo(() => {
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }, [isMobile, isTablet])

  useEffect(() => {
    let active = true

    async function loadSummary() {
      try {
        const [tasksRes, goalsRes, notesRes, diaryRes] = await Promise.all([
          http.get<Task[]>('/tasks'),
          http.get<{ weekStart: string; goals: WeeklyGoal[] }>('/weekly-goals'),
          http.get<Note[]>('/notes'),
          http.get<DiaryEntry | null>('/diary/today'),
        ])

        if (!active) return

        const tasks = tasksRes.data
        const goals = goalsRes.data.goals
        const notes = notesRes.data
        const diary = diaryRes.data

        setSummary({
          tasksTotal: tasks.length,
          tasksDone: tasks.filter((task) => task.completed).length,
          goalsTotal: goals.length,
          goalsDone: goals.filter((goal) => goal.done).length,
          notesTotal: notes.length,
          diaryFilled: Boolean(diary && diary.content?.trim()),
        })
      } catch {
        if (active) setSummaryError('Não foi possível carregar o progresso.')
      }
    }

    loadSummary()

    return () => {
      active = false
    }
  }, [])

  return (
    <section>
      {summaryError && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          {summaryError}
        </div>
      )}

      {layout === 'desktop' && (
        <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-6 self-start">
          <div className="h-[520px]">
            <DiarySection />
          </div>
          <div>
            <NotesSection />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 self-start">
          <div>
            <TasksSection />
          </div>
          <div className="h-[520px]">
            <WeeklyGoalsSection />
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="h-[1064px]">
            <ProgressPanel
              tasksDone={summary.tasksDone}
              tasksTotal={summary.tasksTotal}
              goalsDone={summary.goalsDone}
              goalsTotal={summary.goalsTotal}
              notesTotal={summary.notesTotal}
              diaryFilled={summary.diaryFilled}
            />
          </div>
        </div>
      </div>
      )}

      {layout === 'tablet' && (
        <div className="grid grid-cols-2 gap-6">
        <div className="h-[480px]">
          <DiarySection />
        </div>
        <div>
          <TasksSection />
        </div>
        <div className="h-[480px]">
          <WeeklyGoalsSection />
        </div>
        <div>
          <NotesSection />
        </div>
        <div className="col-span-2 h-[520px]">
          <ProgressPanel
            tasksDone={summary.tasksDone}
            tasksTotal={summary.tasksTotal}
            goalsDone={summary.goalsDone}
            goalsTotal={summary.goalsTotal}
            notesTotal={summary.notesTotal}
            diaryFilled={summary.diaryFilled}
          />
        </div>
      </div>
      )}

      {layout === 'mobile' && (
        <div className="space-y-6">
        <div className="h-[520px]">
          <ProgressPanel
            tasksDone={summary.tasksDone}
            tasksTotal={summary.tasksTotal}
            goalsDone={summary.goalsDone}
            goalsTotal={summary.goalsTotal}
            notesTotal={summary.notesTotal}
            diaryFilled={summary.diaryFilled}
          />
        </div>
        <div className="h-[440px]">
          <DiarySection />
        </div>
        <div>
          <TasksSection />
        </div>
        <div className="h-[440px]">
          <WeeklyGoalsSection />
        </div>
        <div>
          <NotesSection />
        </div>
      </div>
      )}
    </section>
  )
}
