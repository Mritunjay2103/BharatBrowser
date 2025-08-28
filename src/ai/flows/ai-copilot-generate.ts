'use server';
/**
 * @fileOverview Generates a response from a prompt using an AI model.
 *
 * - aiCopilotGenerate - A function that generates a response from a prompt.
 * - AICopilotGenerateInput - The input type for the aiCopilotGenerate function.
 * - AICopilotGenerateOutput - The return type for the aiCopilotGenerate function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AICopilotGenerateInputSchema = z.object({
  prompt: z.string().describe('The prompt to generate a response from.'),
});
export type AICopilotGenerateInput = z.infer<typeof AICopilotGenerateInputSchema>;

const AICopilotGenerateOutputSchema = z.object({
  response: z.string().describe('The generated response.'),
});
export type AICopilotGenerateOutput = z.infer<typeof AICopilotGenerateOutputSchema>;

export async function aiCopilotGenerate(input: AICopilotGenerateInput): Promise<AICopilotGenerateOutput> {
  return aiCopilotGenerateFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiCopilotGeneratePrompt',
  input: {schema: AICopilotGenerateInputSchema},
  output: {schema: AICopilotGenerateOutputSchema},
  prompt: `Generate a response from the following prompt: {{{prompt}}}`,
});

const aiCopilotGenerateFlow = ai.defineFlow(
  {
    name: 'aiCopilotGenerateFlow',
    inputSchema: AICopilotGenerateInputSchema,
    outputSchema: AICopilotGenerateOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
