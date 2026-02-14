import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import type { Task } from '../types/task'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { Note } from '../types/note'
import type { DiaryEntry } from '../types/diary'
import DiarySection from '../sections/DiarySection'
import NotesSection from '../sections/NotesSection'
import TasksSection from '../sections/TasksSection'
import WeeklyGoalsSection from '../sections/WeeklyGoalsSection'
import ProgressPanel from '../components/dashboard/ProgressPanel'
import useMediaQuery from '../hooks/useMediaQuery'
import {
  dashboardKeys,
  fetchDiaryToday,
  fetchNotes,
  fetchTasks,
  fetchWeeklyGoals,
  getWeekStartISO,
} from '../services/dashboardQueries'

export default function Dashboard() {
  const weekStart = useMemo(() => getWeekStartISO(), [])

  const [tasksQuery, goalsQuery, notesQuery, diaryQuery] = useQueries({
    queries: [
      { queryKey: dashboardKeys.tasks, queryFn: fetchTasks },
      {
        queryKey: dashboardKeys.weeklyGoals(weekStart),
        queryFn: () => fetchWeeklyGoals(weekStart),
      },
      { queryKey: dashboardKeys.notes, queryFn: fetchNotes },
      { queryKey: dashboardKeys.diaryToday, queryFn: fetchDiaryToday },
    ],
  })

  const tasks: Task[] = tasksQuery.data ?? []
  const goals: WeeklyGoal[] = goalsQuery.data?.goals ?? []
  const notes: Note[] = notesQuery.data ?? []
  const diary: DiaryEntry | null = diaryQuery.data ?? null

  const summary = {
    tasksTotal: tasks.length,
    tasksDone: tasks.filter((task) => task.completed).length,
    goalsTotal: goals.length,
    goalsDone: goals.filter((goal) => goal.done).length,
    notesTotal: notes.length,
    diaryFilled: Boolean(diary && diary.content?.trim()),
  }

  const summaryError = tasksQuery.error || goalsQuery.error || notesQuery.error || diaryQuery.error
  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
  const layout = useMemo(() => {
    if (isMobile) return 'mobile'
    if (isTablet) return 'tablet'
    return 'desktop'
  }, [isMobile, isTablet])

  return (
    <section>
      {summaryError && (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
          Não foi possível carregar o progresso.
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
