'use server';

/**
 * @fileOverview Extracts job details from a job description URL using AI.
 *
 * - extractJobDetails - A function that extracts the company, role, and location from a job description URL.
 * - ExtractJobDetailsInput - The input type for the extractJobDetails function.
 * - ExtractJobDetailsOutput - The return type for the extractJobDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractJobDetailsInputSchema = z.object({
  jobDescriptionUrl: z
    .string()
    .url()
    .describe('The URL of the job description to extract details from.'),
});
export type ExtractJobDetailsInput = z.infer<typeof ExtractJobDetailsInputSchema>;

const ExtractJobDetailsOutputSchema = z.object({
  company: z
    .string()
    .describe('The extracted company name from the job description.')
    .optional(),
  role: z
    .string()
    .describe('The extracted role or job title from the job description.')
    .optional(),
  location: z
    .string()
    .describe('The extracted location from the job description. If the job is remote, the value should be "Remote".')
    .optional(),
});
export type ExtractJobDetailsOutput = z.infer<typeof ExtractJobDetailsOutputSchema>;

export async function extractJobDetails(input: ExtractJobDetailsInput): Promise<ExtractJobDetailsOutput> {
  return extractJobDetailsFlow(input);
}

const extractJobDetailsPrompt = ai.definePrompt({
  name: 'extractJobDetailsPrompt',
  input: {schema: ExtractJobDetailsInputSchema},
  output: {schema: ExtractJobDetailsOutputSchema},
  prompt: `You are an AI assistant that extracts job details from a job description URL.

  Analyze the job description at the provided URL and extract the following information:
  - Company Name
  - Role / Job Title
  - Location

  If the job is remote, the location should be "Remote".
  If you cannot determine a piece of information, leave that field blank.
  
  Job Description URL: {{{jobDescriptionUrl}}}`,
});

const extractJobDetailsFlow = ai.defineFlow(
  {
    name: 'extractJobDetailsFlow',
    inputSchema: ExtractJobDetailsInputSchema,
    outputSchema: ExtractJobDetailsOutputSchema,
  },
  async input => {
    const {output} = await extractJobDetailsPrompt(input);
    return output!;
  }
);
