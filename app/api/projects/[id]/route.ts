import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { updateProjectSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

// GET 
export async function GET(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401});
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
        where: { id, userId },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            tasks: {
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            _count: { select: { tasks: true }},
        }
    });

    if (!project) {
        return NextResponse.json({ error: "Not found"}, { status: 404 });
    }

    return NextResponse.json({ data: project }, { status: 200 });
}

// PUT
// needs name, optional desc
export async function PUT(req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid body", details: parsed.error.flatten() },
            { status: 400}
        );
    }

    const { id } = await params;

    const { count } = await prisma.project.updateMany({
        where: { id, userId },
        data: {
            name: parsed.data.name,
            ...(Object.prototype.hasOwnProperty.call(parsed.data, "description")
            ? { description : parsed.data.description }
            : {}
            ),
        },
    });

    if (count === 0) {
        return NextResponse.json({ error: "Not found"}, { status: 404 });
    }

    const updated = await prisma.project.findUnique({
        where: { id },
        select: { id: true, 
            name: true, 
            description: true, 
            createdAt: true, 
            updatedAt: true},
    });

    return NextResponse.json({ data: updated }, { status: 200 });
}

// DELETE
export async function DELETE(_req: Request, { params }: Params) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 });
    }

    const { id } = await params;

    const { count } = await prisma.project.deleteMany({
        where: { id, userId },
    });

    if (count === 0) {
        return NextResponse.json({ error: "Not found"}, { status: 404 });
    }

    // tasks are deleted by cascade
    return new NextResponse(null, { status: 204 });
}