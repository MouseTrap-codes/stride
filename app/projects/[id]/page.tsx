"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, MoreVertical, Trash2, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, X, AlertCircle } from "lucide-react";
import { format } from "date-fns";

type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

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
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
  _count: { tasks: number };
};

const statusConfig = {
  TODO: { label: "To Do", icon: Circle, color: "text-zinc-400", badge: "bg-zinc-800 text-zinc-300" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-stride-blue", badge: "bg-stride-blue/10 text-stride-blue" },
  DONE: { label: "Done", icon: CheckCircle2, color: "text-green-500", badge: "bg-green-500/10 text-green-500" },
};

const priorityConfig = {
  LOW: { label: "Low", color: "bg-zinc-700 text-zinc-300", icon: "○" },
  MEDIUM: { label: "Medium", color: "bg-yellow-500/10 text-yellow-500", icon: "◐" },
  HIGH: { label: "High", color: "bg-red-500/10 text-red-500", icon: "●" },
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/projects/${resolvedParams.id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data.data);
    } else {
      router.push("/projects");
    }
    setLoading(false);
  }, [resolvedParams.id, router]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchProject();
    }
  }, [isSignedIn, fetchProject]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  if (loading || !project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-zinc-400">Loading project...</div>
        </div>
      </div>
    );
  }

  const tasksByStatus = {
    TODO: project.tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: project.tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: project.tasks.filter((t) => t.status === "DONE"),
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => router.push("/projects")}
          className="mb-6 text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-zinc-400 text-sm max-w-2xl">{project.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4 text-sm text-zinc-500">
              <span>{project._count.tasks} total tasks</span>
              <span className="text-zinc-700">•</span>
              <span>{tasksByStatus.DONE.length} completed</span>
            </div>
          </div>
          <Button size="lg" onClick={() => setShowCreateDialog(true)} className="bg-stride-blue hover:bg-stride-blue-hover">
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </Button>
        </div>
      </section>

      {/* Kanban Board */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((status) => (
            <div key={status} className="space-y-4">
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => { const Icon = statusConfig[status].icon; return <Icon className={`w-5 h-5 ${statusConfig[status].color}`} />; })()}
                  <h2 className="font-semibold">{statusConfig[status].label}</h2>
                  <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                    {tasksByStatus[status].length}
                  </Badge>
                </div>
              </div>

              {/* Tasks */}
              <div className="space-y-3">
                {tasksByStatus[status].length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-sm">
                    No tasks
                  </div>
                ) : (
                  tasksByStatus[status].map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={fetchProject}
                      onDelete={fetchProject}
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        projectId={resolvedParams.id}
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchProject();
        }}
      />
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
    onDelete();
  };

  const handleStatusChange = async (newStatus: TaskStatus) => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    onUpdate();
  };

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "DONE";

  return (
    <>
      <Card className="bg-stride-surface border-stride-border hover:border-stride-blue/30 transition-all cursor-pointer group">
        <div className="relative p-4">
          {/* Dropdown Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-opacity"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-stride-surface border-stride-border">
                <DropdownMenuItem
                  onClick={() => setShowEditDialog(true)}
                  className="focus:bg-zinc-800"
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDeleteAlert(true)}
                  className="text-red-400 focus:text-red-400 focus:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="space-y-3 pr-8">
            <div className="space-y-2">
              <h3 className="font-medium leading-tight">{task.title}</h3>
              
              {/* Priority and Due Date */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className={`${priorityConfig[task.priority].color} text-xs`}>
                  {priorityConfig[task.priority].icon} {priorityConfig[task.priority].label}
                </Badge>
                
                {task.dueDate && (
                  <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-400' : 'text-zinc-500'}`}>
                    {isOverdue && <AlertCircle className="w-3 h-3" />}
                    <CalendarIcon className="w-3 h-3" />
                    <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                  </div>
                )}
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-zinc-400 line-clamp-2">{task.description}</p>
            )}

            {/* Status Selector */}
            <Select value={task.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full h-8 bg-zinc-800 border-stride-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stride-surface border-stride-border">
                {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((status) => (
                  <SelectItem key={status} value={status} className="text-xs">
                    {statusConfig[status].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Edit Dialog */}
      <EditTaskDialog
        task={task}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          setShowEditDialog(false);
          onUpdate();
        }}
      />

      {/* Delete Alert */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-stride-surface border-stride-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently delete "{task.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-stride-border hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Create Task Dialog
function CreateTaskDialog({
  projectId,
  open,
  onOpenChange,
  onSuccess,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("TODO");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        status,
        priority,
        dueDate: dueDate?.toISOString(),
        projectId,
      }),
    });

    if (res.ok) {
      setTitle("");
      setDescription("");
      setStatus("TODO");
      setPriority("MEDIUM");
      setDueDate(undefined);
      setShowCalendar(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-stride-surface border-stride-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new task to track your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-zinc-300">
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="bg-zinc-800 border-stride-border focus:ring-stride-blue focus:border-stride-blue"
                required
                autoFocus
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description" className="text-zinc-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="bg-zinc-800 border-stride-border focus:ring-stride-blue focus:border-stride-blue resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-zinc-300">
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-zinc-800 border-stride-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stride-surface border-stride-border">
                    {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-zinc-300">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger className="bg-zinc-800 border-stride-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stride-surface border-stride-border">
                    {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {priorityConfig[p].icon} {priorityConfig[p].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Due Date (Optional)</Label>
                {dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDueDate(undefined)}
                    className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showCalendar && (
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setShowCalendar(false);
                  }}
                  fixedWeeks
                  className="rounded-lg border border-stride-border bg-zinc-900"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-zinc-800 border-stride-border hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-stride-blue hover:bg-stride-blue-hover">
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Task Dialog
function EditTaskDialog({
  task,
  open,
  onOpenChange,
  onSuccess,
}: {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [priority, setPriority] = useState<TaskPriority>(task.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ? new Date(task.dueDate) : undefined);
    setShowCalendar(false);
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        status,
        priority,
        dueDate: dueDate ? dueDate.toISOString() : null,
      }),
    });

    if (res.ok) {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-stride-surface border-stride-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update task details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-zinc-300">
                Task Title
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-zinc-800 border-stride-border focus:ring-stride-blue focus:border-stride-blue"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-zinc-300">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-zinc-800 border-stride-border focus:ring-stride-blue focus:border-stride-blue resize-none"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="text-zinc-300">
                  Status
                </Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger className="bg-zinc-800 border-stride-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stride-surface border-stride-border">
                    {(["TODO", "IN_PROGRESS", "DONE"] as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusConfig[s].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-priority" className="text-zinc-300">
                  Priority
                </Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger className="bg-zinc-800 border-stride-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-stride-surface border-stride-border">
                    {(["LOW", "MEDIUM", "HIGH"] as TaskPriority[]).map((p) => (
                      <SelectItem key={p} value={p}>
                        {priorityConfig[p].icon} {priorityConfig[p].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Due Date (Optional)</Label>
                {dueDate && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDueDate(undefined)}
                    className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCalendar(!showCalendar)}
                className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
              </Button>
              {showCalendar && (
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(date) => {
                    setDueDate(date);
                    setShowCalendar(false);
                  }}
                  fixedWeeks
                  className="rounded-lg border border-stride-border bg-zinc-900"
                />
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-zinc-800 border-stride-border hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-stride-blue hover:bg-stride-blue-hover">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}