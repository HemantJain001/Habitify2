"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  Zap,
  DollarSign,
  CheckCircle,
  Clock,
  BarChart3,
  Download,
} from "lucide-react";
import { useTasks, usePowerSystemTodos } from "@/lib/hooks";

interface StatsDashboardProps {
  className?: string;
}

interface DailyStats {
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  completionRate: number;
  brainTodos: number;
  muscleTodos: number;
  moneyTodos: number;
  powerSystemTotal: number;
}

interface WeeklyStats {
  week: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  powerSystemCompleted: number;
  streak: number;
}

const COLORS = {
  primary: "#c9842f",
  secondary: "#8a7355",
  success: "#2f9d6a",
  warning: "#c9842f",
  danger: "#c44b3b",
  brain: "#3b82b6",
  muscle: "#2f9d6a",
  money: "#c9842f",
};

const PIE_COLORS = ["#c9842f", "#3b82b6", "#2f9d6a", "#8a7355"];

export function StatsDashboard({ className = "" }: StatsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"daily" | "weekly">("daily");
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [powerSystemBreakdown, setPowerSystemBreakdown] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalPowerSystem: 0,
  });

  const { data: tasksData } = useTasks();
  const { data: powerSystemData } = usePowerSystemTodos();

  // Fetch analytics data
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (response.ok) {
        const { data } = await response.json();
        setDailyStats(data.dailyStats || []);
        setWeeklyStats(data.weeklyStats || []);
        setPowerSystemBreakdown(data.powerSystemBreakdown || []);
        setTotalStats(
          data.totalStats || {
            totalTasks: 0,
            completedTasks: 0,
            completionRate: 0,
            currentStreak: 0,
            longestStreak: 0,
            totalPowerSystem: 0,
          },
        );
      } else if (tasksData?.tasks) {
        generateFallbackFromLocalData();
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (tasksData?.tasks) {
        generateFallbackFromLocalData();
      }
    }
  };

  const generateFallbackFromLocalData = () => {
    const todos = powerSystemData?.powerSystemTodos || [];
    const last14Days = [];
    const today = new Date();

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toISOString().split("T")[0];
      const dayTasks =
        tasksData?.tasks?.filter((task: any) => {
          const taskDate = new Date(task.createdAt).toISOString().split("T")[0];
          return taskDate === dateString;
        }) || [];

      const dayTodos = todos.filter((todo: any) => {
        const todoDate = new Date(todo.date).toISOString().split("T")[0];
        return todoDate === dateString;
      });

      const completedTasks = dayTasks.filter(
        (task: any) => task.completed,
      ).length;
      const totalTasks = dayTasks.length;
      const brainTodos = dayTodos.filter(
        (t: any) => t.category === "brain" && t.completed,
      ).length;
      const muscleTodos = dayTodos.filter(
        (t: any) => t.category === "muscle" && t.completed,
      ).length;
      const moneyTodos = dayTodos.filter(
        (t: any) => t.category === "money" && t.completed,
      ).length;

      last14Days.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        tasksCompleted: completedTasks,
        tasksTotal: totalTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        brainTodos,
        muscleTodos,
        moneyTodos,
        powerSystemTotal: dayTodos.length,
      });
    }

    setDailyStats(last14Days);

    const last8Weeks = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);

      const weekTasks =
        tasksData?.tasks?.filter((task: any) => {
          const taskDate = new Date(task.createdAt);
          return taskDate >= weekStart && taskDate <= weekEnd;
        }) || [];

      const weekTodos = todos.filter((todo: any) => {
        const todoDate = new Date(todo.date);
        return todoDate >= weekStart && todoDate <= weekEnd;
      });

      const completedTasks = weekTasks.filter(
        (task: any) => task.completed,
      ).length;
      const totalTasks = weekTasks.length;

      last8Weeks.push({
        week: `Week ${8 - i}`,
        totalTasks,
        completedTasks,
        completionRate:
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        powerSystemCompleted: weekTodos.filter((t: any) => t.completed).length,
        streak: 0,
      });
    }

    setWeeklyStats(last8Weeks);

    const brain = todos.filter(
      (t: any) => t.category === "brain" && t.completed,
    ).length;
    const muscle = todos.filter(
      (t: any) => t.category === "muscle" && t.completed,
    ).length;
    const money = todos.filter(
      (t: any) => t.category === "money" && t.completed,
    ).length;
    const pending = todos.filter((t: any) => !t.completed).length;
    const total = brain + muscle + money + pending || 1;

    setPowerSystemBreakdown([
      {
        name: "Brain",
        value: Math.round((brain / total) * 100),
        color: COLORS.brain,
      },
      {
        name: "Muscle",
        value: Math.round((muscle / total) * 100),
        color: COLORS.muscle,
      },
      {
        name: "Money",
        value: Math.round((money / total) * 100),
        color: COLORS.money,
      },
      {
        name: "Pending",
        value: Math.round((pending / total) * 100),
        color: "#94a3b8",
      },
    ]);

    const tasks = tasksData?.tasks || [];
    const completedTasks = tasks.filter((task: any) => task.completed).length;
    const totalTasks = tasks.length;

    setTotalStats({
      totalTasks,
      completedTasks,
      completionRate:
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      currentStreak: 0,
      longestStreak: 0,
      totalPowerSystem: todos.length,
    });
  };

  const exportData = () => {
    const data = timeRange === "daily" ? dailyStats : weeklyStats;
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `productivity-stats-${timeRange}-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            Range
          </p>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            Switch views and export your productivity data
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex bg-[var(--bg-muted)] rounded-lg p-1">
            <Button
              variant={timeRange === "daily" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("daily")}
              className="rounded-md"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Daily
            </Button>
            <Button
              variant={timeRange === "weekly" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTimeRange("weekly")}
              className="rounded-md"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Weekly
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">
                Total Tasks
              </p>
              <p className="font-display text-2xl font-semibold text-[var(--fg)]">
                {totalStats.totalTasks}
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--accent-soft)] rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-[var(--accent)]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-[var(--success)] mr-1" />
            <span className="text-[var(--success)]">+12% from last week</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">
                Completion Rate
              </p>
              <p className="font-display text-2xl font-semibold text-[var(--fg)]">
                {totalStats.completionRate}%
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--success)]/12 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[var(--success)]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-[var(--success)] mr-1" />
            <span className="text-[var(--success)]">+5% improvement</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">
                Current Streak
              </p>
              <p className="font-display text-2xl font-semibold text-[var(--fg)]">
                {totalStats.currentStreak} days
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--accent-soft)] rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-[var(--accent)]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Clock className="w-4 h-4 text-[var(--fg-subtle)] mr-1" />
            <span className="text-[var(--fg-muted)]">
              Best: {totalStats.longestStreak} days
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--fg-muted)]">
                Power System
              </p>
              <p className="font-display text-2xl font-semibold text-[var(--fg)]">
                {totalStats.totalPowerSystem}
              </p>
            </div>
            <div className="w-12 h-12 bg-[var(--accent-soft)] rounded-lg flex items-center justify-center">
              <Brain className="w-6 h-6 text-[var(--accent)]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-[var(--success)] mr-1" />
            <span className="text-[var(--success)]">+8% this week</span>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Trends */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--fg)]">
              {timeRange === "daily"
                ? "Daily Task Progress"
                : "Weekly Task Progress"}
            </h3>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[var(--accent)] rounded-full"></div>
              <span className="text-sm text-[var(--fg-muted)]">Completed</span>
              <div className="w-3 h-3 bg-[var(--border-strong)] rounded-full ml-3"></div>
              <span className="text-sm text-[var(--fg-muted)]">Total</span>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeRange === "daily" ? dailyStats : weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={timeRange === "daily" ? "date" : "week"}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey={timeRange === "daily" ? "tasksTotal" : "totalTasks"}
                stackId="1"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
                name="Total Tasks"
              />
              <Area
                type="monotone"
                dataKey={
                  timeRange === "daily" ? "tasksCompleted" : "completedTasks"
                }
                stackId="2"
                stroke={COLORS.success}
                fill={COLORS.success}
                fillOpacity={0.8}
                name="Completed Tasks"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Completion Rate Line Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[var(--fg)]">
              Completion Rate Trend
            </h3>
            <span className="text-sm text-[var(--fg-muted)]">
              Last {timeRange === "daily" ? "14 days" : "8 weeks"}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeRange === "daily" ? dailyStats : weeklyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={timeRange === "daily" ? "date" : "week"}
                fontSize={12}
              />
              <YAxis fontSize={12} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value}%`, "Completion Rate"]}
              />
              <Line
                type="monotone"
                dataKey="completionRate"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Power System & Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Power System Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-6">
            Power System Breakdown
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={powerSystemBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`
                }
                outerRadius={80}
                fill="#c9842f"
                dataKey="value"
              >
                {powerSystemBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {powerSystemBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-[var(--fg-muted)]">
                    {item.name}
                  </span>
                </div>
                <span className="text-sm font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Daily Power System Activities */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-6">
            Power System Activities (Daily)
          </h3>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={dailyStats.slice(-7)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="brainTodos"
                stackId="a"
                fill={COLORS.brain}
                name="Brain"
              />
              <Bar
                dataKey="muscleTodos"
                stackId="a"
                fill={COLORS.muscle}
                name="Muscle"
              />
              <Bar
                dataKey="moneyTodos"
                stackId="a"
                fill={COLORS.money}
                name="Money"
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Weekly Progress Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[var(--fg)] mb-6">
            This Week Summary
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[var(--accent-soft)] rounded-lg">
              <div className="flex items-center gap-3">
                <Brain className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-medium text-[var(--fg)]">
                  Brain Tasks
                </span>
              </div>
              <span className="text-lg font-bold text-[var(--accent)]">15</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--danger)]/8 rounded-lg">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-[var(--danger)]" />
                <span className="font-medium text-[var(--fg)]">
                  Muscle Tasks
                </span>
              </div>
              <span className="text-lg font-bold text-[var(--danger)]">12</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-[var(--success)]/8 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-[var(--success)]" />
                <span className="font-medium text-[var(--fg)]">
                  Money Tasks
                </span>
              </div>
              <span className="text-lg font-bold text-[var(--success)]">8</span>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[var(--fg)]">
                  Total Progress
                </span>
                <span className="text-2xl font-bold text-indigo-600">
                  35/40
                </span>
              </div>
              <div className="mt-2 w-full bg-[var(--bg-muted)] rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: "87.5%" }}
                ></div>
              </div>
              <p className="text-sm text-[var(--fg-muted)] mt-1">
                87.5% weekly target achieved
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
