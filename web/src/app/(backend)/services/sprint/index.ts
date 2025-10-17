
 
import prisma from "@/backend/services/db";

export async function listSprintsByProject(projectId: string) {
  const sprints = await prisma.sprint.findMany({
    where: { projectId },
    orderBy: { number: "asc" },
    include: { tasks: true, csatResponses: true },
  });

  return sprints.map(s => {
    const totalTasks = s.tasks.length;
    const done = s.tasks.filter(t => t.status === "DONE").length;
    const progress = totalTasks ? Math.round((done / totalTasks) * 100) : 0;
    const plannedHours = s.tasks.reduce((acc, t) => acc + (t.estimate ?? 0), 0);

    const csatExists = s.csatResponses.length > 0;
    const csatOverall = csatExists ? s.csatResponses[0].overallSatisfactionScore : null;

    return {
      ...s,
      metrics: {
        csatExists,
        csatOverall,
        totalTasks,
        done,
        progress,
        plannedHours,
        capacityHours: plannedHours,
      },
    };
  });
}

export async function createSprint(projectId: string, data: {
  capacityHours: string;
  number: number;
  startDate: Date;
  endDate: Date;
  goals: string[];
}) {
  const exists = await prisma.sprint.findFirst({ where: { projectId, number: data.number } });
  if (exists) throw new Error("Já existe uma sprint com esse número");

  return prisma.sprint.create({
    data: {
      projectId,
      number: data.number,
      startDate: data.startDate,
      endDate: data.endDate,
      goals: data.goals,
      capacityHours: data.capacityHours ?? null,
    },
  });
}

export async function getSprintByNumber(projectId: string, number: number) {
  const sprint = await prisma.sprint.findFirst({
    where: { projectId, number },
    include: { tasks: true, csatResponses: true },
  });
  if (!sprint) return null;

  const totalTasks = sprint.tasks.length;
  const done = sprint.tasks.filter(t => t.status === "DONE").length;
  const progress = totalTasks ? Math.round((done / totalTasks) * 100) : 0;
  const plannedHours = sprint.tasks.reduce((acc, t) => acc + (t.estimate ?? 0), 0);

  return {
    ...sprint,
    metrics: { totalTasks, done, progress, plannedHours, capacityHours: plannedHours },
  };
}

export async function updateSprint(projectId: string, number: number, data: {
  startDate?: Date;
  endDate?: Date;
  goals?: string[];
}) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  return prisma.sprint.update({
    where: { id: sprint.id },
    data: {
      ...(data.startDate ? { startDate: data.startDate } : {}),
      ...(data.endDate ? { endDate: data.endDate } : {}),
      ...(data.goals ? { goals: data.goals } : {}),
    },
  });
}

export async function addGoal(projectId: string, number: number, goal: string) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  return prisma.sprint.update({
    where: { id: sprint.id },
    data: { goals: [...sprint.goals, goal] },
  });
}

export async function removeGoal(projectId: string, number: number, index: number) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  if (index < 0 || index >= sprint.goals.length) throw new Error("Índice inválido");

  return prisma.sprint.update({
    where: { id: sprint.id },
    data: { goals: sprint.goals.filter((_, i) => i !== index) },
  });
}

// -------- Tasks --------
export async function listTasks(projectId: string, number: number) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  const tasks = await prisma.task.findMany({ where: { sprintId: sprint.id }, orderBy: { id: "asc" } });
  const front = tasks.filter(t => t.type === "Front-end");
  const back  = tasks.filter(t => t.type === "Back-end");

  return { tasks, buckets: { front, back } };
}

export async function createTask(projectId: string, number: number, data: {
  title: string;
  description?: string;
  priority?: "Alta" | "Média" | "Baixa";
  type?: string; // "Front-end" | "Back-end" ou outro
  estimate?: number;
  status?: string;
}) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  return prisma.task.create({
    data: {
      sprintId: sprint.id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      type: data.type,
      estimate: data.estimate ?? 1,
      status: data.status ?? "TODO",
    },
  });
}

export async function updateTask(projectId: string, number: number, taskId: string, data: {
  title?: string;
  description?: string;
  priority?: "Alta" | "Média" | "Baixa";
  type?: string;
  estimate?: number;
  status?: string;
}) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  const task = await prisma.task.findFirst({ where: { id: taskId, sprintId: sprint.id } });
  if (!task) throw new Error("Task não encontrada");

  return prisma.task.update({
    where: { id: task.id },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.priority !== undefined ? { priority: data.priority } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.estimate !== undefined ? { estimate: data.estimate } : {}),
      ...(data.status !== undefined ? { status: data.status } : {}),
    },
  });
}

export async function deleteTask(projectId: string, number: number, taskId: string) {
  const sprint = await prisma.sprint.findFirst({ where: { projectId, number } });
  if (!sprint) throw new Error("Sprint não encontrada");

  const task = await prisma.task.findFirst({ where: { id: taskId, sprintId: sprint.id } });
  if (!task) throw new Error("Task não encontrada");

  await prisma.task.delete({ where: { id: task.id } });
  return { ok: true };
}
