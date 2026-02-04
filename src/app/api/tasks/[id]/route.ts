import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/server-user";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId();
  const { id } = params;
  const body = (await request.json()) as {
    completed?: boolean;
    title?: string;
    priority?: number;
  };

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return NextResponse.json({ message: "Task를 찾을 수 없습니다." }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      completed: typeof body.completed === "boolean" ? body.completed : task.completed,
      title: body.title?.trim() || task.title,
      priority: [1, 2, 3].includes(body.priority ?? task.priority)
        ? (body.priority as 1 | 2 | 3)
        : task.priority,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const userId = getCurrentUserId();
  const { id } = params;

  const task = await prisma.task.findFirst({ where: { id, userId } });
  if (!task) {
    return NextResponse.json({ message: "Task를 찾을 수 없습니다." }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
