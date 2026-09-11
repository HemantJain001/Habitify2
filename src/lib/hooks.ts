"use client"

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { taskApi, powerSystemApi, journalApi, userApi, problemApi, behaviorApi } from './api'
import type { PowerSystemTodo, Task, UserStats } from './api'
import {
  findPowerTodoInCaches,
  findTaskInCache,
  patchIdentityStatsOnToggle,
  patchPowerTodoInCaches,
  patchTaskInCache,
  restorePowerTodoCaches,
  snapshotPowerTodoCaches,
} from './optimistic'

// Task hooks
export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskApi.getTasks(),
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; completed?: boolean } }) =>
      taskApi.updateTask(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<{ tasks: Task[] }>(['tasks'])
      const existing = findTaskInCache(queryClient, id)
      if (existing) {
        const patch: Partial<Task> = {}
        if (data.title !== undefined) patch.title = data.title
        if (data.completed !== undefined) {
          patch.completed = data.completed
          patch.completedAt = data.completed ? new Date() : undefined
        }
        patchTaskInCache(queryClient, id, patch)
      }
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(['tasks'], context.previous)
      }
    },
    onSuccess: (result) => {
      if (result?.task) {
        patchTaskInCache(queryClient, result.task.id, result.task)
      }
    },
    onSettled: (_result, _error, variables) => {
      if (variables.data.completed !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      }
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: taskApi.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

// Power System hooks
export function usePowerSystemTodos(params?: { category?: string; date?: string; enabled?: boolean }) {
  return useQuery({
    queryKey: ['power-system-todos', params],
    queryFn: () => powerSystemApi.getPowerSystemTodos(params),
    enabled: params?.enabled !== false,
  })
}

export function useCreatePowerSystemTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: powerSystemApi.createPowerSystemTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['power-system-todos'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

// Individual todo update hook for granular control
export function useUpdatePowerSystemTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { 
      id: string; 
      data: { title?: string; category?: string; completed?: boolean; date?: string } 
    }) => powerSystemApi.updatePowerSystemTodo(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['power-system-todos'] })
      await queryClient.cancelQueries({ queryKey: ['user-stats'] })

      const previousTodos = snapshotPowerTodoCaches(queryClient)
      const previousStats = queryClient.getQueryData<UserStats>(['user-stats'])
      const existing = findPowerTodoInCaches(queryClient, id)

      if (existing) {
        const patch: Partial<PowerSystemTodo> = {}
        if (data.title !== undefined) patch.title = data.title
        if (data.category !== undefined) patch.category = data.category
        if (data.date !== undefined) {
          patch.date = new Date(data.date) as PowerSystemTodo['date']
        }
        if (data.completed !== undefined) {
          patch.completed = data.completed
          if (existing.completed !== data.completed) {
            patchIdentityStatsOnToggle(
              queryClient,
              existing.category,
              data.completed
            )
          }
        }
        patchPowerTodoInCaches(queryClient, id, patch)
      }

      return { previousTodos, previousStats }
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTodos) {
        restorePowerTodoCaches(queryClient, context.previousTodos)
      }
      if (context?.previousStats !== undefined) {
        queryClient.setQueryData(['user-stats'], context.previousStats)
      }
    },
    onSuccess: (result) => {
      if (result?.powerSystemTodo) {
        patchPowerTodoInCaches(
          queryClient,
          result.powerSystemTodo.id,
          result.powerSystemTodo
        )
      }
    },
    onSettled: (_result, _error, variables) => {
      if (variables.data.completed !== undefined) {
        void queryClient.invalidateQueries({ queryKey: ['user-stats'] })
      }
    },
  })
}

/** @deprecated Use useUpdatePowerSystemTodo — kept as alias for older imports */
export const useUpdateSingleTodo = useUpdatePowerSystemTodo

// Journal hooks
export function useJournalEntries(params?: {
  date?: string
  limit?: number
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ['journal-entries', params],
    queryFn: () => journalApi.getJournalEntries(params),
    enabled: params?.enabled !== false,
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: journalApi.createJournalEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    },
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { notes?: string; mood?: number } }) =>
      journalApi.updateJournalEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
    },
  })
}

// User hooks
export function useUserProfile() {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: () => userApi.getProfile(),
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats(),
  })
}

// Problem solving hooks
export function useProblems(params?: { category?: string; limit?: number }) {
  return useQuery({
    queryKey: ['problems', params],
    queryFn: () => problemApi.getProblems(params),
  })
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ['problems', id],
    queryFn: () => problemApi.getProblem(id),
    enabled: !!id,
  })
}

export function useCreateProblem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: problemApi.createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

export function useUpdateProblem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof problemApi.updateProblem>[1] }) =>
      problemApi.updateProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
    },
  })
}

export function useDeleteProblem() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: problemApi.deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}

// Behavior hooks
export function useBehaviors(params?: { date?: string; limit?: number }) {
  return useQuery({
    queryKey: ['behaviors', params],
    queryFn: () => behaviorApi.getBehaviors(params),
  })
}

export function useCreateBehavior() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: behaviorApi.createBehavior,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['behaviors'] })
    },
  })
}

export function useDeletePowerSystemTodo() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => powerSystemApi.deletePowerSystemTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['power-system-todos'] })
      queryClient.invalidateQueries({ queryKey: ['user-stats'] })
    },
  })
}
