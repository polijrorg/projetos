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

type CreateProjectData = Omit<Prisma.ProjectCreateInput, "analysts"> & { analysts: Prisma.ProjectCreateInput["analysts"][] };

export async function createProject(data: {
  name: string;
  client: string;
  shortDescription: string;
  plannedEndDate: Date;
  startDate: Date;
  sprintNumber: number;
  endDate?: Date | null;
  price?: number | null;
  analysts: Array<{ id?: string; name: string; role: 'Front' | 'Back' | 'PM' | 'Coord' }>;
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

  if ("endDate" in data) {
    updateData.endDate = data.endDate as Date | null;
  }

  if ("saleDate" in data && data.saleDate instanceof Date) {
    updateData.saleDate = data.saleDate;
  }

  // Analysts: só inclua esse bloco se 'analysts' veio no payload
  if (Array.isArray(data.analysts)) {
    // 1) Busca atuais
    const current = await prisma.analyst.findMany({
      where: { projectId: id },
      select: { id: true },
    });
    const currentIds = new Set(current.map(a => a.id));

    // 2) Separa incoming em create/update
    const toCreate = data.analysts.filter(a => !a.id);
    const toUpdate = data.analysts.filter(a => a.id);

    // 3) Descobre quem remover (atuais que não vieram no payload)
    const incomingIds = new Set(toUpdate.map(a => a.id!));
    const toDeleteIds = [...currentIds].filter(curId => !incomingIds.has(curId));

    updateData.analysts = {
      // cria novos (sem id)
      create: toCreate.map(a => ({
        name: a.name,
        role: a.role,
      })),
      // atualiza os que vieram com id
      update: toUpdate.map(a => ({
        where: { id: a.id! },
        data: { name: a.name, role: a.role },
      })),
      // remove os que sumiram do payload
      deleteMany: toDeleteIds.length ? { id: { in: toDeleteIds } } : undefined,
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


