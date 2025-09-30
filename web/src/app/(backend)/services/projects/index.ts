import prisma from "@/backend/services/db";
import { z } from "zod";
import { patchProjectSchema } from "../../schemas/project.schema";



export async function getAllProjects() {
  return await prisma.project.findMany({include: { analysts: true, sprints: true }
  });
}

export async function createProject(data: {
  name: string;
  client: string;
  shortDescription: string;
  plannedEndDate: Date;
  startDate: Date;
  sprintNumber: number;
  endDate?: Date | null;
  price?: number | null;
  analysts: Array<{ name: string; role: 'Front' | 'Back' | 'PM' | 'Coord' }>;
}) {
  try {
    const project = await prisma.project.create({
      data: {
        name: data.name,
        client: data.client,
        shortDescription: data.shortDescription,
        plannedEndDate: data.plannedEndDate,
        startDate: data.startDate,
        price: data.price ?? null,
        sprintNumber: data.sprintNumber,
        analysts: {
          create: data.analysts.map(a => ({
            name: a.name,
            role: a.role as any,
          })),
        },
      },
      include: { analysts: true },
    });

    return project;
  } catch (error) {
    throw new Error((error as Error)?.message || 'Falha ao criar projeto');
  }
}

export async function getProjectById(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { analysts: true, sprints: true },
    });
    return project;
  } catch (error) {
    throw new Error((error as Error)?.message || 'Falha ao buscar projeto');
  }
}

export async function deleteProject(id: string) {
  try {
    const project = await prisma.project.delete({
      where: { id },
    });
    return project;
  } catch (error) {
    throw new Error((error as Error)?.message || 'Falha ao deletar projeto');
  }
}

export async function updateProject(id: string, data: z.infer<typeof patchProjectSchema>) {
  return await prisma.project.update({
    where: { id },
    data
  })
}


