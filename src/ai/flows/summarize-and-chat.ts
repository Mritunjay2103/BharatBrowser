'use server';
/**
 * @fileOverview A flow for summarizing webpage content and answering questions about it.
 * 
 * - summarizeAndChat: A function that can either summarize content or answer a question based on it.
 */

import { ai } from '@/ai/genkit';
import { SummarizeAndChatInput, SummarizeAndChatInputSchema, SummarizeAndChatOutput, SummarizeAndChatOutputSchema } from './summarize-and-chat.types';

const summarizeAndChatPrompt = ai.definePrompt({
    name: 'summarizeAndChatPrompt',
    input: { schema: SummarizeAndChatInputSchema },
    output: { schema: SummarizeAndChatOutputSchema },
    prompt: `You are an AI assistant integrated into a web browser. Your task is to help users understand the content of the webpage they are currently viewing.

You will be given the text content of the page and a user's question.

If the user asks for a summary, provide a concise, bullet-point summary of the provided text.

If the user asks a specific question, answer it based on the provided text content. Use the chat history to understand the context of the conversation.

Webpage Content:
---
{{{content}}}
---

Chat History:
---
{{#each history}}
**{{role}}**: {{content}}
{{/each}}
---

User Question:
"{{{question}}}"

Based on the content and history, provide your response.
`,
  });
  

const summarizeAndChatFlow = ai.defineFlow(
  {
    name: 'summarizeAndChatFlow',
    inputSchema: SummarizeAndChatInputSchema,
    outputSchema: SummarizeAndChatOutputSchema,
  },
  async (input) => {
    const { output } = await summarizeAndChatPrompt(input);
    return output!;
  }
);

export async function summarizeAndChat(input: SummarizeAndChatInput): Promise<SummarizeAndChatOutput> {
  return summarizeAndChatFlow(input);
}
