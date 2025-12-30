"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FolderKanban, 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp,
  Calendar,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import { format, subDays, isAfter, isBefore, startOfDay, eachDayOfInterval, startOfWeek, endOfWeek } from "date-fns";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
};

const statusConfig = {
  TODO: { label: "To Do", icon: Circle, color: "text-zinc-400" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-stride-blue" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500" },
};

const CHART_COLORS = {
  TODO: "#71717a",
  IN_PROGRESS: "#3b82f6",
  DONE: "#22c55e",
  LOW: "#71717a",
  MEDIUM: "#eab308",
  HIGH: "#ef4444",
};

export default function DashboardPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [projectsRes, tasksRes] = await Promise.all([
      fetch("/api/projects"),
      fetch("/api/tasks"),
    ]);
    
    if (projectsRes.ok && tasksRes.ok) {
      const projectsData = await projectsRes.json();
      const tasksData = await tasksRes.json();
      setProjects(projectsData.data);
      setTasks(tasksData.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchData();
    }
  }, [isSignedIn, fetchData]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-zinc-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO").length,
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    DONE: tasks.filter((t) => t.status === "DONE").length,
  };

  const tasksByPriority = {
    LOW: tasks.filter((t) => t.priority === "LOW").length,
    MEDIUM: tasks.filter((t) => t.priority === "MEDIUM").length,
    HIGH: tasks.filter((t) => t.priority === "HIGH").length,
  };

  const completionRate = totalTasks > 0 
    ? Math.round((tasksByStatus.DONE / totalTasks) * 100) 
    : 0;

  // Get overdue tasks
  const today = startOfDay(new Date());
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), today) && t.status !== "DONE"
  );

  // Get tasks due soon (next 7 days)
  const weekFromNow = subDays(today, -7);
  const upcomingTasks = tasks.filter(
    (t) => 
      t.dueDate && 
      isAfter(new Date(t.dueDate), today) && 
      isBefore(new Date(t.dueDate), weekFromNow) &&
      t.status !== "DONE"
  );

  // Prepare chart data - Tasks over time (last 7 days)
  const last7Days = eachDayOfInterval({
    start: subDays(today, 6),
    end: today,
  });

  const tasksOverTimeData = last7Days.map((day) => {
    const dayStart = startOfDay(day);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const createdTasks = tasks.filter(
      (t) => isAfter(new Date(t.createdAt), dayStart) && isBefore(new Date(t.createdAt), dayEnd)
    ).length;

    const completedTasks = tasks.filter(
      (t) => 
        t.status === "DONE" &&
        isAfter(new Date(t.updatedAt), dayStart) && 
        isBefore(new Date(t.updatedAt), dayEnd)
    ).length;

    return {
      date: format(day, "MMM d"),
      created: createdTasks,
      completed: completedTasks,
    };
  });

  // Status distribution for pie chart
  const statusDistributionData = [
    { name: "To Do", value: tasksByStatus.TODO, color: CHART_COLORS.TODO },
    { name: "In Progress", value: tasksByStatus.IN_PROGRESS, color: CHART_COLORS.IN_PROGRESS },
    { name: "Done", value: tasksByStatus.DONE, color: CHART_COLORS.DONE },
  ].filter(item => item.value > 0);

  // Priority distribution for bar chart
  const priorityDistributionData = [
    { name: "Low", count: tasksByPriority.LOW, color: CHART_COLORS.LOW },
    { name: "Medium", count: tasksByPriority.MEDIUM, color: CHART_COLORS.MEDIUM },
    { name: "High", count: tasksByPriority.HIGH, color: CHART_COLORS.HIGH },
  ];

  // Get recent projects (last 5, sorted by updatedAt)
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Get recent activity (tasks created/updated in last 7 days)
  const recentActivityTasks = tasks
    .filter((t) => isAfter(new Date(t.updatedAt), subDays(today, 7)))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
            Dashboard
          </h1>
          <p className="text-zinc-400 text-sm">
            Track your projects and tasks at a glance
          </p>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Projects */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Projects
              </CardTitle>
              <FolderKanban className="h-4 w-4 text-stride-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {activeProjects} active
              </p>
            </CardContent>
          </Card>

          {/* Total Tasks */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Total Tasks
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {tasksByStatus.DONE} completed
              </p>
            </CardContent>
          </Card>

          {/* Completion Rate */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-stride-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-zinc-500 mt-1">
                {tasksByStatus.DONE} of {totalTasks} tasks
              </p>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">
                Overdue Tasks
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueTasks.length}</div>
              <p className="text-xs text-zinc-500 mt-1">
                {upcomingTasks.length} due this week
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Charts Row */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tasks Over Time Chart */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader>
              <CardTitle>Tasks Activity (Last 7 Days)</CardTitle>
              <CardDescription className="text-zinc-400">
                Tasks created vs completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalTasks === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No task data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={tasksOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#71717a"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="created" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Created"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="completed" 
                      stroke="#22c55e" 
                      strokeWidth={2}
                      name="Completed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Status Distribution Pie Chart */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader>
              <CardTitle>Task Status Distribution</CardTitle>
              <CardDescription className="text-zinc-400">
                Current breakdown of all tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {totalTasks === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-zinc-500">
                  No task data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                     label={({ name, percent }: { name: string; percent?: number }) => 
                        `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`
                        }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#18181b', 
                        border: '1px solid #27272a',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Priority Distribution Bar Chart */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <Card className="bg-stride-surface border-stride-border">
          <CardHeader>
            <CardTitle>Task Priority Distribution</CardTitle>
            <CardDescription className="text-zinc-400">
              Breakdown by priority level
            </CardDescription>
          </CardHeader>
          <CardContent>
            {totalTasks === 0 ? (
              <div className="h-[250px] flex items-center justify-center text-zinc-500">
                No task data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={priorityDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#71717a"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#18181b', 
                      border: '1px solid #27272a',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {priorityDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Two Column Layout - Recent Projects & Activity */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Projects */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription className="text-zinc-400">
                  Your most recently updated projects
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/projects")}
                className="text-stride-blue hover:text-stride-blue-hover"
              >
                View all
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No projects yet
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-stride-blue/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{project.name}</h4>
                          <p className="text-xs text-zinc-500">
                            {project._count.tasks} tasks • Updated{" "}
                            {format(new Date(project.updatedAt), "MMM d")}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={
                            project.status === "ACTIVE"
                              ? "bg-stride-blue/10 text-stride-blue"
                              : project.status === "COMPLETED"
                              ? "bg-green-500/10 text-green-500"
                              : "bg-zinc-700 text-zinc-400"
                          }
                        >
                          {project.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-stride-surface border-stride-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription className="text-zinc-400">
                Tasks updated in the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivityTasks.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  No recent activity
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivityTasks.map((task) => {
                    const project = projects.find((p) => p.id === task.projectId);
                    const Icon = statusConfig[task.status].icon;

                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-stride-blue/30 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-0.5 ${statusConfig[task.status].color}`} />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{task.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-xs text-zinc-500">{project?.name}</p>
                              <span className="text-zinc-700">•</span>
                              <p className="text-xs text-zinc-500">
                                {format(new Date(task.updatedAt), "MMM d, h:mm a")}
                              </p>
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${
                              task.priority === "HIGH"
                                ? "bg-red-500/10 text-red-500"
                                : task.priority === "MEDIUM"
                                ? "bg-yellow-500/10 text-yellow-500"
                                : "bg-zinc-700 text-zinc-400"
                            }`}
                          >
                            {task.priority.toLowerCase()}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}