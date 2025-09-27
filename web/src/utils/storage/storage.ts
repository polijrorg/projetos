/* eslint-disable @typescript-eslint/no-explicit-any */
// Local storage utilities for persisting data
import { Project, Sprint, Task, CSATResponse, NPSResponse } from "@/types";
import { mockProjects } from "@/data/mockData";

const STORAGE_KEYS = {
  PROJECTS: 'poli_projects',
  SPRINTS: 'poli_sprints',
  TASKS: 'poli_tasks',
  CSAT_RESPONSES: 'poli_csat_responses',
  NPS_RESPONSES: 'poli_nps_responses'
};

// Projects
export const saveProjects = (projects: Project[]) => {
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
};

export const loadProjects = (): Project[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PROJECTS);
  if (stored) {
    return JSON.parse(stored);
  } else {
    // Initialize with mock data on first load
    saveProjects(mockProjects);
    return mockProjects;
  }
};

// Sprints
export const saveSprints = (sprints: Sprint[]) => {
  localStorage.setItem(STORAGE_KEYS.SPRINTS, JSON.stringify(sprints));
};

export const loadSprints = (): Sprint[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.SPRINTS);
  return stored ? JSON.parse(stored) : [];
};

// Tasks
export const saveTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
};

export const loadTasks = (): Task[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
  return stored ? JSON.parse(stored) : [];
};

// Helper functions
export const updateProjectSprints = (projectId: string, sprints: Sprint[]) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    projects[projectIndex].sprints = sprints;
    saveProjects(projects);
  }
};

export const addSprintToProject = (projectId: string, sprint: Sprint) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex !== -1) {
    if (!projects[projectIndex].sprints) {
      projects[projectIndex].sprints = [];
    }
    projects[projectIndex].sprints.push(sprint);
    saveProjects(projects);
  }
};

export const updateSprintTasks = (sprintId: string, tasks: Task[]) => {
  const sprints = loadSprints();
  const sprintIndex = sprints.findIndex(s => s.id === sprintId);
  if (sprintIndex !== -1) {
    sprints[sprintIndex].tasks = tasks;
    saveSprints(sprints);
    
    // Also update in projects
    const projects = loadProjects();
    for (const project of projects) {
      if (project.sprints) {
        const projectSprintIndex = project.sprints.findIndex(s => s.id === sprintId);
        if (projectSprintIndex !== -1) {
          project.sprints[projectSprintIndex].tasks = tasks;
          break;
        }
      }
    }
    saveProjects(projects);
  }
};

// CSAT Responses
export const saveCSATResponse = (response: CSATResponse) => {
  const responses = loadCSATResponses();
  responses.push(response);
  localStorage.setItem(STORAGE_KEYS.CSAT_RESPONSES, JSON.stringify(responses));
  
  // Also add to sprint
  const projects = loadProjects();
  for (const project of projects) {
    if (project.sprints) {
      const sprint = project.sprints.find(s => s.id === response.sprintId);
      if (sprint) {
        if (!sprint.csatResponses) sprint.csatResponses = [];
        sprint.csatResponses.push(response);
        break;
      }
    }
  }
  saveProjects(projects);
};

export const loadCSATResponses = (): CSATResponse[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CSAT_RESPONSES);
  return stored ? JSON.parse(stored) : [];
};

// NPS Responses
export const saveNPSResponse = (response: NPSResponse) => {
  const responses = loadNPSResponses();
  responses.push(response);
  localStorage.setItem(STORAGE_KEYS.NPS_RESPONSES, JSON.stringify(responses));
  
  // Also update project NPS
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === response.projectId);
  if (projectIndex !== -1) {
    projects[projectIndex].npsScore = response.npsScore;
    saveProjects(projects);
  }
};

export const loadNPSResponses = (): NPSResponse[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.NPS_RESPONSES);
  return stored ? JSON.parse(stored) : [];
};

// Update project status and freeze state
export const updateProjectStatus = (projectId: string, status?: string) => {
  const projects = loadProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) {
    throw new Error(`Projeto não encontrado: ${projectId}`);
  }
    if (status) {
      projects[projectIndex].status = status as any;
    }
    saveProjects(projects);
    return projects[projectIndex];
};