import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from '../memory';

const goal: string = "";
const preferences: string = "";
const instructions: string = "";
const reviews: string = "";

export const coScientistMetaReviewAgent = new Agent({
  name: "coScientistMetaReviewAgent",
  instructions: `
You are an expert in scientific research and meta-analysis.
Synthesize a comprehensive meta-review of provided reviews
pertaining to the following research goal:

Goal: ${goal}
Preferences:
${preferences}
Additional instructions:
${instructions}
Provided reviews for meta-analysis:
${reviews}

Instructions:
* Generate a structured meta-analysis report of the provided reviews.
* Focus on identifying recurring critique points and common issues raised by reviewers.
* The generated meta-analysis should provide actionable insights for researchers
developing future proposals.
* Refrain from evaluating individual proposals or reviews;
focus on producing a synthesized meta-analysis.

Response:
`,
  model: openai("gpt-4o"),
  tools: {
  },
  memory,
});