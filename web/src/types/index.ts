/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Analyst, Role, Project, Sprint, NPSResponse, CSATResponse } from '@/generated/prisma';

export type AllowedRoutes = { 
  GET?: Role[]
  POST?: Role[]
  PATCH?: Role[]
  DELETE?: Role[]
}

// Main application types for Poli Júnior project management
export type SprintComplete = Sprint & {
  csatResponses: CSATResponse[];
}

export type ProjectComplete = Project & {
  analysts: Analyst[];
  sprints: SprintComplete[];
  npsResponses: NPSResponse[];
}

// Utility types
export type PeriodFilter = 'semestre' | 'ciclo' | 'ano';

export interface AuditLog {
  id: string;
  entityId: string;
  entityType: string;
  action: string;
  userId: string;
  userName: string;
  changes: Record<string, any>;
  timestamp: Date;
}