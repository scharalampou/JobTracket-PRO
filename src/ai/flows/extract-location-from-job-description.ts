'use server';

/**
 * @fileOverview Extracts the location from a job description URL using AI.
 *
 * - extractLocation - A function that extracts the location from a job description URL.
 * - ExtractLocationInput - The input type for the extractLocation function.
 * - ExtractLocationOutput - The return type for the extractLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractLocationInputSchema = z.object({
  jobDescriptionUrl: z
    .string()
    .url()
    .describe('The URL of the job description to extract the location from.'),
});
export type ExtractLocationInput = z.infer<typeof ExtractLocationInputSchema>;

const ExtractLocationOutputSchema = z.object({
  location: z
    .string()
    .describe('The extracted location from the job description.  If the job is remote, the value should be "Remote".')
    .optional(),
});
export type ExtractLocationOutput = z.infer<typeof ExtractLocationOutputSchema>;

export async function extractLocation(input: ExtractLocationInput): Promise<ExtractLocationOutput> {
  return extractLocationFlow(input);
}

const extractLocationPrompt = ai.definePrompt({
  name: 'extractLocationPrompt',
  input: {schema: ExtractLocationInputSchema},
  output: {schema: ExtractLocationOutputSchema},
  prompt: `You are an AI assistant that extracts the location from a job description URL.

  Analyze the job description at the provided URL and extract the location.
  If the job is remote, the location should be "Remote".
  If you cannot determine the location, leave the location field blank.
  
  Job Description URL: {{{jobDescriptionUrl}}}`,
});

const extractLocationFlow = ai.defineFlow(
  {
    name: 'extractLocationFlow',
    inputSchema: ExtractLocationInputSchema,
    outputSchema: ExtractLocationOutputSchema,
  },
  async input => {
    const {output} = await extractLocationPrompt(input);
    return output!;
  }
);
