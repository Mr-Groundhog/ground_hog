"use server";

import { prisma } from "@/lib/db";
import { submitToolSchema, SubmitToolFormValues } from "./schema";

export async function getPublicTools() {
  return await prisma.tool.findMany({
    where: {
      status: {
        not: "PENDING", // Only show non-pending tools to public
      }
    },
    orderBy: { category: "asc" },
  });
}

export async function submitTool(data: SubmitToolFormValues) {
  const validated = submitToolSchema.parse(data);
  
  await prisma.tool.create({
    data: {
      ...validated,
      status: "PENDING",
      type: "EXTERNAL", // User submissions are external by default
      version: "v1.0.0",
    },
  });
  
  return { success: true };
}
