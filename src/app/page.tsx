'use client'

import { Suspense, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { AuthGuard } from '@/components/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { useAppChrome } from '@/components/layout/AppChrome'
import { QuickActions } from '@/components/QuickActions'
import { TaskListNew } from '@/components/TaskListNew'
import { PowerSystem } from '@/components/PowerSystem'
import { Journal } from '@/components/Journal'
import { Button } from '@/components/ui'
import {
  useTasks,
  useUserStats,
  usePowerSystemTodos,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
} from '@/lib/hooks'
import { isCompletedToday } from '@/lib/utils'

function HomeDashboard() {
  const searchParams = useSearchParams()
  const { goHome } = useAppChrome()

  const journalOpen = searchParams.get('journal') === 'true'

  const { data: tasksData, isLoading: tasksLoading, error: tasksError } = useTasks()
  const { data: statsData, isLoading: statsLoading } = useUserStats()
  const todayDateString = new Date().toISOString().split('T')[0]
  const { data: powerSystemData } = usePowerSystemTodos({ date: todayDateString })

  const createTaskMutation = useCreateTask()
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()

  const stats = statsData || {
    streak: 0,
    brain: { today: 0, week: 0, month: 0, progress: 0 },
    muscle: { today: 0, week: 0, month: 0, progress: 0 },
    money: { today: 0, week: 0, month: 0, progress: 0 },
  }

  const powerSystemTodos = powerSystemData?.powerSystemTodos || []

  const tasks = useMemo(() => {
    const all = tasksData?.tasks || []
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)
    return all.filter((task) => {
      const d = new Date(task.createdAt)
      return d >= start && d <= end
    })
  }, [tasksData?.tasks])

  const completedTasks = tasks.filter((t) => t.completed).length
  const powerCompleted = powerSystemTodos.filter((t) => isCompletedToday(t)).length

  if (journalOpen) {
    return (
      <div className="animate-fade-up space-y-5">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={goHome} className="px-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
              Reflect
            </p>
            <h2 className="font-display text-xl font-semibold text-[var(--fg)]">
              Daily journal
            </h2>
          </div>
        </div>
        <Journal />
      </div>
    )
  }

  return (
    <div>
      <QuickActions
        completedTasks={completedTasks}
        totalTasks={tasks.length}
        powerCompleted={powerCompleted}
        powerTotal={powerSystemTodos.length}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-5 md:gap-6">
        <section aria-label="Today's actions">
          {tasksError ? (
            <div className="surface p-4 text-sm text-[var(--danger)]">
              Couldn&apos;t load tasks: {tasksError.message}
            </div>
          ) : (
            <TaskListNew
              tasks={tasks}
              isLoading={tasksLoading}
              onTaskToggle={async (id) => {
                const task = tasks.find((t) => t.id === id)
                if (!task) return
                await updateTaskMutation.mutateAsync({
                  id,
                  data: { completed: !task.completed },
                })
              }}
              onAddTask={(data) => createTaskMutation.mutateAsync(data)}
              onEditTask={(id, data) =>
                updateTaskMutation.mutateAsync({ id, data })
              }
              onDeleteTask={(id) => deleteTaskMutation.mutateAsync(id)}
            />
          )}
        </section>

        <section aria-label="Power system">
          {statsLoading ? (
            <div className="surface p-6 text-sm text-[var(--fg-muted)]">
              Loading identities…
            </div>
          ) : (
            <PowerSystem
              brain={stats.brain}
              muscle={stats.muscle}
              money={stats.money}
              todos={powerSystemTodos}
            />
          )}
        </section>
      </div>
    </div>
  )
}

function HomeInner() {
  return (
    <AppShell>
      <HomeDashboard />
    </AppShell>
  )
}

export default function Home() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="app-shell min-h-screen flex items-center justify-center text-sm text-[var(--fg-muted)]">
            Loading your day…
          </div>
        }
      >
        <HomeInner />
      </Suspense>
    </AuthGuard>
  )
}
