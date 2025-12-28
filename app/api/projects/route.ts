import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validators";


// GET
export async function GET() {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401});
    }

    const projects = await prisma.project.findMany({
        where: { userId },
        orderBy: { createdAt: "desc"},
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
            _count: {select: {tasks:true}}
        }
    });

    return NextResponse.json({ data: projects }, { status:200 });
}

// POST
export async function POST(req: Request) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401});
    }

    const body = await req.json().catch(() => null);
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Invalid body", details: parsed.error.flatten() },
            { status: 400}
        );
    }

    const project = await prisma.project.create({
        data: {
            userId,
            name: parsed.data.name,
            description: parsed.data.description,
        },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
        }
    });

    return NextResponse.json({ data: project }, { status: 201 });
}