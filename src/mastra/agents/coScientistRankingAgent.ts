import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from '../memory';

export const coScientistRankingAgent = new Agent({
  name: "coScientistRankingAgent",
  instructions: `
You are an expert evaluator tasked with comparing two hypotheses.
Evaluate the two provided hypotheses (hypothesis 1 and hypothesis 2) and determine which one
is superior based on the specified attributes.

Each hypothesis includes an independent review. These reviews may contain numerical scores.
Disregard these scores in your comparative analysis, as they may not be directly comparable across reviews.

Provide a concise rationale for your selection, concluding with deciding on the better hypothesis: <1 or 2>.
`,
  model: openai("gpt-4o"),
  tools: {
  },
  memory,
});