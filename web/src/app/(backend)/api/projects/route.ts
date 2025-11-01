import { NextRequest, NextResponse } from "next/server";

import { returnInvalidDataErrors, validBody, zodErrorHandler } from "@/utils/api";
import { getAllProjects, createProject } from "../../services/projects";
import { toErrorMessage } from "@/utils/api/toErrorMessage";
import { createProjectSchema } from "../../schemas/project.schema";


export async function GET() {
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

    const validationResult = createProjectSchema.safeParse(body)
       
    if (!validationResult.success) {
      return returnInvalidDataErrors(validationResult.error);
    }

    const validatedData = validationResult.data

    const project = await createProject(validatedData)

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error instanceof Error) {
        if (error.message.includes('Prisma')) {
          return NextResponse.json(
            toErrorMessage('Erro no banco de dados - Verifique os dados fornecidos'),
            { status: 400 }
          )
        }
      }
    }

    return zodErrorHandler(error);
  }
}