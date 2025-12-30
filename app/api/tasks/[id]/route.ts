import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateTaskSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

// GET
export async function GET(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401});
    }

    const { id } = await params;

    const task = await prisma.task.findFirst({ 
        where: {
            id,
            project: { userId },
        },
        select: {
            id: true,
            title: true,
            description: true,
            status: true,
            priority: true,
            dueDate: true,
            projectId: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    if (!task) {
        return NextResponse.json({ error : "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: task}, { status: 200 });
}

// PUT
export async function PUT(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401});
    }

    const { id } = await params;

    const body = await req.json().catch(() => null);   
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid body", details: parsed.error.flatten()},
            {status: 400}
        );
    }

    // if moving task to new project --> ensure project belongs to same user
    if (parsed.data.projectId) {
        const dest = await prisma.project.findFirst({
            where: { id: parsed.data.projectId, userId }, 
            select: { id: true},
        });
        if (!dest) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }
    }

    const { count } = await prisma.task.updateMany({
        where: { id, project: { userId } },
        data: {
            ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
            ...(Object.prototype.hasOwnProperty.call(parsed.data, "description")
                ? { description: parsed.data.description ?? null }
                : {}),
            ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
            ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
            ...(parsed.data.dueDate !== undefined 
                ? { dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null }
                : {}),
            ...(parsed.data.projectId !== undefined ? { projectId: parsed.data.projectId } : {}),
        },
    });

  if (count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.task.findUnique({
    where: { id }, // Fixed: use destructured id
    select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
    }
  });

  return NextResponse.json({ data: updated }, { status: 200 });
}

// DELETE
export async function DELETE(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }
 
    const { id } = await params; // Fixed: added destructuring
 
    const { count } = await prisma.task.deleteMany({
        where: { id, project: { userId }}, // Fixed: use destructured id
    });

    if (count === 0) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204});
}