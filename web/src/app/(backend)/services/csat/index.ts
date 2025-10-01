import prisma from "@/app/(backend)/services/db";

export async function getSprintByProjectAndNumber(projectId: string, sprintNumber: number) {
  return prisma.sprint.findFirst({
    where: { projectId, number: sprintNumber },
    select: { id: true, number: true, projectId: true },
  });
}

export async function getCSATBySprintId(sprintId: string) {
  // 1 por sprint → pegamos o primeiro (ou unique se você criar unique index em sprintId)
  return prisma.cSATResponse.findFirst({
    where: { sprintId },
  });
}

type CreateCSATInput = {
  sprintId: string;
  responseDate?: Date;
  teamCommunicationScore: number;
  teamCommunicationFeedback?: string;
  qualityScore: number;
  qualityFeedback?: string;
  overallSatisfactionScore: number;
  improvementSuggestions? : string;
};

export async function createCSATForSprint(input: CreateCSATInput) {
  const averageScore = Math.round(
    (input.teamCommunicationScore + input.qualityScore + input.overallSatisfactionScore) / 3
  );

  return prisma.cSATResponse.create({
    data: {
      sprintId: input.sprintId,
      responseDate: input.responseDate ?? new Date(),
      teamCommunicationScore: input.teamCommunicationScore,
      teamCommunicationFeedback: input.teamCommunicationFeedback,
      qualityScore: input.qualityScore,
      qualityFeedback: input.qualityFeedback,
      overallSatisfactionScore: input.overallSatisfactionScore,
      improvementSuggestions: input.improvementSuggestions,
      averageScore,
    },
  });
}
