import prisma from "@/backend/services/db";
import { z } from "zod";
import { patchProjectSchema } from "../../schemas/project.schema";
import { Prisma } from "@/generated/prisma";



export async function getAllProjects() {
  const projects = await prisma.project.findMany({
    include: {
      analysts: true,
      handoffDocument: true,
      npsResponse: true,
      sprints: {
        include: {
          csatResponses: {
            select: {
              id: true,
              responseDate: true,
              overallSatisfactionScore: true,
            },
          },
        },
      },
    },
  });


  return projects;
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
  saleDate: Date;
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
        saleDate: data.saleDate,
        analysts: {
          create: data.analysts.map(a => ({
            name: a.name,
            role: a.role,
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
          include: {
      analysts: true,
      handoffDocument: true,
      npsResponse: true,
      sprints: {
        include: {
          csatResponses: {
            select: {
              id: true,
              responseDate: true,
              overallSatisfactionScore: true,
            },
          },
        },
      },
    },
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

export async function updateProject(
  id: string,
  data: z.infer<typeof patchProjectSchema>
) {
  const updateData: Prisma.ProjectUpdateInput = {};

  if (typeof data.name === "string") updateData.name = data.name;
  if (typeof data.client === "string") updateData.client = data.client;
  if (typeof data.shortDescription === "string") updateData.shortDescription = data.shortDescription;
  if (data.plannedEndDate instanceof Date) updateData.plannedEndDate = data.plannedEndDate;
  if (data.startDate instanceof Date) updateData.startDate = data.startDate;
  if (typeof data.status === "string") updateData.status = data.status;
  if (typeof data.price !== "undefined") updateData.price = data.price; // pode ser number ou null
  if (typeof data.sprintNumber === "number") updateData.sprintNumber = data.sprintNumber;
  if (typeof data.weeksOff === "number") updateData.weeksOff = data.weeksOff;

  // ⬇️ Só seta endDate se A CHAVE EXISTIR no payload:
  if ("endDate" in data) {
    // aqui pode ser Date OU null; Prisma entende null para limpar o campo
    updateData.endDate = data.endDate as Date | null;
  }

  if ("saleDate" in data && data.saleDate instanceof Date) {
    updateData.saleDate = data.saleDate;
  }

  // Analysts: só inclua esse bloco se 'analysts' veio no payload
  if (Array.isArray(data.analysts)) {
    updateData.analysts = {
      update: data.analysts.map(a => ({
        where: { id: a.id },
        data: { name: a.name, role: a.role },
      })),
    };
  }

  return prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      analysts: true,
      sprints: true,
      npsResponse: true,
      handoffDocument: true,
    },
  });
}


