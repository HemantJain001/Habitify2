'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronDown, Plus, Save, X, Edit3 } from 'lucide-react'
import { cn, type IdentityStats, identityConfig, type ViewPeriod, isCompletedToday } from '@/lib/utils'
import { usePowerSystemTodos, useCreatePowerSystemTodo, useUpdatePowerSystemTodo, useDeletePowerSystemTodo } from '@/lib/hooks'
import type { PowerSystemTodo } from '@/lib/api'
import PowerSystemTodoItem from './PowerSystemTodoItem'

interface PowerSystemProps {
  brain: IdentityStats
  muscle: IdentityStats
  money: IdentityStats
  todos?: PowerSystemTodo[]
}

export function PowerSystem({ brain, muscle, money, todos: propTodos }: PowerSystemProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [viewPeriod, setViewPeriod] = useState<ViewPeriod>('weekly')
  
  // API hooks - only fetch data if not provided as props
  const { data: powerSystemData, isLoading } = usePowerSystemTodos(
    propTodos ? { enabled: false } : {}
  )
  const createTodoMutation = useCreatePowerSystemTodo()
  const updateTodoMutation = useUpdatePowerSystemTodo()
  const deleteTodoMutation = useDeletePowerSystemTodo()
  
  const todos = propTodos || powerSystemData?.powerSystemTodos || []
  const [editMode, setEditMode] = useState(false)
  const [editingTodo, setEditingTodo] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [addingToIdentity, setAddingToIdentity] = useState<string | null>(null)
  const [newTodoText, setNewTodoText] = useState('')

  const toggleCollapse = (identity: string) => {
    setCollapsed(prev => ({ ...prev, [identity]: !prev[identity] }))
  }

  const identities = [
    { key: 'brain', data: brain },
    { key: 'muscle', data: muscle },
    { key: 'money', data: money }
  ] as const

  // Memoize computed values to prevent unnecessary recalculations
  const getActiveTodosCount = useCallback((identity: string) => {
    return todos.filter(todo => todo.category === identity).length
  }, [todos])

  const getCompletedTodayCount = useCallback((identity: string) => {
    return todos
      .filter(todo => todo.category === identity)
      .filter(todo => isCompletedToday(todo)).length
  }, [todos])

  // Memoize identity todos to prevent unnecessary filtering
  const identityTodos = useMemo(() => {
    return {
      brain: todos.filter(todo => todo.category === 'brain'),
      muscle: todos.filter(todo => todo.category === 'muscle'),
      money: todos.filter(todo => todo.category === 'money')
    }
  }, [todos])

  const handleToggleComplete = useCallback(async (todoId: string, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    const todo = todos.find(t => t.id === todoId)
    if (!todo) return

    const today = new Date().toISOString().split('T')[0]
    const isCurrentlyCompleted = isCompletedToday(todo)
    
    try {
      await updateTodoMutation.mutateAsync({
        id: todoId,
        data: { 
          completed: !isCurrentlyCompleted,
          date: today
        }
      })
    } catch (error) {
      console.error('Error updating todo:', error)
    }
  }, [todos, updateTodoMutation])

  const handleAddTodo = useCallback(async (identity: string) => {
    if (!newTodoText.trim()) return
    
    await createTodoMutation.mutateAsync({
      title: newTodoText.trim(),
      category: identity,
      date: new Date().toISOString().split('T')[0]
    })
    
    setNewTodoText('')
    setAddingToIdentity(null)
  }, [newTodoText, createTodoMutation])

  const handleEditTodo = useCallback(async (todoId: string, newText: string) => {
    console.log('🔧 handleEditTodo called:', { todoId, newText })
    if (!newText.trim()) {
      console.log('❌ Edit cancelled: empty text')
      return
    }
    
    try {
      console.log('📤 Sending edit request...')
      const result = await updateTodoMutation.mutateAsync({
        id: todoId,
        data: { title: newText.trim() }
      })
      console.log('✅ Edit successful:', result)
      
      setEditingTodo(null)
      setEditText('')
    } catch (error) {
      console.error('❌ Edit failed:', error)
      // Show user-friendly error
      if (error instanceof Error && error.message.includes('401')) {
        alert('Authentication required. Please sign in and try again.')
      } else {
        alert('Failed to update todo. Please try again.')
      }
    }
  }, [updateTodoMutation])

  const handleDeleteTodo = useCallback(async (todoId: string) => {
    console.log('🗑️ handleDeleteTodo called:', { todoId })
    
    // Add confirmation dialog
    const confirmed = confirm('Are you sure you want to delete this todo?')
    if (!confirmed) {
      console.log('❌ Delete cancelled by user')
      return
    }
    
    try {
      console.log('📤 Sending delete request...')
      const result = await deleteTodoMutation.mutateAsync(todoId)
      console.log('✅ Delete successful:', result)
    } catch (error) {
      console.error('❌ Delete failed:', error)
      // Show user-friendly error
      if (error instanceof Error && error.message.includes('401')) {
        alert('Authentication required. Please sign in and try again.')
      } else {
        alert('Failed to delete todo. Please try again.')
      }
    }
  }, [deleteTodoMutation])

  const startEditing = useCallback((todo: PowerSystemTodo) => {
    console.log('✏️ startEditing called:', { todoId: todo.id, todoTitle: todo.title })
    setEditingTodo(todo.id)
    setEditText(todo.title)
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingTodo(null)
    setEditText('')
  }, [])

  const cancelAdding = useCallback(() => {
    setAddingToIdentity(null)
    setNewTodoText('')
  }, [])

  return (
    <div className="surface p-6 animate-fade-up stagger-2">
      {isLoading ? (
        <div className="flex items-center justify-center py-10 text-sm text-[var(--fg-muted)]">
          Loading power system…
        </div>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-1">
                Identities
              </p>
              <h2 className="font-display text-lg font-semibold text-[var(--fg)]">
                Power System
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                editMode
                  ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                  : 'bg-[var(--bg-muted)] text-[var(--fg-muted)] hover:text-[var(--fg)] border border-[var(--border)]'
              )}
            >
              <Edit3 className="w-3 h-3" />
              {editMode ? 'Done' : 'Edit'}
            </button>
          </div>

          <div className="space-y-3">
            {identities.map(({ key }) => {
              const config = identityConfig[key]
              const isCollapsed = collapsed[key]

              return (
                <div
                  key={key}
                  className={cn(
                    'rounded-xl overflow-hidden border transition-colors',
                    config.border,
                    'bg-[var(--bg-elevated)]'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => toggleCollapse(key)}
                    className={cn(
                      'w-full flex items-center justify-between p-3.5 transition-colors',
                      config.bg,
                      'hover:opacity-95'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className="text-sm font-semibold text-[var(--fg)]">
                        {config.label}
                      </h3>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--bg-elevated)]/80 text-[var(--fg-muted)] tabular-nums border border-[var(--border)]">
                        {getCompletedTodayCount(key)}/{getActiveTodosCount(key)}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[var(--fg-subtle)] chevron-transition',
                        isCollapsed ? 'chevron-down' : 'chevron-up'
                      )}
                    />
                  </button>

                  <div
                    className={cn(
                      'power-system-content',
                      isCollapsed ? 'collapsed' : 'expanded'
                    )}
                  >
                    <div className="px-3.5 pb-3.5 pt-1">
                      <div className="space-y-1">
                        {identityTodos[key as keyof typeof identityTodos]?.map(
                          (todo) => (
                            <PowerSystemTodoItem
                              key={todo.id}
                              todo={todo}
                              editMode={editMode}
                              isEditing={editingTodo === todo.id}
                              editText={editText}
                              isLoading={
                                (updateTodoMutation.isPending &&
                                  updateTodoMutation.variables?.id === todo.id) ||
                                (deleteTodoMutation.isPending &&
                                  deleteTodoMutation.variables === todo.id)
                              }
                              onToggleComplete={handleToggleComplete}
                              onStartEditing={startEditing}
                              onEditTodo={handleEditTodo}
                              onDeleteTodo={handleDeleteTodo}
                              onCancelEditing={cancelEditing}
                              onSetEditText={setEditText}
                            />
                          )
                        )}

                        {editMode && addingToIdentity === key && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]">
                            <input
                              type="text"
                              value={newTodoText}
                              onChange={(e) => setNewTodoText(e.target.value)}
                              className="flex-1 px-2 py-1.5 text-sm bg-transparent border-none outline-none text-[var(--fg)] placeholder:text-[var(--fg-subtle)]"
                              placeholder="Enter new goal…"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddTodo(key)
                                if (e.key === 'Escape') cancelAdding()
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTodo(key)}
                              className="p-1.5 text-[var(--success)] hover:opacity-80"
                              title="Add"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelAdding}
                              className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)]"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {editMode && addingToIdentity !== key && (
                          <button
                            type="button"
                            onClick={() => setAddingToIdentity(key)}
                            className="w-full flex items-center gap-2 p-2.5 border border-dashed border-[var(--border-strong)] rounded-xl hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]/40 transition-colors text-[var(--fg-muted)] hover:text-[var(--fg)]"
                          >
                            <Plus className="w-4 h-4" />
                            <span className="text-sm font-medium">Add goal</span>
                          </button>
                        )}

                        {getActiveTodosCount(key) === 0 && !editMode && (
                          <div className="text-sm text-[var(--fg-muted)] text-center py-5 rounded-xl border border-dashed border-[var(--border)]">
                            No goals yet. Tap Edit to add some.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
