import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { memory } from '../memory';

const goal: string = "";
const preferences: string = "";
const instructions: string = "";
const source_hypothesis: string = "";
const articles_with_reasoning: string = "";

export const coScientistGenerationAgentAfterLiteratureReview = new Agent({
  name: "coScientistGenerationAgentAfterLiteratureReview",
  instructions: `
You are an expert tasked with formulating a novel and robust hypothesis to address
the following objective.
Describe the proposed hypothesis in detail, including specific entities, mechanisms,
and anticipated outcomes.
This description is intended for an audience of domain experts.
You have conducted a thorough review of relevant literature and developed a logical framework
for addressing the objective. The articles consulted, along with your analytical reasoning,
are provided below.
Goal: ${goal}
Criteria for a strong hypothesis:
${preferences}
Existing hypothesis (if applicable):
${source_hypothesis}
${instructions}
Literature review and analytical rationale (chronologically ordered, beginning
with the most recent analysis):
${articles_with_reasoning}
Proposed hypothesis (detailed description for domain experts):
`,
  model: openai("gpt-4o"),
  tools: {
  },
  memory,
});