'use server';

import { extractJobDetails } from '@/ai/flows/extract-job-details-from-url';

export async function scanJobUrlForDetails(url: string): Promise<{ company?: string; role?: string; location?: string; error?: string }> {
  if (!url || !url.startsWith('http')) {
    return { error: 'Please provide a valid URL.' };
  }

  try {
    const result = await extractJobDetails({ jobDescriptionUrl: url });
    if (result.company || result.role || result.location) {
      return result;
    }
    return { error: 'Could not automatically determine job details.' };
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while scanning the job description.' };
  }
}
