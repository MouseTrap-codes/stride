"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Plus, MoreVertical, Trash2, FolderKanban, Calendar as CalendarIcon, Edit, X } from "lucide-react";
import { format } from "date-fns";

type ProjectStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";

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
  ACTIVE: { label: "Active", color: "bg-stride-blue/10 text-stride-blue" },
  COMPLETED: { label: "Completed", color: "bg-green-500/10 text-green-500" },
  ARCHIVED: { label: "Archived", color: "bg-zinc-700 text-zinc-400" },
};

export default function ProjectsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = await res.json();
    setProjects(data.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchProjects();
    }
  }, [isSignedIn, fetchProjects]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-zinc-400">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              My Projects
            </h1>
            <p className="text-zinc-400 text-sm">
              {projects.length} {projects.length === 1 ? "project" : "projects"}
            </p>
          </div>
          <Button size="lg" onClick={() => setShowCreateDialog(true)} className="bg-stride-blue hover:bg-stride-blue-hover">
            <Plus className="w-5 h-5 mr-2" />
            New Project
          </Button>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {projects.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-stride-blue/10 mb-4">
              <FolderKanban className="w-8 h-8 text-stride-blue" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No projects yet</h3>
            <p className="text-zinc-400 mb-8">
              Create your first project to get started with Stride
            </p>
            <Button size="lg" onClick={() => setShowCreateDialog(true)} className="bg-stride-blue hover:bg-stride-blue-hover">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onUpdate={fetchProjects}
                onDelete={fetchProjects}
                onClick={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Create Dialog */}
      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={() => {
          setShowCreateDialog(false);
          fetchProjects();
        }}
      />
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  onUpdate,
  onDelete,
  onClick,
}: {
  project: Project;
  onUpdate: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    onDelete();
  };

  return (
    <>
      <div className="relative" onClick={onClick}>
        <Card className="bg-stride-surface border-stride-border hover:border-stride-blue/50 transition-all duration-300 cursor-pointer">
          {/* Dropdown Menu */}
          <div className="absolute top-4 right-4 z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-stride-surface border-stride-border">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}
                  className="focus:bg-zinc-800"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteAlert(true);
                  }}
                  className="text-red-400 focus:text-red-400 focus:bg-zinc-800"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <CardHeader className="space-y-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-lg bg-stride-blue/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-stride-blue" />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl pr-8">{project.name}</CardTitle>
              </div>
              <Badge variant="secondary" className={statusConfig[project.status].color}>
                {statusConfig[project.status].label}
              </Badge>
              <CardDescription className="text-zinc-400 leading-relaxed line-clamp-2 min-h-[3rem]">
                {project.description || "No description"}
              </CardDescription>
            </div>

            {/* Footer Info */}
            <div className="space-y-2 pt-2 border-t border-stride-border">
              <div className="flex items-center gap-3 text-sm text-zinc-500">
                <span>
                  {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"}
                </span>
                {/* Only show createdAt if no timeline dates exist */}
                {!project.startDate && !project.endDate && (
                  <>
                    <span className="text-zinc-700">•</span>
                    <span className="text-zinc-600">
                      Created {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
              {(project.startDate || project.endDate) && (
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CalendarIcon className="w-3 h-3" />
                  {project.startDate && project.endDate ? (
                    // Both dates - show range
                    <>
                      {format(new Date(project.startDate), "MMM d")}
                      {" - "}
                      {format(new Date(project.endDate), "MMM d, yyyy")}
                    </>
                  ) : project.startDate ? (
                    // Only start date
                    <>Starts: {format(new Date(project.startDate), "MMM d, yyyy")}</>
                  ) : (
                    // Only end date
                    <>Ends: {format(new Date(project.endDate!), "MMM d, yyyy")}</>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Edit Dialog */}
      <EditProjectDialog
        project={project}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          setShowEditDialog(false);
          onUpdate();
        }}
      />

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent className="bg-stride-surface border-stride-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete project?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This will permanently delete "{project.name}" and all {project._count.tasks}{" "}
              {project._count.tasks === 1 ? "task" : "tasks"} in it. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-stride-border hover:bg-zinc-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Create Project Dialog
function CreateProjectDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("ACTIVE");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || undefined,
        status,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      setStatus("ACTIVE");
      setStartDate(undefined);
      setEndDate(undefined);
      setShowStartCalendar(false);
      setShowEndCalendar(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-stride-surface border-stride-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Add a new project to organize your tasks and track progress.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-300">
                Project Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Project"
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
                placeholder="What's this project about?"
                className="bg-zinc-800 border-stride-border focus:ring-stride-blue focus:border-stride-blue resize-none"
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status" className="text-zinc-300">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="bg-zinc-800 border-stride-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stride-surface border-stride-border">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300">Project Timeline (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Start Date</span>
                    {startDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStartDate(undefined)}
                        className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStartCalendar(!showStartCalendar)}
                    className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                  {showStartCalendar && (
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      fixedWeeks
                      className="rounded-lg border border-stride-border bg-zinc-900"
                    />
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">End Date</span>
                    {endDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEndDate(undefined)}
                        className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEndCalendar(!showEndCalendar)}
                    className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                  {showEndCalendar && (
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      fixedWeeks
                      className="rounded-lg border border-stride-border bg-zinc-900"
                    />
                  )}
                </div>
              </div>
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
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Edit Project Dialog
function EditProjectDialog({
  project,
  open,
  onOpenChange,
  onSuccess,
}: {
  project: Project;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.startDate ? new Date(project.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.endDate ? new Date(project.endDate) : undefined
  );
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    setName(project.name);
    setDescription(project.description || "");
    setStatus(project.status);
    setStartDate(project.startDate ? new Date(project.startDate) : undefined);
    setEndDate(project.endDate ? new Date(project.endDate) : undefined);
    setShowStartCalendar(false);
    setShowEndCalendar(false);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description: description || undefined,
        status,
        startDate: startDate ? startDate.toISOString() : null,
        endDate: endDate ? endDate.toISOString() : null,
      }),
    });

    if (res.ok) {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] bg-stride-surface border-stride-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update project details and timeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-zinc-300">
                Project Name
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            <div className="grid gap-2">
              <Label htmlFor="edit-status" className="text-zinc-300">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger className="bg-zinc-800 border-stride-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-stride-surface border-stride-border">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label className="text-zinc-300">Project Timeline (Optional)</Label>
              <div className="grid grid-cols-2 gap-4">
                {/* Start Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">Start Date</span>
                    {startDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setStartDate(undefined)}
                        className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStartCalendar(!showStartCalendar)}
                    className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                  {showStartCalendar && (
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setShowStartCalendar(false);
                      }}
                      fixedWeeks
                      className="rounded-lg border border-stride-border bg-zinc-900"
                    />
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-400">End Date</span>
                    {endDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEndDate(undefined)}
                        className="h-6 px-2 text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEndCalendar(!showEndCalendar)}
                    className="w-full bg-zinc-800 border-stride-border justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                  {showEndCalendar && (
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setShowEndCalendar(false);
                      }}
                      fixedWeeks
                      className="rounded-lg border border-stride-border bg-zinc-900"
                    />
                  )}
                </div>
              </div>
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