/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/app/(backend)/services/db";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { returnInvalidDataErrors, zodErrorHandler } from "@/utils";

import { createCSATSchema } from "@/app/(backend)/schemas/csat.schema";
import { getProjectById } from "@/app/(backend)/services/projects";
import { getCSATBySprintId, getSprintByProjectAndNumber, createCSATForSprint } from "@/app/(backend)/services/csat";

// validação dos params
const idSchema = z.string().uuid();
const numberParamSchema = z.string().regex(/^\d+$/).transform((v) => parseInt(v, 10));

const omitUndefined = <T extends Record<string, any>>(o: T) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;

// POST /api/projects/:id/sprint/:number/csat  -> cria CSAT (1 por sprint)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await context.params;

    // valida id
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(toErrorMessage("ID do projeto inválido"), { status: 400 });
    }
    const projectId = idResult.data;

    // valida sprint number
    const numResult = numberParamSchema.safeParse(number);
    if (!numResult.success) {
      return NextResponse.json(toErrorMessage("Número da sprint inválido"), { status: 400 });
    }
    const sprintNumber = numResult.data;

    // valida body
    const body = await request.json();
    const parsed = createCSATSchema.safeParse(body);
    if (!parsed.success) return returnInvalidDataErrors(parsed.error);
    const validated = parsed.data;

    // checa projeto
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(toErrorMessage("Projeto não encontrado"), { status: 404 });
    }

    // checa sprint
    const sprint = await getSprintByProjectAndNumber(projectId, sprintNumber);
    if (!sprint) {
      return NextResponse.json(toErrorMessage("Sprint não encontrada"), { status: 404 });
    }

    // 1 por sprint
    const already = await getCSATBySprintId(sprint.id);
    if (already) {
      return NextResponse.json(toErrorMessage("Esta sprint já possui CSAT cadastrado"), { status: 409 });
    }

    // cria CSAT
    const created = await createCSATForSprint({
      sprintId: sprint.id,
      responseDate: validated.responseDate,
      teamCommunicationScore: validated.teamCommunicationScore,
      teamCommunicationFeedback: validated.teamCommunicationFeedback || "",
      qualityScore: validated.qualityScore,
      qualityFeedback: validated.qualityFeedback || "",
      overallSatisfactionScore: validated.overallSatisfactionScore,
      improvementSuggestions: validated.improvementSuggestions || "",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}

// GET /api/projects/:id/sprint/:number/csat  -> retorna CSAT da sprint
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string; number: string }> }
) {
  try {
    const { id, number } = await context.params;

    // valida id
    const idResult = idSchema.safeParse(id);
    if (!idResult.success) {
      return NextResponse.json(toErrorMessage("ID do projeto inválido"), { status: 400 });
    }
    const projectId = idResult.data;

    // valida sprint number
    const numResult = numberParamSchema.safeParse(number);
    if (!numResult.success) {
      return NextResponse.json(toErrorMessage("Número da sprint inválido"), { status: 400 });
    }
    const sprintNumber = numResult.data;

    // checa projeto
    const project = await getProjectById(projectId);
    if (!project) {
      return NextResponse.json(toErrorMessage("Projeto não encontrado"), { status: 404 });
    }

    // checa sprint
    const sprint = await getSprintByProjectAndNumber(projectId, sprintNumber);
    if (!sprint) {
      return NextResponse.json(toErrorMessage("Sprint não encontrada"), { status: 404 });
    }

    const csat = await prisma.cSATResponse.findFirst({
      where: { sprintId: sprint.id },
    });

    if (!csat) {
      return NextResponse.json(toErrorMessage("CSAT não encontrado"), { status: 404 });
    }

    return NextResponse.json(csat, { status: 200 });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    return zodErrorHandler(error);
  }
}
