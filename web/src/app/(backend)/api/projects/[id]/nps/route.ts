/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(backend)/api/projects/[id]/nps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { idSchema } from "@/app/(backend)/schemas/base.schema";
import { createNPSSchema } from "@/app/(backend)/schemas/nps.schema";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import prisma from "@/app/(backend)/services/db";
import { returnInvalidDataErrors, zodErrorHandler } from "@/utils";
import { getProjectById } from "@/app/(backend)/services/projects";

const omitUndefined = <T extends Record<string, any>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }
    const projectId = idResult.data;

    const body = await request.json();
    const parsed = createNPSSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);
    const validated = parsed.data;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true },
    });
    if (!project) {
      return NextResponse.json(toErrorMessage("Projeto não encontrado"), { status: 404 });
    }

    const exists = await prisma.nPSResponse.findUnique({ where: { projectId } });
    if (exists) {
      return NextResponse.json(toErrorMessage("Este projeto já possui NPS cadastrado"), { status: 409 });
    }

    const data = omitUndefined({
      projectId,
      clientName: validated.clientName,
      clientNumber: validated.clientNumber,
      responseDate: validated.responseDate,
      accordanceScore: validated.accordanceScore,
      accordanceFeedback: validated.accordanceFeedback,
      expectationsScore: validated.expectationsScore,
      expectationsFeedback: validated.expectationsFeedback,
      qualityScore: validated.qualityScore,
      qualityFeedback: validated.qualityFeedback,
      missingFeatures: validated.missingFeatures,
      improvementSuggestions: validated.improvementSuggestions,
      npsScore: validated.npsScore,
      pmNotes: validated.pmNotes,
    });

    const created = await prisma.nPSResponse.create({ data: data as any });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await context.params; 
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(toErrorMessage("ID inválido"), { status: 400 });
    }
    const projectId = idResult.data;

    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(toErrorMessage("Projeto não encontrado"), { status: 404 });
    }

    const npsResponse = await prisma.nPSResponse.findUnique({
      where: { projectId },
      include: { project: true },
    });

    if (!npsResponse) {
      return NextResponse.json(toErrorMessage("NPS não encontrado"), { status: 404 });
    }

    return NextResponse.json(npsResponse, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}