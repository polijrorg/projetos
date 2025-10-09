import z from "zod";
import prisma from "../db";

export async function getAllOkrs() {
  try {
    const okrs = await prisma.okr.findMany({
      orderBy: {
        endDate: 'desc'
      }
    })
    return okrs
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar Okrs')
  }
}

export async function getOkrById(id: string) {
  try {
    const okr = await prisma.okr.findUnique({
      where: {
        id,
      },
      include: {
        keyResult: true,
      },
    })
    return okr
  } catch (error) {
    throw new Error(String(error) || 'Falha ao buscar Okr')
  }
}

export async function createOkr(data: { 
  goalDescription: string; 
  period: string; 
  keyResult: Array<{ name: string; metric: string; actionPlan: string }>; 
  startDate: Date; 
  endDate: Date; 
}) {
  try {
    const okr = await prisma.okr.create({
      data: {
        goalDescription: data.goalDescription,
        period: data.period,
        keyResult: {
          create: data.keyResult.map(k => ({
            name: k.name,
            metric: k.metric,
            actionPlan: k.actionPlan,
          })),
        },
        startDate: data.startDate,
        endDate: data.endDate,
      }
    })
    return okr
  } catch (error) {
    throw new Error(String(error) || 'Falha ao criar Okr')
  }
}