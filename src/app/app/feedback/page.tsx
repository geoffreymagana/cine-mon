
'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

export default function FeedbackPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const feedbackType = formData.get('feedbackType') as string;
        const message = formData.get('feedback-message') as string;

        if (!feedbackType || !message) {
            toast({
                title: "Missing Information",
                description: "Please fill out all fields before submitting.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }

        try {
            const newFeedback = {
                feedbackType,
                message,
                submittedAt: new Date().toISOString(),
            };

            await addDoc(collection(db, "feedback"), newFeedback);

            toast({
                title: "Feedback Submitted!",
                description: "Thank you for your feedback. We've received your message.",
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error("Feedback submission error:", error);
            toast({
                title: "Submission Failed",
                description: "There was an error sending your feedback. Please try again later.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="flex min-h-screen flex-col items-center bg-background p-4 sm:p-8">
            <div className="w-full max-w-4xl">
                 <Link href="/app/dashboard" className="inline-flex items-center gap-2 mb-6 font-semibold text-lg hover:text-primary transition-colors">
                    <ArrowLeft className="w-5 h-5"/>
                    <span>Back to Collection</span>
                </Link>
                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-3xl font-headline">Feedback & Suggestions</CardTitle>
                            <CardDescription>Have a great idea or a bug to report? We'd love to hear from you.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div className="space-y-3">
                                <Label>What kind of feedback do you have?</Label>
                                <RadioGroup defaultValue="suggestion" name="feedbackType">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="suggestion" id="suggestion" />
                                        <Label htmlFor="suggestion">Feature Suggestion</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="bug" id="bug" />
                                        <Label htmlFor="bug">Bug Report</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="general" id="general" />
                                        <Label htmlFor="general">General Feedback</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="feedback-message">Your Message</Label>
                                <Textarea id="feedback-message" name="feedback-message" placeholder="Please be as detailed as possible..." rows={6} required disabled={isSubmitting} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2"/>
                                )}
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </div>
    );
}
