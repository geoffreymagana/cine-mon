'use server';

/**
 * @fileOverview A flow to handle user feedback submission.
 * - submitFeedback - A function that handles the feedback submission process.
 * - SubmitFeedbackInput - The input type for the submitFeedback function.
 * - SubmitFeedbackOutput - The return type for the submitFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const SubmitFeedbackInputSchema = z.object({
  feedbackType: z.string().describe('The type of feedback (e.g., suggestion, bug).'),
  message: z.string().describe('The user-submitted feedback message.'),
});
export type SubmitFeedbackInput = z.infer<typeof SubmitFeedbackInputSchema>;

export const SubmitFeedbackOutputSchema = z.object({
  confirmation: z.string().describe('A confirmation message for the user.'),
});
export type SubmitFeedbackOutput = z.infer<typeof SubmitFeedbackOutputSchema>;

export async function submitFeedback(input: SubmitFeedbackInput): Promise<SubmitFeedbackOutput> {
  return submitFeedbackFlow(input);
}

const submitFeedbackFlow = ai.defineFlow(
  {
    name: 'submitFeedbackFlow',
    inputSchema: SubmitFeedbackInputSchema,
    outputSchema: SubmitFeedbackOutputSchema,
  },
  async (input) => {
    // In a real application, you might send an email, save to a database,
    // or create a ticket in a project management tool.
    // For this prototype, the flow execution itself is the destination.
    console.log('New feedback received:', input);
    
    return {
      confirmation: `Your ${input.feedbackType} has been received. Thank you!`,
    };
  }
);
