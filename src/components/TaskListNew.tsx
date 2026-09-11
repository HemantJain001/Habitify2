"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardTitle,
  Button,
  Input,
  Checkbox,
  ProgressBar,
} from "@/components/ui";
import type { Task } from "@/lib/api";

interface TaskListProps {
  tasks: Task[];
  isLoading?: boolean;
  onTaskToggle: (taskId: string) => void;
  onAddTask: (task: { title: string }) => void;
  onEditTask?: (taskId: string, updatedTask: { title: string }) => void;
  onDeleteTask?: (taskId: string) => void;
}

interface TaskItemProps {
  task: Task;
  isEditing: boolean;
  editText: string;
  onToggle: () => void;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onEditTextChange: (text: string) => void;
  onDelete: () => void;
}

function TaskItem({
  task,
  isEditing,
  editText,
  onToggle,
  onEditStart,
  onEditSave,
  onEditCancel,
  onEditTextChange,
  onDelete,
}: TaskItemProps) {
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-[var(--bg-muted)]">
        <Checkbox disabled />
        <Input
          ref={editInputRef}
          variant="ghost"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onEditSave();
            else if (e.key === "Escape") onEditCancel();
          }}
          className="flex-1"
        />
        <button
          onClick={onEditSave}
          className="p-1 text-[var(--fg-subtle)] hover:text-[var(--success)] hover:bg-[var(--success)]/10 rounded transition-colors cursor-pointer"
          title="Save"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative group flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-[var(--bg-muted)] transition-colors">
      <div className="absolute -top-1 -right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditStart();
          }}
          className="w-6 h-6 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] rounded-md flex items-center justify-center transition-colors cursor-pointer"
          title="Edit task"
        >
          <Edit2 className="w-3 h-3" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-6 h-6 bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--danger)] rounded-md flex items-center justify-center transition-colors cursor-pointer"
          title="Delete task"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div
        onClick={onToggle}
        className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
      >
        <Checkbox checked={task.completed} onCheckedChange={onToggle} />
        <span
          className={cn(
            "text-sm text-[var(--fg)] transition-all duration-200 truncate",
            task.completed && "text-[var(--fg-subtle)] line-through",
          )}
        >
          {task.title}
        </span>
      </div>
    </div>
  );
}

interface AddTaskFormProps {
  newTask: { title: string };
  onNewTaskChange: (task: { title: string }) => void;
  onAddTask: () => void;
  onCancel: () => void;
}

function AddTaskForm({
  newTask,
  onNewTaskChange,
  onAddTask,
  onCancel,
}: AddTaskFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div className="flex items-center gap-3 px-2 py-2 rounded-md bg-[var(--bg-muted)]">
      <Checkbox disabled />
      <Input
        ref={inputRef}
        variant="ghost"
        placeholder="Add a task"
        value={newTask.title}
        onChange={(e) => onNewTaskChange({ title: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === "Enter") onAddTask();
          else if (e.key === "Escape") onCancel();
        }}
        onBlur={() => {
          if (!newTask.title.trim()) onCancel();
        }}
        className="flex-1"
      />
      {newTask.title.trim() && (
        <button
          onClick={onAddTask}
          className="p-1 text-[var(--fg-subtle)] hover:text-[var(--success)] hover:bg-[var(--success)]/10 rounded transition-colors cursor-pointer"
          title="Add Task"
        >
          <Plus className="w-4 h-4 rotate-45" />
        </button>
      )}
    </div>
  );
}

export function TaskListNew({
  tasks,
  isLoading,
  onTaskToggle,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
  });
  const [editTask, setEditTask] = useState({
    title: "",
  });

  const handleAddTask = () => {
    if (newTask.title.trim()) {
      onAddTask({
        title: newTask.title,
      });
      setNewTask({ title: "" });
      setShowAddForm(false);
    }
  };

  const handleEditStart = (task: Task) => {
    setEditingTaskId(task.id);
    setEditTask({
      title: task.title,
    });
  };

  const handleEditSave = () => {
    if (editingTaskId && editTask.title.trim()) {
      if (onEditTask) {
        onEditTask(editingTaskId, {
          title: editTask.title,
        });
      }
      setEditingTaskId(null);
      setEditTask({ title: "" });
    }
  };

  const handleEditCancel = () => {
    setEditingTaskId(null);
    setEditTask({ title: "" });
  };

  const handleDelete = (taskId: string) => {
    if (onDeleteTask) {
      onDeleteTask(taskId);
    }
  };

  // Calculate progress
  const completedTasks = tasks.filter((task) => task.completed).length;
  const totalTasks = tasks.length;

  if (isLoading) {
    return (
      <Card className="animate-fade-up">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-1">
              Today
            </p>
            <CardTitle className="pb-0">Actions</CardTitle>
          </div>
        </div>
        <div className="space-y-2 mt-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-2.5">
              <div className="w-4 h-4 bg-[var(--bg-muted)] rounded animate-pulse" />
              <div className="h-3.5 bg-[var(--bg-muted)] rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-up stagger-1">
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-1">
            Today
          </p>
          <CardTitle className="pb-0">Actions</CardTitle>
        </div>
        {totalTasks > 0 && (
          <span className="text-xs font-medium text-[var(--fg-muted)] tabular-nums">
            {completedTasks}/{totalTasks}
          </span>
        )}
      </div>

      {totalTasks > 0 && (
        <div className="mb-5">
          <ProgressBar
            value={completedTasks}
            max={totalTasks}
            showLabel={false}
          />
        </div>
      )}

      <div className="space-y-0.5">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isEditing={editingTaskId === task.id}
            editText={editTask.title}
            onToggle={() => onTaskToggle(task.id)}
            onEditStart={() => handleEditStart(task)}
            onEditSave={handleEditSave}
            onEditCancel={handleEditCancel}
            onEditTextChange={(title) => setEditTask({ title })}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
        {tasks.length === 0 && !showAddForm && (
          <p className="text-sm text-[var(--fg-muted)] py-6 text-center">
            No tasks yet. Add one to start your day.
          </p>
        )}
      </div>

      <div className="mt-4 pt-2 border-t border-[var(--border)]">
        {!showAddForm ? (
          <Button
            variant="ghost"
            onClick={() => setShowAddForm(true)}
            className="w-full justify-start gap-2 text-[var(--fg-subtle)] hover:text-[var(--fg)]"
          >
            <Plus className="w-4 h-4" />
            <span>Add a task</span>
          </Button>
        ) : (
          <AddTaskForm
            newTask={newTask}
            onNewTaskChange={setNewTask}
            onAddTask={handleAddTask}
            onCancel={() => {
              setShowAddForm(false);
              setNewTask({ title: "" });
            }}
          />
        )}
      </div>
    </Card>
  );
}
