import type { Role } from '@/generated/prisma';

export type AllowedRoutes = { 
  GET?: Role[]
  POST?: Role[]
  PATCH?: Role[]
  DELETE?: Role[]
}

// Main application types for Poli Júnior project management

export type ProjectStatus = 'Crítica' | 'Ruim' | 'Normal' | 'Possível ENB' | 'Congelado' | 'Finalizado';

export type TaskPriority = 'Alta' | 'Média' | 'Baixa';
export type TaskType = 'Front' | 'Back';
export type TaskStatus = 'ToDo' | 'InProgress' | 'Review' | 'Done';

export type MemberRole = 'Front' | 'Back' | 'PM' | 'PO' | 'QA';

export interface Project {
  id: string;
  name: string;
  client: string;
  coverImage?: string;
  shortDescription: string;
  startDate: Date;
  plannedEndDate: Date;
  actualEndDate?: Date;
  status: ProjectStatus;
  price?: number;
  isContracted: boolean;
  
  // Team
  analysts: {
    id: string;
    name: string;
    role: MemberRole;
  }[];
  
  // Metrics
  delayDays: number;
  csatCollectionRate: number;
  averageCSAT: number;
  npsScore?: number;
  isENBCandidate: boolean;
  isENB: boolean;
  
  // Relations
  sprints: Sprint[];
  handoffDocument?: HandoffDocument;
}

export interface Sprint {
  id: string;
  projectId: string;
  number: number;
  startDate: Date;
  endDate: Date;
  capacity: number;
  goals: string[];
  
  // Planning and tasks
  tasks: Task[];
  
  // Retrospective
  retrospective?: {
    whatWentWell: string[];
    canImprove: string[];
    actions: string[];
    attachments?: string[];
    responsibles: string[];
  };
  
  // Satisfaction
  csatResponses: CSATResponse[];
  npsLink?: string;
}

export interface Task {
  id: string;
  sprintId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  type: TaskType;
  responsible: string;
  estimate: number; // story points
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HandoffDocument {
  id: string;
  projectId: string;
  objectives: string;
  scope: string;
  clientAgreements: string;
  artifacts: string[];
  risks: string[];
  stakeholders: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CSATResponse {
  id: string;
  sprintId: string;
  projectId: string;
  responseDate: Date;
  
  // CSAT Questions (1-5 scale)
  teamCommunicationScore: number;
  teamCommunicationFeedback: string;
  
  qualityScore: number;
  qualityFeedback: string;
  
  overallSatisfactionScore: number;
  
  // Generated fields
  averageScore: number;
  uniqueToken: string; // for public form access
}

export interface NPSResponse {
  id: string;
  projectId: string;
  sprintId?: string;
  responseDate: Date;
  
  // Perception questions (1-5 scale)
  accordanceScore: number;
  accordanceFeedback: string;
  
  expectationsScore: number;
  expectationsFeedback: string;
  
  qualityScore: number;
  qualityFeedback: string;
  
  missingFeatures: string;
  improvementSuggestions: string;
  
  // Main NPS question (0-10 scale)
  npsScore: number;
  
  // SDR field (for promoters)
  sdrNotes?: string;
  
  uniqueToken: string; // for public form access
}

export interface OKR {
  id: string;
  objective: string;
  period: string; // e.g., "Q1 2024", "Semestre 1", etc.
  keyResults: KeyResult[];
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyResult {
  id: string;
  okrId: string;
  name: string;
  measurementMethod: string;
  baseline: number;
  currentValue: number;
  target: number;
  achievementPercentage: number;
  actionPlan: string;
  updatedAt: Date;
}

export interface Metrics {
  period: string;
  revenueTarget: number;
  currentRevenue: number;
  enbPercentage: number;
  globalNPS: number;
  totalProjects: number;
  completedProjects: number;
  enbProjects: number;
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