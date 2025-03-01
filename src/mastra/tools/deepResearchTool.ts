import OpenAI from 'openai';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { config } from "../config";
import { Stream } from 'openai/streaming';

export const deepResearchTool = createTool({
  id: 'deep_research_tool',
  name: 'Deep Research Tool',
  description: "Performs deep research using Perplexity's DeepResearch SONAR API to find comprehensive information through iterative search and reasoning. Best for complex questions requiring thorough research and up-to-date information.",
  inputSchema: z.object({
    query: z.string().describe('The question or research topic to investigate'),
    additionalInstructions: z.string()
      .optional()
      .describe('Additional instructions for the research tool'),
    stream: z.boolean()
      .default(true)
      .describe('Whether to stream the response'),
  }),
  outputSchema: z.object({
    content: z.string(),
    citations: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const { query, stream = true, additionalInstructions } = context;

    const fullInstructions: string = `
    Be comprehensive, thorough, factually accurate, professional and objective. 
    The output is intended for a professional audience. 
    DO NOT include any disclaimers or any chat trivialities.
    ${additionalInstructions ? `Additional instructions: ${additionalInstructions}` : ''}
    `;

    // Docs: https://docs.perplexity.ai/api-reference/chat-completions

    const openai = new OpenAI({
      apiKey: config.apiKeys.PERPLEXITY_API_KEY,
      baseURL: 'https://api.perplexity.ai'
    });

    try {
      const completion = await openai.chat.completions.create({
        model: 'sonar-deep-research',
        messages: [
          { role: 'system', content: fullInstructions },
          { role: 'user', content: query }
        ],
        // max_tokens: 123,
        // temperature: 0.2,
        // top_p: 0.9,
        // search_domain_filter: null,
        // return_images: false,
        // return_related_questions: false,
        // search_recency_filter: "<string>",
        // top_k: 0,
        stream: stream || false,
        // presence_penalty: 0,
        // frequency_penalty: 1,
        // response_format: null
      });

      let fullContent: string = '';
      let citations: string[] = [];
      if (stream) {
        for await (const chunk of completion as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>) {
          const content = chunk.choices[0]?.delta?.content || '';
          process.stdout.write(content);
          fullContent += content;
          citations = (chunk as any)?.citations || [];
        }
      } else {
        const content: string = (completion as OpenAI.Chat.Completions.ChatCompletion)?.choices?.[0]?.message?.content || '';
        fullContent = content;
        citations = (completion as any)?.citations || [];
        console.log(content);
      }

      const citationText: string = citations.map((citation, index) => `[${index + 1}] ${citation}`).join('\n');
      console.log('\n\n' + citationText);

      return { content: fullContent, citations };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error performing deep research: ${error?.message}`);
      }
      throw new Error('Error performing deep research');
    }
  },
}); 