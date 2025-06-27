'use server';

/**
 * @fileOverview An AI agent that automatically tags movies based on their descriptions.
 *
 * - autoTagMovies - A function that handles the movie tagging process.
 * - AutoTagMoviesInput - The input type for the autoTagMovies function.
 * - AutoTagMoviesOutput - The return type for the autoTagMovies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoTagMoviesInputSchema = z.object({
  description: z.string().describe('The description of the movie.'),
});
export type AutoTagMoviesInput = z.infer<typeof AutoTagMoviesInputSchema>;

const AutoTagMoviesOutputSchema = z.object({
  tags: z.array(z.string()).describe('An array of tags for the movie.'),
});
export type AutoTagMoviesOutput = z.infer<typeof AutoTagMoviesOutputSchema>;

export async function autoTagMovies(input: AutoTagMoviesInput): Promise<AutoTagMoviesOutput> {
  return autoTagMoviesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoTagMoviesPrompt',
  input: {schema: AutoTagMoviesInputSchema},
  output: {schema: AutoTagMoviesOutputSchema},
  prompt: `You are an expert movie tagger. You will be provided a movie description and you will create tags to best categorize the movie.

Description: {{{description}}}

Tags:`,
});

const autoTagMoviesFlow = ai.defineFlow(
  {
    name: 'autoTagMoviesFlow',
    inputSchema: AutoTagMoviesInputSchema,
    outputSchema: AutoTagMoviesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
