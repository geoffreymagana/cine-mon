'use client';

import * as React from 'react';
import { Inbox, MessageSquare, Lightbulb, Bug, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Feedback } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const feedbackTypeIcons: Record<string, React.ElementType> = {
    suggestion: Lightbulb,
    bug: Bug,
    general: MessageSquare
};

export default function FeedbackDashboard() {
    const [feedback, setFeedback] = React.useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { toast } = useToast();

    React.useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const feedbackQuery = query(collection(db, "feedback"), orderBy("submittedAt", "desc"));
                const querySnapshot = await getDocs(feedbackQuery);
                const feedbackData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        submittedAt: new Date(data.submittedAt).toISOString()
                    } as Feedback;
                });
                setFeedback(feedbackData);
            } catch (error) {
                console.error("Failed to load feedback from Firestore:", error);
                toast({
                    title: "Error Loading Feedback",
                    description: "Could not retrieve feedback from the database. Make sure your Firestore security rules are configured correctly.",
                    variant: "destructive"
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, [toast]);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Feedback Submissions</CardTitle>
                <CardDescription>Messages from users are stored in Firestore and displayed here.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : feedback.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[150px]">Type</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="text-right w-[180px]">Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feedback.map((item) => {
                                const Icon = feedbackTypeIcons[item.feedbackType] || MessageSquare;
                                return (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize flex items-center gap-2">
                                                <Icon className="h-3 w-3" />
                                                {item.feedbackType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">{item.message}</TableCell>
                                        <TableCell className="text-right text-muted-foreground">
                                            {formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true })}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg">
                        <Inbox className="w-16 h-16 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold">Inbox is Empty</h3>
                        <p className="text-muted-foreground mt-1">No feedback has been submitted yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
