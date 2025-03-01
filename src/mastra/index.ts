import { Mastra } from '@mastra/core/mastra';
import { createLogger } from '@mastra/core/logger';
import { coScientistReflectionAgent } from './agents/coScientistReflectionAgent';
import { coScientistEvolutionFeasibilityAgent } from './agents/coScientistEvolutionFeasibilityAgent';
import { coScientistEvolutionOOTBAgent } from './agents/coScientistEvolutionOOTBAgent';
import { coScientistGenerationAgentAfterLiteratureReview } from './agents/coScientistGenerationAgentAfterLiteratureReview';
import { coScientistGenerationAgentAfterScientificDebate } from './agents/coScientistGenerationAgentAfterScientificDebate';
import { coScientistMetaReviewAgent } from './agents/coScientistMetaReviewAgent';
import { coScientistRankingAgent } from './agents/coScientistRankingAgent';
import { coScientistRankingSimAgent } from './agents/coScientistRankingSimAgent';
import { coScientistWorkflow } from './workflows/coScientistWorkflow';
import { coScientistSupervisorAgent } from './agents/coScientistSupervisorAgent';
import { coScientistWorkerAgent } from './agents/coScientistWorkerAgent';

export const mastra = new Mastra({
  agents: {
    coScientistReflectionAgent,
    coScientistEvolutionFeasibilityAgent,
    coScientistEvolutionOOTBAgent,
    coScientistGenerationAgentAfterLiteratureReview,
    coScientistGenerationAgentAfterScientificDebate,
    coScientistMetaReviewAgent,
    coScientistRankingAgent,
    coScientistRankingSimAgent,
    coScientistSupervisorAgent,
    coScientistWorkerAgent,
  },
  logger: createLogger({
    name: 'Mastra',
    level: 'info',
  }),
  workflows: {
    coScientistWorkflow
  },
});
