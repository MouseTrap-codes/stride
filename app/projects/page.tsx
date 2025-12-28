"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardAction } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, MoreVertical, Trash2, FolderKanban } from "lucide-react";

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { tasks: number };
};

export default function ProjectsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // fetch projects from API
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
          <Button size="lg" onClick={() => setShowCreateDialog(true)} className="bg-stride-blue hover:bg-stride-blue/90">
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
            <Button size="lg" onClick={() => setShowCreateDialog(true)} className="bg-stride-blue hover:bg-stride-blue/90">
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
                onDelete={fetchProjects}
                onClick={() => router.push(`/projects/${project.id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* create Dialog */}
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

// project card component
function ProjectCard({
  project,
  onDelete,
  onClick,
}: {
  project: Project;
  onDelete: () => void;
  onClick: () => void;
}) {
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const handleDelete = async () => {
    await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
    onDelete();
  };

  return (
    <>
      <div className="relative" onClick={onClick}>
        <Card className="bg-stride-surface border-stride-border hover:border-stride-blue/50 transition-all duration-300 cursor-pointer">
          {/* dropdown Menu */}
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
            {/* icon */}
            <div className="w-12 h-12 rounded-lg bg-stride-blue/10 flex items-center justify-center">
              <FolderKanban className="w-6 h-6 text-stride-blue" />
            </div>

            {/* text */}
            <div className="space-y-2">
              <CardTitle className="text-xl pr-8">{project.name}</CardTitle>
              <CardDescription className="text-zinc-400 leading-relaxed line-clamp-2 min-h-[3rem]">
                {project.description || "No description"}
              </CardDescription>
            </div>

            {/* footer info */}
            <div className="flex items-center gap-3 text-sm text-zinc-500 pt-2">
              <span>
                {project._count.tasks} {project._count.tasks === 1 ? "task" : "tasks"}
              </span>
              <span className="text-zinc-700">•</span>
              <span className="text-zinc-600">
                {new Date(project.createdAt).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* delete alert dialog */}
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

// create Project Dialog
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
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    });

    if (res.ok) {
      setName("");
      setDescription("");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-zinc-800">
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
                className="bg-zinc-800 border-zinc-700 focus:ring-stride-blue focus:border-stride-blue"
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
                className="bg-zinc-800 border-zinc-700 focus:ring-stride-blue focus:border-stride-blue resize-none"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-stride-blue hover:bg-stride-blue/90">
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}