import { NextRequest, NextResponse } from "next/server";

import { registerSchema } from "@/backend/schemas";
import { blockForbiddenRequests, returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { getAllProjects } from "../../services/projects";
import { AllowedRoutes } from "@/types";
import { auth } from "@/auth";


export async function GET(request: NextRequest) {
  try {

    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }

    return zodErrorHandler(error);    
  }
}

export async function POST (request: NextRequest) {
  try {
    const body = await validBody(request);

    const project = await createProject(validBody)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        if (error.message.includes('slug')) {
          return NextResponse.json(
            toErrorMessage('Uma matéria com esse slug já existe'),
            { status: 409 }
          )
        }
        return NextResponse.json(
          toErrorMessage('Uma matéria com esses dados já existe'),
          { status: 409 }
        )
      }
      
      if (error.message.includes('Prisma')) {
        return NextResponse.json(
          toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
          { status: 400 }
        )
      }
    }

    return zodErrorHandler(error);
  }
}