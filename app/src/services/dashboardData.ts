import http from './http'
import type { Task } from '../types/task'
import type { Note } from '../types/note'
import type { WeeklyGoal } from '../types/weeklyGoal'
import type { DiaryEntry } from '../types/diary'

type CacheEntry<T> = {
  data?: T
  promise?: Promise<T>
}

const tasksCache: CacheEntry<Task[]> = {}
const notesCache: CacheEntry<Note[]> = {}
const diaryTodayCache: CacheEntry<DiaryEntry | null> = {}
const weeklyGoalsCache = new Map<string, CacheEntry<{ weekStart: string; goals: WeeklyGoal[] }>>()

function getOrCreate<T>(
  cache: CacheEntry<T>,
  loader: () => Promise<T>,
  force = false,
): Promise<T> {
  if (force) {
    cache.data = undefined
    cache.promise = undefined
  }

  if (cache.data !== undefined) return Promise.resolve(cache.data)
  if (cache.promise) return cache.promise

  const request = loader()
    .then((data) => {
      cache.data = data
      cache.promise = undefined
      return data
    })
    .catch((error) => {
      cache.promise = undefined
      throw error
    })

  cache.promise = request
  return request
}

export function getWeekStartISO() {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now)
  monday.setDate(diff)
  monday.setHours(0, 0, 0, 0)
  return monday.toISOString().slice(0, 10)
}

export function getTasksData(options?: { force?: boolean }) {
  return getOrCreate(
    tasksCache,
    async () => {
      const { data } = await http.get<Task[]>('/tasks')
      return data
    },
    options?.force,
  )
}

export function setTasksData(data: Task[]) {
  tasksCache.data = data
  tasksCache.promise = undefined
}

export function getNotesData(options?: { force?: boolean }) {
  return getOrCreate(
    notesCache,
    async () => {
      const { data } = await http.get<Note[]>('/notes')
      return data
    },
    options?.force,
  )
}

export function setNotesData(data: Note[]) {
  notesCache.data = data
  notesCache.promise = undefined
}

export function getDiaryTodayData(options?: { force?: boolean }) {
  return getOrCreate(
    diaryTodayCache,
    async () => {
      const { data } = await http.get<DiaryEntry | null>('/diary/today')
      return data
    },
    options?.force,
  )
}

export function setDiaryTodayData(data: DiaryEntry | null) {
  diaryTodayCache.data = data
  diaryTodayCache.promise = undefined
}

export function getWeeklyGoalsData(weekStart = getWeekStartISO(), options?: { force?: boolean }) {
  const key = weekStart
  const existing = weeklyGoalsCache.get(key) ?? {}
  weeklyGoalsCache.set(key, existing)

  return getOrCreate(
    existing,
    async () => {
      const { data } = await http.get<{ weekStart: string; goals: WeeklyGoal[] }>(
        '/weekly-goals',
        { params: { weekStart: key } },
      )
      return data
    },
    options?.force,
  )
}

export function setWeeklyGoalsData(weekStart: string, data: { weekStart: string; goals: WeeklyGoal[] }) {
  const key = weekStart
  const existing = weeklyGoalsCache.get(key) ?? {}
  existing.data = data
  existing.promise = undefined
  weeklyGoalsCache.set(key, existing)
}
