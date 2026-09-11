'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { Check, Edit3, Trash2, Save, X } from 'lucide-react'
import { cn, isCompletedToday } from '@/lib/utils'
import type { PowerSystemTodo } from '@/lib/api'

interface PowerSystemTodoItemProps {
  todo: PowerSystemTodo
  editMode: boolean
  isEditing: boolean
  editText: string
  isLoading: boolean
  onToggleComplete: (todoId: string, event?: React.MouseEvent) => void
  onStartEditing: (todo: PowerSystemTodo) => void
  onEditTodo: (todoId: string, newText: string) => void
  onDeleteTodo: (todoId: string) => void
  onCancelEditing: () => void
  onSetEditText: (text: string) => void
}

const PowerSystemTodoItem = memo(function PowerSystemTodoItem({
  todo,
  editMode,
  isEditing,
  editText,
  isLoading,
  onToggleComplete,
  onStartEditing,
  onEditTodo,
  onDeleteTodo,
  onCancelEditing,
  onSetEditText,
}: PowerSystemTodoItemProps) {
  const completedToday = useMemo(
    () => isCompletedToday(todo),
    [todo.completed, todo.date]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onEditTodo(todo.id, editText)
      if (e.key === 'Escape') onCancelEditing()
    },
    [todo.id, editText, onEditTodo, onCancelEditing]
  )

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 p-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg-muted)]">
        <input
          type="text"
          value={editText}
          onChange={(e) => onSetEditText(e.target.value)}
          className="flex-1 px-2 py-1.5 text-sm bg-transparent border-none outline-none text-[var(--fg)]"
          autoFocus
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={() => onEditTodo(todo.id, editText)}
          className="p-1.5 text-[var(--success)] hover:opacity-80"
          title="Save"
        >
          <Save className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onCancelEditing}
          className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg)]"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-colors group',
        !editMode && 'cursor-pointer hover:bg-[var(--bg-muted)]',
        completedToday && 'bg-[var(--success)]/8',
        isLoading && 'opacity-50 pointer-events-none'
      )}
      onClick={!editMode ? (e) => onToggleComplete(todo.id, e) : undefined}
    >
      {!editMode ? (
        <div
          className={cn(
            'w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors',
            completedToday
              ? 'bg-[var(--success)] text-white'
              : 'border border-[var(--border-strong)] group-hover:border-[var(--accent)]'
          )}
        >
          {isLoading ? (
            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
          ) : (
            <Check
              className={cn(
                'w-3 h-3 transition-opacity',
                completedToday ? 'opacity-100' : 'opacity-0'
              )}
              strokeWidth={3}
            />
          )}
        </div>
      ) : (
        <span className="w-5 text-center text-[var(--fg-subtle)]">•</span>
      )}

      <span
        className={cn(
          'flex-1 min-w-0 text-sm font-medium truncate',
          completedToday
            ? 'text-[var(--fg-muted)] line-through'
            : 'text-[var(--fg)]'
        )}
      >
        {todo.title}
      </span>

      {editMode ? (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onStartEditing(todo)}
            className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--accent)]"
            title="Edit"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDeleteTodo(todo.id)}
            className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--danger)]"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <span
          className={cn(
            'text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0',
            completedToday
              ? 'bg-[var(--success)]/12 text-[var(--success)]'
              : 'bg-[var(--bg-muted)] text-[var(--fg-subtle)]'
          )}
        >
          {completedToday ? 'Done' : 'Open'}
        </span>
      )}
    </div>
  )
})

export default memo(PowerSystemTodoItem, (prev, next) => {
  return (
    prev.todo.id === next.todo.id &&
    prev.todo.title === next.todo.title &&
    prev.todo.completed === next.todo.completed &&
    prev.todo.date === next.todo.date &&
    prev.editMode === next.editMode &&
    prev.isEditing === next.isEditing &&
    prev.editText === next.editText &&
    prev.isLoading === next.isLoading
  )
})
