import prisma from "@/backend/services/db";
import { patchSchema } from "../../schemas";
import { z } from "zod";


export async function getAllProjects() {
  return await prisma.project.findMany();
}
