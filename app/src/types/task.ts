export type Task = {
  id: string
  title: string
  dueDate?: string
  completed: boolean
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}
