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
