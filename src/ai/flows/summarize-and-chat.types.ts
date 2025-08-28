/**
 * @fileOverview Types for the summarizeAndChat flow.
 */

import { z } from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

export const SummarizeAndChatInputSchema = z.object({
  content: z.string().describe('The text content of the webpage, limited to the first 5000 characters.'),
  question: z.string().describe('The user\'s question about the content. If the user wants a summary, this will be a prompt like "Summarize this content".'),
  history: z.array(MessageSchema).describe('The previous chat history between the user and the assistant.'),
});
export type SummarizeAndChatInput = z.infer<typeof SummarizeAndChatInputSchema>;

export const SummarizeAndChatOutputSchema = z.object({
  answer: z.string().describe('The AI\'s answer to the question or the generated summary.'),
});
export type SummarizeAndChatOutput = z.infer<typeof SummarizeAndChatOutputSchema>;

export type Message = z.infer<typeof MessageSchema>;
