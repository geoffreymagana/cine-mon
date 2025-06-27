
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ProfileHeader = () => {
    return (
        <div className="relative">
            <div className="h-48 w-full rounded-t-lg bg-muted overflow-hidden">
                <Image
                    src="https://placehold.co/1200x400.png"
                    alt="Banner"
                    width={1200}
                    height={400}
                    className="h-full w-full object-cover"
                    data-ai-hint="abstract cinematic"
                />
            </div>
            <div className="absolute top-28 left-8">
                <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary shadow-lg">
                    <AvatarImage src="https://placehold.co/200x200.png" alt="User Avatar" data-ai-hint="person portrait" />
                    <AvatarFallback>U</AvatarFallback>
                </Avatar>
            </div>
            <div className="bg-card px-8 pb-6 pt-20 rounded-b-lg shadow-sm">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-bold font-headline">Cine-Mon User</h2>
                            <BadgeCheck className="h-7 w-7 text-primary" />
                        </div>
                        <p className="text-muted-foreground">@cinemon_user</p>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                </div>
            </div>
        </div>
    );
};
