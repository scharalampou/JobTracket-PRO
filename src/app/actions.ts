'use server';

import { extractLocation } from '@/ai/flows/extract-location-from-job-description';

export async function scanJobUrlForLocation(url: string): Promise<{ location?: string; error?: string }> {
  if (!url || !url.startsWith('http')) {
    return { error: 'Please provide a valid URL.' };
  }

  try {
    const result = await extractLocation({ jobDescriptionUrl: url });
    if (result.location) {
      return { location: result.location };
    }
    return { error: 'Could not automatically determine location.' };
  } catch (e) {
    console.error(e);
    return { error: 'An error occurred while scanning the job description.' };
  }
}
