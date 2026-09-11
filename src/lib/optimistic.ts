import type { QueryClient, QueryKey } from '@tanstack/react-query'
import type { IdentityStats, PowerSystemTodo, Task, UserStats } from './api'

type TasksCache = { tasks: Task[] }
type PowerTodosCache = { powerSystemTodos: PowerSystemTodo[] }

const IDENTITY_KEYS = ['brain', 'muscle', 'money'] as const
type IdentityKey = (typeof IDENTITY_KEYS)[number]

function isIdentityKey(category: string): category is IdentityKey {
  return (IDENTITY_KEYS as readonly string[]).includes(category)
}

export function patchTaskInCache(
  queryClient: QueryClient,
  id: string,
  patch: Partial<Task>
) {
  queryClient.setQueryData<TasksCache>(['tasks'], (old) => {
    if (!old?.tasks) return old
    return {
      ...old,
      tasks: old.tasks.map((task) =>
        task.id === id ? { ...task, ...patch } : task
      ),
    }
  })
}

export function findTaskInCache(
  queryClient: QueryClient,
  id: string
): Task | undefined {
  const data = queryClient.getQueryData<TasksCache>(['tasks'])
  return data?.tasks.find((task) => task.id === id)
}

export function patchPowerTodoInCaches(
  queryClient: QueryClient,
  id: string,
  patch: Partial<PowerSystemTodo>
) {
  queryClient.setQueriesData<PowerTodosCache>(
    { queryKey: ['power-system-todos'] },
    (old) => {
      if (!old?.powerSystemTodos) return old
      return {
        ...old,
        powerSystemTodos: old.powerSystemTodos.map((todo) =>
          todo.id === id ? { ...todo, ...patch } : todo
        ),
      }
    }
  )
}

export function findPowerTodoInCaches(
  queryClient: QueryClient,
  id: string
): PowerSystemTodo | undefined {
  const entries = queryClient.getQueriesData<PowerTodosCache>({
    queryKey: ['power-system-todos'],
  })
  for (const [, data] of entries) {
    const todo = data?.powerSystemTodos.find((t) => t.id === id)
    if (todo) return todo
  }
  return undefined
}

export function snapshotPowerTodoCaches(queryClient: QueryClient) {
  return queryClient.getQueriesData<PowerTodosCache>({
    queryKey: ['power-system-todos'],
  })
}

export function restorePowerTodoCaches(
  queryClient: QueryClient,
  snapshots: [QueryKey, PowerTodosCache | undefined][]
) {
  for (const [key, data] of snapshots) {
    queryClient.setQueryData(key, data)
  }
}

/** Bump identity completion counts; progress is corrected by background stats refetch. */
export function patchIdentityStatsOnToggle(
  queryClient: QueryClient,
  category: string,
  completed: boolean
) {
  if (!isIdentityKey(category)) return

  queryClient.setQueryData<UserStats>(['user-stats'], (old) => {
    if (!old) return old
    const delta = completed ? 1 : -1
    const prev = old[category]
    const next: IdentityStats = {
      today: Math.max(0, prev.today + delta),
      week: Math.max(0, prev.week + delta),
      month: Math.max(0, prev.month + delta),
      progress: prev.progress,
    }
    return { ...old, [category]: next }
  })
}
