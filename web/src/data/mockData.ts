// Mock data for development - Poli Júnior examples

import { Project, Sprint, OKR, CSATResponse, NPSResponse } from '@/types';
import { addDays, subDays, addWeeks } from 'date-fns';

const now = new Date();

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Achei no Bairro',
    client: 'Startup Local',
    coverImage: '/api/placeholder/400/200',
    shortDescription: 'Plataforma de marketplace local para conectar vizinhos e comércios',
    startDate: subDays(now, 45),
    plannedEndDate: addDays(now, 15),
    status: 'Normal',
    price: 15000,
    isContracted: true,
    analysts: [
      { id: '1', name: 'João Silva', role: 'PM' },
      { id: '2', name: 'Maria Santos', role: 'Front' },
      { id: '3', name: 'Pedro Costa', role: 'Back' },
    ],
    delayDays: 0,
    csatCollectionRate: 85,
    averageCSAT: 4.2,
    npsScore: 9,
    isENBCandidate: true,
    isENB: false,
    sprints: [
      {
        id: '1-1',
        projectId: '1',
        number: 1,
        startDate: subDays(now, 35),
        endDate: subDays(now, 21),
        capacity: 40,
        goals: ['Implementar autenticação de usuários', 'Criar sistema de busca por localização'],
        tasks: [],
        csatResponses: []
      },
      {
        id: '1-2',
        projectId: '1',
        number: 2,
        startDate: subDays(now, 20),
        endDate: subDays(now, 6),
        capacity: 40,
        goals: ['Desenvolver interface de cadastro de estabelecimentos', 'Implementar sistema de avaliações'],
        tasks: [],
        csatResponses: []
      }
    ]
  },
  {
    id: '2', 
    name: 'Privalia Dashboard',
    client: 'Privalia Tech',
    coverImage: '/api/placeholder/400/200',
    shortDescription: 'Dashboard administrativo para gestão de e-commerce',
    startDate: subDays(now, 30),
    plannedEndDate: addDays(now, 30),
    status: 'Congelado',
    price: 25000,
    isContracted: true,
    analysts: [
      { id: '4', name: 'Ana Lima', role: 'PO' },
      { id: '5', name: 'Carlos Rocha', role: 'Front' },
      { id: '6', name: 'Julia Mendes', role: 'Back' },
      { id: '7', name: 'Rafael Teixeira', role: 'QA' },
    ],
    delayDays: 5,
    csatCollectionRate: 60,
    averageCSAT: 3.8,
    npsScore: 7,
    isENBCandidate: false,
    isENB: false,
    sprints: [
      {
        id: '2-1',
        projectId: '2',
        number: 1,
        startDate: subDays(now, 25),
        endDate: subDays(now, 11),
        capacity: 45,
        goals: ['Configurar ambiente de desenvolvimento', 'Implementar dashboard básico'],
        tasks: [],
        csatResponses: []
      }
    ]
  },
  {
    id: '3',
    name: 'Sistema de Gestão Acadêmica', 
    client: 'Universidade Federal',
    coverImage: '/api/placeholder/400/200',
    shortDescription: 'Modernização do sistema de gestão de notas e frequência',
    startDate: subDays(now, 60),
    plannedEndDate: subDays(now, 5),
    actualEndDate: subDays(now, 2),
    status: 'Possível ENB',
    price: 35000,
    isContracted: true,
    analysts: [
      { id: '8', name: 'Felipe Cardoso', role: 'PM' },
      { id: '9', name: 'Isabela Franco', role: 'Front' },
      { id: '10', name: 'Marcos Alves', role: 'Back' },
    ],
    delayDays: 0,
    csatCollectionRate: 92,
    averageCSAT: 4.6,
    npsScore: 10,
    isENBCandidate: false,
    isENB: true,
    sprints: [
      {
        id: '3-1',
        projectId: '3',
        number: 1,
        startDate: subDays(now, 55),
        endDate: subDays(now, 41),
        capacity: 50,
        goals: ['Análise de requisitos', 'Prototipação inicial'],
        tasks: [],
        csatResponses: []
      },
      {
        id: '3-2',
        projectId: '3',
        number: 2,
        startDate: subDays(now, 40),
        endDate: subDays(now, 26),
        capacity: 50,
        goals: ['Desenvolvimento do módulo de notas', 'Integração com sistema existente'],
        tasks: [],
        csatResponses: []
      },
      {
        id: '3-3',
        projectId: '3',
        number: 3,
        startDate: subDays(now, 25),
        endDate: subDays(now, 11),
        capacity: 50,
        goals: ['Testes finais', 'Documentação e treinamento'],
        tasks: [],
        csatResponses: []
      }
    ]
  }
];

export const mockOKRs: OKR[] = [
  {
    id: '1',
    objective: 'Trazer maior eficiência e qualidade para a operação, através de documentações e um planejamento adequado e aplicado',
    period: 'Q1 2024',
    createdAt: subDays(now, 30),
    updatedAt: subDays(now, 5),
    keyResults: [
      {
        id: '1',
        okrId: '1',
        name: '% de projetos documentados',
        measurementMethod: 'Projetos com execução pós DS; atualizar a cada mês/entrada de novos projetos',
        baseline: 0,
        currentValue: 80,
        target: 90,
        achievementPercentage: 89,
        actionPlan: 'Documentação de progressão de projeto / reviews',
        updatedAt: subDays(now, 5)
      }
    ]
  },
  {
    id: '2',
    objective: 'Capacitar o núcleo todo, formando membros com expertise em eficiência e qualidade',
    period: 'Q1 2024',
    createdAt: subDays(now, 30),
    updatedAt: subDays(now, 2),
    keyResults: [
      {
        id: '2',
        okrId: '2',
        name: 'Workshops interativos',
        measurementMethod: '1 por mês a partir de agora; workshops relacionados a código',
        baseline: 0,
        currentValue: 1,
        target: 4,
        achievementPercentage: 25,
        actionPlan: 'Estruturar workshop para PM; 1 por mês',
        updatedAt: subDays(now, 2)
      }
    ]
  }
];

export const mockCSATResponses: CSATResponse[] = [
  {
    id: '1',
    sprintId: '1-1',
    projectId: '1',
    responseDate: subDays(now, 10),
    teamCommunicationScore: 4,
    teamCommunicationFeedback: 'Equipe muito comunicativa e sempre disponível para esclarecer dúvidas.',
    qualityScore: 4,
    qualityFeedback: 'Entregas dentro do prazo e com boa qualidade técnica.',
    overallSatisfactionScore: 4,
    averageScore: 4.0,
    uniqueToken: 'csat-token-1'
  },
  {
    id: '2',
    sprintId: '2-1', 
    projectId: '2',
    responseDate: subDays(now, 15),
    teamCommunicationScore: 3,
    teamCommunicationFeedback: 'Comunicação boa, mas poderia ser mais frequente.',
    qualityScore: 4,
    qualityFeedback: 'Qualidade técnica satisfatória.',
    overallSatisfactionScore: 4,
    averageScore: 3.7,
    uniqueToken: 'csat-token-2'
  }
];

export const mockNPSResponses: NPSResponse[] = [
  {
    id: '1',
    projectId: '3',
    responseDate: subDays(now, 5),
    accordanceScore: 5,
    accordanceFeedback: 'Atenderam exatamente ao que foi acordado no processo comercial.',
    expectationsScore: 5,
    expectationsFeedback: 'Superaram nossas expectativas em varios aspectos.',
    qualityScore: 5,
    qualityFeedback: 'Qualidade excepcional das entregas.',
    missingFeatures: 'Nada significativo.',
    improvementSuggestions: 'Continuar com a mesma qualidade.',
    npsScore: 10,
    sdrNotes: 'Cliente interessado em novos projetos.',
    uniqueToken: 'nps-token-1'
  }
];

// Helper functions for data manipulation
export const getProjectsByStatus = (status: Project['status']) => {
  return mockProjects.filter(p => p.status === status);
};

export const getENBProjects = () => {
  return mockProjects.filter(p => p.isENB);
};

export const getENBCandidates = () => {
  return mockProjects.filter(p => p.isENBCandidate);
};

export const getTotalRevenue = () => {
  return mockProjects
    .filter(p => p.isContracted)
    .reduce((sum, p) => sum + (p.price || 0), 0);
};

export const getGlobalNPS = () => {
  const npsScores = mockNPSResponses.map(n => n.npsScore);
  if (npsScores.length === 0) return 0;
  
  const promoters = npsScores.filter(score => score >= 9).length;
  const detractors = npsScores.filter(score => score <= 6).length;
  const total = npsScores.length;
  
  return Math.round(((promoters - detractors) / total) * 100);
};