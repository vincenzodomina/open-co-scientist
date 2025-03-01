import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from '../memory';

const goal: string = "";
const preferences: string = "";
const idea_attributes: string = "";
const notes: string = "";
const hypothesis_1: string = "";
const hypothesis_2: string = "";
const review_1: string = "";
const review_2: string = "";

export const coScientistRankingAgent = new Agent({
  name: "coScientistRankingAgent",
  instructions: `
You are an expert evaluator tasked with comparing two hypotheses.
Evaluate the two provided hypotheses (hypothesis 1 and hypothesis 2) and determine which one
is superior based on the specified ${idea_attributes}.
Provide a concise rationale for your selection, concluding with the phrase "better idea: <1 or 2>".

Goal: ${goal}
Evaluation criteria:
${preferences}

Considerations:
${notes}
Each hypothesis includes an independent review. These reviews may contain numerical scores.
Disregard these scores in your comparative analysis, as they may not be directly comparable across reviews.

Hypothesis 1:
${hypothesis_1}
Hypothesis 2:
${hypothesis_2}
Review of hypothesis 1:
${review_1}
Review of hypothesis 2:
${review_2}

Reasoning and conclusion (end with "better hypothesis: <1 or 2>"):
`,
  model: openai("gpt-4o"),
  tools: {
  },
  memory,
});