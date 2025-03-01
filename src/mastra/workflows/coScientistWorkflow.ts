import { Workflow, Step } from '@mastra/core/workflows';
import { z } from 'zod';
import { createLogger } from '@mastra/core/logger';
import { coScientistEvolutionFeasibilityAgent } from '../agents/coScientistEvolutionFeasibilityAgent';
import { coScientistEvolutionOOTBAgent } from '../agents/coScientistEvolutionOOTBAgent';
import { coScientistGenerationAgentAfterLiteratureReview } from '../agents/coScientistGenerationAgentAfterLiteratureReview';
import { coScientistGenerationAgentAfterScientificDebate } from '../agents/coScientistGenerationAgentAfterScientificDebate';
import { coScientistMetaReviewAgent } from '../agents/coScientistMetaReviewAgent';
import { coScientistRankingAgent } from '../agents/coScientistRankingAgent';
import { coScientistRankingSimAgent } from '../agents/coScientistRankingSimAgent';
import { coScientistReflectionAgent } from '../agents/coScientistReflectionAgent';
import { coScientistSupervisorAgent } from '../agents/coScientistSupervisorAgent';
import { deepResearchTool } from '../tools/deepResearchTool';
import { coScientistWorkerAgent } from '../agents/coScientistWorkerAgent';

// Create logger for the workflow
const logger = createLogger({
  name: 'coScientistWorkflow'
});

// More specific schema definitions
const hypothesisSchema = z.object({
  title: z.string(),
  description: z.string(),
  evidence: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  testability: z.number().min(0).max(1),
  novelty: z.number().min(0).max(1)
});

const researchGoalSchema = z.object({
  goal: z.string(),
  preferences: z.any()
});

const researchPlanSchema = z.object({
  researchPlan: z.any()
});

const hypothesesSchema = z.object({
  hypotheses: z.array(hypothesisSchema)
});

const reviewSchema = z.object({
  review: z.string(),
  score: z.number()
});

const rankingSchema = z.object({
  betterIdea: z.string()
});

const evolutionSchema = z.object({
  evolvedHypothesis: z.any()
});

const metaReviewSchema = z.object({
  metaReview: z.string()
});

const reportSchema = z.object({
  report: z.string()
});

const supervisorAgentOutputSchema = z.object({
  researchPlan: z.any()
});

// 1. Define each step individually with proper schemas
const initializeResearchGoalStep = new Step({
  id: 'initializeResearchGoal',
  name: 'Initialize Research Goal',
  description: 'Parse the research goal and create a research plan configuration',
  inputSchema: researchGoalSchema,
  outputSchema: researchPlanSchema,
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;

    logger.info('Initializing research goal', { goal });

    try {
      const result = await coScientistSupervisorAgent.generate(`Goal: ${goal}\n\n Preferences: ${JSON.stringify(preferences)}`, {
        output: supervisorAgentOutputSchema,
      });

      logger.info('Research goal initialized', {
        planSize: JSON.stringify((result as any)?.object?.researchPlan).length
      });

      return {
        researchPlan: (result as any)?.object?.researchPlan
      };
    } catch (error: any) {
      logger.error('Failed to initialize research goal', { error });
      throw new Error(`Failed to initialize research goal: ${error.message}`);
    }
  }
});

const enhancedLiteratureReviewStep = new Step({
  id: 'enhancedLiteratureReview',
  name: 'Enhanced Literature Review',
  description: 'Perform semantic search on scientific literature for relevant context',
  outputSchema: z.object({
    relevantLiterature: z.array(z.object({
      content: z.string(),
      source: z.string(),
      relevanceScore: z.number()
    }))
  }),
  execute: async ({ context }) => {
    const { goal } = context.triggerData;

    logger.info('Performing enhanced literature review', { goal });

    try {
      const deepResearchResults = await deepResearchTool.execute!({
        query: goal,
        stream: false,
        saveRawContent: false,
      } as any);

      // Format the results to match the expected schema
      const relevantLiterature = [{
        content: deepResearchResults.content,
        source: "Deep Research Tool",
        relevanceScore: 1.0
      }];

      logger.info('Literature review completed', {
        resultCount: relevantLiterature.length
      });

      return {
        relevantLiterature
      };
    } catch (error: any) {
      logger.error('Failed to perform literature review', { error });
      throw new Error(`Failed to perform literature review: ${error.message}`);
    }
  }
});

const generateInitialHypothesesStep = new Step({
  id: 'generateInitialHypotheses',
  name: 'Generate Initial Hypotheses',
  description: 'Generate initial hypotheses based on literature review',
  outputSchema: hypothesesSchema,
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { researchPlan } = context.steps.initializeResearchGoal as any;
    const { relevantLiterature } = context.steps.enhancedLiteratureReview as any;

    logger.info('Generating initial hypotheses', { goal });

    try {
      // Format literature for the agent
      const literatureContext = relevantLiterature
        .map((lit: any) => `Source: ${lit.source}\nContent: ${lit.content}`)
        .join('\n\n');

      const result = await coScientistGenerationAgentAfterLiteratureReview.generate(`
        Goal: ${goal}
        Preferences: ${JSON.stringify(preferences)}
        Research Plan: ${JSON.stringify(researchPlan)}
        Source Hypothesis: 
        Articles with Reasoning: ${literatureContext}`
      );

      logger.info('Generated initial hypotheses', {
        count: (result as any)?.object?.length
      });

      return {
        hypotheses: (result as any).object
      };
    } catch (error: any) {
      logger.error('Failed to generate hypotheses', { error });
      throw new Error(`Failed to generate initial hypotheses: ${error.message}`);
    }
  }
});

const reflectionAndReviewStep = new Step({
  id: 'reflectionAndReview',
  name: 'Reflection and Review',
  description: 'Evaluate the correctness, quality, and novelty of the hypotheses',
  outputSchema: z.object({
    reviewedHypotheses: z.array(z.object({
      hypothesis: z.any(),
      review: z.string(),
      score: z.number()
    }))
  }),
  execute: async ({ context }) => {
    const { hypotheses } = context.steps.generateInitialHypotheses as any;

    logger.info('Starting reflection and review', {
      hypothesisCount: hypotheses.length
    });

    try {
      // Process hypotheses in parallel for better performance
      const reviewPromises = hypotheses.map(async (hypothesis: any) => {
        const result = await coScientistReflectionAgent.generate(`
          Hypothesis: ${JSON.stringify(hypothesis)}
          Article: 
          `);

        return {
          hypothesis,
          review: (result as any).object.review,
          score: (result as any).object.score
        };
      });

      const reviewedHypotheses = await Promise.all(reviewPromises);

      logger.info('Completed reflection and review', {
        reviewCount: reviewedHypotheses.length
      });

      return {
        reviewedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during reflection and review', { error });
      throw new Error(`Failed during reflection and review: ${error.message}`);
    }
  }
});

const rankHypothesesStep = new Step({
  id: 'rankHypotheses',
  name: 'Rank Hypotheses',
  description: 'Rank hypotheses using tournament-style comparisons',
  outputSchema: z.object({
    rankedHypotheses: z.array(z.object({
      hypothesis: z.any(),
      review: z.string(),
      score: z.number()
    }))
  }),
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { reviewedHypotheses } = context.steps.reflectionAndReview as any;

    logger.info('Starting hypothesis ranking', {
      hypothesisCount: reviewedHypotheses.length
    });

    try {
      // Organize tournament matches between hypotheses
      const rankedHypotheses: any[] = [];
      const matches: any[] = [];

      // Create pairwise matches
      for (let i = 0; i < reviewedHypotheses.length; i++) {
        for (let j = i + 1; j < reviewedHypotheses.length; j++) {
          matches.push({
            hypothesis1: reviewedHypotheses[i],
            hypothesis2: reviewedHypotheses[j]
          });
        }
      }

      logger.info('Created tournament matches', { matchCount: matches.length });

      // Process matches in parallel for better performance
      const matchPromises = matches.map(async (match) => {
        const result = await coScientistRankingSimAgent.generate(`
          Goal: ${goal}
          Preferences: ${JSON.stringify(preferences)}
          Notes: 
          
          Hypothesis 1: ${JSON.stringify(match.hypothesis1.hypothesis)}
          Review 1: ${match.hypothesis1.review}
          
          Hypothesis 2: ${JSON.stringify(match.hypothesis2.hypothesis)}
          Review 2: ${match.hypothesis2.review}`,
        );

        return {
          match,
          winner: (result as any).object.betterIdea === "1" ? match.hypothesis1 : match.hypothesis2
        };
      });

      const results = await Promise.all(matchPromises);

      // Compile rankings based on match results
      for (const result of results) {
        if (!rankedHypotheses.some(h => JSON.stringify(h) === JSON.stringify(result.winner))) {
          rankedHypotheses.push(result.winner);
        }
      }

      logger.info('Completed hypothesis ranking', {
        rankedCount: rankedHypotheses.length
      });

      return {
        rankedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during hypothesis ranking', { error });
      throw new Error(`Failed during hypothesis ranking: ${error.message}`);
    }
  }
});

const evolveTopHypothesesStep = new Step({
  id: 'evolveTopHypotheses',
  name: 'Evolve Top Hypotheses',
  description: 'Improve the top-rated hypotheses using various strategies',
  outputSchema: z.object({
    evolvedHypotheses: z.array(z.object({
      originalHypothesis: z.any(),
      feasibilityEvolution: z.any(),
      ootbEvolution: z.any()
    }))
  }),
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { rankedHypotheses } = context.steps.rankHypotheses as any;

    // Take top 2-3 hypotheses for evolution
    const topHypotheses = rankedHypotheses.slice(0, Math.min(3, rankedHypotheses.length));

    logger.info('Starting hypothesis evolution', {
      topHypothesisCount: topHypotheses.length
    });

    try {
      // Process evolutions in parallel
      const evolutionPromises = topHypotheses.map(async (hyp: any) => {
        // Run both evolution strategies in parallel
        const [feasibilityResult, ootbResult] = await Promise.all([
          coScientistEvolutionFeasibilityAgent.generate(`
            Goal: ${goal}
            Preferences: ${JSON.stringify(preferences)}
            Hypothesis: ${JSON.stringify(hyp.hypothesis)}`,
          ),
          coScientistEvolutionOOTBAgent.generate(`
            Goal: ${goal}
            Preferences: ${JSON.stringify(preferences)}
            Hypothesis: ${JSON.stringify(hyp.hypothesis)}`,
          )
        ]);

        return {
          originalHypothesis: hyp.hypothesis,
          feasibilityEvolution: (feasibilityResult as any).object.evolvedHypothesis,
          ootbEvolution: (ootbResult as any).object.evolvedHypothesis
        };
      });

      const evolvedHypotheses = await Promise.all(evolutionPromises);

      logger.info('Completed hypothesis evolution', {
        evolvedCount: evolvedHypotheses.length
      });

      return {
        evolvedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during hypothesis evolution', { error });
      throw new Error(`Failed during hypothesis evolution: ${error.message}`);
    }
  }
});

const scientificDebateStep = new Step({
  id: 'scientificDebate',
  name: 'Scientific Debate',
  description: 'Conduct simulated scientific debates to further refine hypotheses',
  outputSchema: z.object({
    debatedHypotheses: z.array(z.any())
  }),
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { evolvedHypotheses } = context.steps.evolveTopHypotheses as any;

    logger.info('Starting scientific debate', {
      hypothesisCount: evolvedHypotheses.length
    });

    try {
      // Process debates in parallel
      const debatePromises = evolvedHypotheses.map(async (evolved: any) => {
        // Combine original and evolved versions for debate
        const hypothesisVariants = [
          evolved.originalHypothesis,
          evolved.feasibilityEvolution,
          evolved.ootbEvolution
        ];

        const result = await coScientistGenerationAgentAfterScientificDebate.generate(`
          Goal: ${goal}
          Preferences: ${JSON.stringify(preferences)}
          Idea Attributes: novel, testable, and scientifically sound
          Reviews Overview: 
          
          Initial hypotheses for debate:
          ${hypothesisVariants.map(h => JSON.stringify(h)).join('\n\n')}`,
        );

        return (result as any).object.finalHypothesis;
      });

      const debatedHypotheses = await Promise.all(debatePromises);

      logger.info('Completed scientific debate', {
        debatedCount: debatedHypotheses.length
      });

      return {
        debatedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during scientific debate', { error });
      throw new Error(`Failed during scientific debate: ${error.message}`);
    }
  }
});

const metaReviewStep = new Step({
  id: 'metaReview',
  name: 'Meta-Review',
  description: 'Analyze patterns in reviews and debates to provide meta-feedback',
  outputSchema: z.object({
    metaReview: z.string(),
    finalHypotheses: z.array(z.any())
  }),
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { reviewedHypotheses } = context.steps.reflectionAndReview as any;
    const { debatedHypotheses } = context.steps.scientificDebate as any;

    logger.info('Starting meta-review', {
      reviewCount: reviewedHypotheses.length,
      debatedCount: debatedHypotheses.length
    });

    try {
      // Compile all reviews for meta-analysis
      const allReviews = reviewedHypotheses.map((h: any) => h.review).join('\n\n');

      const result = await coScientistMetaReviewAgent.generate(`
        Goal: ${goal}
        Preferences: ${JSON.stringify(preferences)}
        Reviews:
        ${allReviews}`
      );

      logger.info('Completed meta-review');

      return {
        metaReview: (result as any).object.metaReview,
        finalHypotheses: debatedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during meta-review', { error });
      throw new Error(`Failed during meta-review: ${error.message}`);
    }
  }
});

// Add a condition to determine if additional research is needed
const needsAdditionalResearchCondition = (context: any) => {
  const { metaReview } = context.steps.metaReview;
  // Check if the meta review score or content suggests more research is needed
  return metaReview.includes('additional research') || metaReview.includes('insufficient evidence');
};

const additionalResearchStep = new Step({
  id: 'additionalResearch',
  name: 'Additional Research',
  description: 'Conduct additional research when initial hypotheses are insufficient',
  outputSchema: z.object({
    additionalFindings: z.string(),
    enhancedHypotheses: z.array(z.any())
  }),
  execute: async ({ context }) => {
    const { goal } = context.triggerData;
    const { finalHypotheses, metaReview } = context.steps.metaReview as any;

    logger.info('Starting additional research', {
      reason: metaReview.includes('additional research') ? 'additional research needed' : 'insufficient evidence'
    });

    try {
      const deepResearchResults = await deepResearchTool.execute!({
        query: goal,
        stream: false,
        saveRawContent: false,
      } as any);

      const literatureContext: string = deepResearchResults.content + deepResearchResults.citations.map((citation: any, index: number) => `\n\n[${index + 1}] ${citation}`).join('\n\n');

      // Process each hypothesis with additional research
      const enhancementPromises = finalHypotheses.map(async (hypothesis: any) => {
        const result = await coScientistWorkerAgent.generate(`
          Enhance this scientific hypothesis with additional research:
          
          Hypothesis: ${JSON.stringify(hypothesis)}
          
          Additional Literature:
          ${literatureContext}
          
          Please provide an enhanced version of the hypothesis with stronger evidence and clearer testability.`,
        );

        return (result as any).object.enhancedHypothesis;
      });

      const enhancedHypotheses = await Promise.all(enhancementPromises);

      logger.info('Completed additional research', {
        enhancedCount: enhancedHypotheses.length
      });

      return {
        additionalFindings: `Additional research was conducted based on the meta-review suggestion: "${metaReview}"`,
        enhancedHypotheses
      };
    } catch (error: any) {
      logger.error('Failed during additional research', { error });
      throw new Error(`Failed during additional research: ${error.message}`);
    }
  }
});

const generateFinalReportStep = new Step({
  id: 'generateFinalReport',
  name: 'Generate Final Report',
  description: 'Compile the final research report with top hypotheses',
  outputSchema: z.object({
    finalReport: z.string()
  }),
  execute: async ({ context }) => {
    const { goal, preferences } = context.triggerData;
    const { metaReview, additionalResearch } = context.steps;

    // Check if additional research was performed
    const additionalResearchPerformed = context.steps.additionalResearch !== undefined;
    const hypotheses = additionalResearchPerformed
      ? (context.steps.additionalResearch as any).enhancedHypotheses
      : (context.steps.metaReview as any).finalHypotheses;

    logger.info('Generating final report', {
      hypothesisCount: hypotheses.length,
      additionalResearchPerformed
    });

    try {
      // Include additional research findings if available
      const additionalFindings = additionalResearchPerformed
        ? `\n\nAdditional Research Findings: ${context.steps.additionalResearch as any}.additionalFindings}`
        : '';

      const result = await coScientistWorkerAgent.generate(
        `Generate a comprehensive research report for the goal: ${goal}
        
        Include the following sections:
        1. Executive Summary
        2. Research Goal and Context
        3. Methodology
        4. Top Hypotheses (include the following hypotheses: ${hypotheses?.map((h: any) => JSON.stringify(h)).join('\n\n')})
        5. Meta-Review Insights: ${metaReview}${additionalFindings}
        6. Recommendations for Further Research
        7. Conclusion
        
        Format the report in a professional scientific style.`
      );

      logger.info('Final report generated', {
        reportLength: (result as any).object.report.length
      });

      return {
        finalReport: (result as any).object.report
      };
    } catch (error: any) {
      logger.error('Failed to generate final report', { error });
      throw new Error(`Failed to generate final report: ${error.message}`);
    }
  }
});

// 2. Create the workflow with a proper trigger schema
export const coScientistWorkflow = new Workflow({
  name: 'co Scientist Workflow',
  // description: 'An AI co-scientist workflow that generates hypotheses through an iterative "generate, debate, evolve" approach involving specialized agents.',
  triggerSchema: z.object({
    goal: z.string(),
    preferences: z.string().optional()
  })
});

// 3. Link steps in sequence with proper flow control
coScientistWorkflow
  .step(initializeResearchGoalStep)
  .then(enhancedLiteratureReviewStep)
  .then(generateInitialHypothesesStep)
  .then(reflectionAndReviewStep)
  .then(rankHypothesesStep)
  .then(evolveTopHypothesesStep)
  .then(scientificDebateStep)
  .then(metaReviewStep)
  .then(additionalResearchStep, { when: needsAdditionalResearchCondition })
  .then(generateFinalReportStep)
  .commit();
