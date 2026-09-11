"use client";

import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Calendar,
  Award,
  Search,
  Filter,
  Edit,
  Trash2,
  Brain,
  Target,
  TrendingUp,
  BarChart3,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useProblems, useDeleteProblem, useUpdateProblem } from "@/lib/hooks";
import { ProblemSolvingEntry } from "@/lib/utils";

export function SolvedProblemsClient() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "impact">(
    "newest",
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const { data: problemsData, isLoading } = useProblems();
  const deleteProblem = useDeleteProblem();
  const updateProblem = useUpdateProblem();

  const problems = problemsData?.problemEntries || [];

  const filteredProblems = problems.filter((problem) => {
    const searchContent =
      `${problem.problemBehavior} ${problem.triggerPattern} ${problem.preferredBehavior} ${problem.longTermSolution || ""}`.toLowerCase();
    const matchesSearch = searchContent.includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      problem.problemCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedProblems = [...filteredProblems].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "impact":
        return b.emotionalImpact - a.emotionalImpact;
      default:
        return 0;
    }
  });

  const categories = Array.from(
    new Set(problems.map((p) => p.problemCategory)),
  ).filter(Boolean);

  const getImpactColor = (impact: number) => {
    if (impact >= 80) return "text-[var(--danger)]";
    if (impact >= 60) return "text-[var(--accent)]";
    if (impact >= 40) return "text-[var(--fg-muted)]";
    return "text-[var(--success)]";
  };

  const getImpactBadgeVariant = (
    impact: number,
  ): "danger" | "warning" | "default" | "success" => {
    if (impact >= 80) return "danger";
    if (impact >= 60) return "warning";
    if (impact >= 40) return "default";
    return "success";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this problem entry?")) {
      try {
        await deleteProblem.mutateAsync(id);
      } catch (error) {
        console.error("Failed to delete problem:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-[var(--accent)]">
              {problems.length}
            </div>
            <div className="text-sm text-[var(--fg-muted)]">Total Problems</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-[var(--success)]">
              {problems.filter((p) => p.emotionalImpact >= 70).length}
            </div>
            <div className="text-sm text-[var(--fg-muted)]">High Impact</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-[var(--accent)]">
              {categories.length}
            </div>
            <div className="text-sm text-[var(--fg-muted)]">Categories</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-[var(--accent)]">
              {Math.round(
                problems.reduce((sum, p) => sum + p.emotionalImpact, 0) /
                  problems.length,
              ) || 0}
            </div>
            <div className="text-sm text-[var(--fg-muted)]">Avg Impact</div>
          </Card>
        </div>

      {/* Controls */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--fg-subtle)]" />
            <Input
              placeholder="Search problems..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="min-w-[150px]">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "newest" | "oldest" | "impact")
              }
              className="w-full px-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--ring)]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="impact">Highest Impact</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
          </div>
        </div>
      </Card>

      {/* Empty State */}
      {sortedProblems.length === 0 && (
        <Card className="p-8 text-center">
          <Brain className="w-12 h-12 text-[var(--fg-subtle)] mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-[var(--fg)] mb-2">
            No Problems Found
          </h2>
          <p className="text-[var(--fg-muted)] mb-4">
            {searchTerm || selectedCategory !== "all"
              ? "No problems match your current filters."
              : "Start solving problems to see them here."}
          </p>
          {(searchTerm || selectedCategory !== "all") && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      )}

      {/* Problems Grid/List */}
      {sortedProblems.length > 0 && (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
              : "space-y-4"
          }
        >
          {sortedProblems.map((problem) => (
            <Card
              key={problem.id}
              className="p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={getImpactBadgeVariant(problem.emotionalImpact)}
                    >
                      Impact: {problem.emotionalImpact}%
                    </Badge>
                    {problem.problemCategory && (
                      <Badge variant="default">{problem.problemCategory}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[var(--fg-subtle)]">
                    <Calendar className="w-4 h-4" />
                    {formatDate(problem.createdAt.toString())}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExpandedCard(
                        expandedCard === problem.id ? null : problem.id,
                      )
                    }
                  >
                    {expandedCard === problem.id ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(problem.id)}
                    className="text-[var(--danger)] hover:bg-[var(--danger)]/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[var(--fg-muted)] block mb-1">
                    Problem Behavior
                  </label>
                  <p className="text-[var(--fg)]">{problem.problemBehavior}</p>
                </div>

                {expandedCard === problem.id && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-[var(--fg-muted)] block mb-1">
                        Trigger Pattern
                      </label>
                      <p className="text-[var(--fg-muted)]">
                        {problem.triggerPattern}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-[var(--fg-muted)] block mb-1">
                        Preferred Behavior
                      </label>
                      <p className="text-[var(--fg-muted)]">
                        {problem.preferredBehavior}
                      </p>
                    </div>

                    {problem.longTermSolution && (
                      <div>
                        <label className="text-sm font-medium text-[var(--fg-muted)] block mb-1">
                          Long-term Solution
                        </label>
                        <p className="text-[var(--fg-muted)]">
                          {problem.longTermSolution}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-[var(--border)]">
                      <div className="flex items-center gap-1">
                        <Target
                          className={`w-4 h-4 ${getImpactColor(problem.emotionalImpact)}`}
                        />
                        <span className="text-sm text-[var(--fg-muted)]">
                          Emotional Impact: {problem.emotionalImpact}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
