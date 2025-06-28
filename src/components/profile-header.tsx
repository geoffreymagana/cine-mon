"use client"

import * as React from 'react';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BadgeCheck, Camera, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export const ProfileHeader = () => {
    const { toast } = useToast();
    const [avatarUrl, setAvatarUrl] = React.useState("https://placehold.co/200x200.png");
    const [bannerUrl, setBannerUrl] = React.useState("https://placehold.co/1200x400.png");
    
    const avatarInputRef = React.useRef<HTMLInputElement>(null);
    const bannerInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        try {
            const storedAvatar = localStorage.getItem('profileAvatar');
            if (storedAvatar) setAvatarUrl(storedAvatar);

            const storedBanner = localStorage.getItem('profileBanner');
            if (storedBanner) setBannerUrl(storedBanner);
        } catch (error) {
            console.error("Failed to access localStorage:", error);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                try {
                    if (type === 'avatar') {
                        setAvatarUrl(result);
                        localStorage.setItem('profileAvatar', result);
                        toast({ title: "Avatar updated!" });
                    } else {
                        setBannerUrl(result);
                        localStorage.setItem('profileBanner', result);
                        toast({ title: "Banner updated!" });
                    }
                } catch (error) {
                    console.error("Failed to save to localStorage:", error);
                    toast({ title: "Error", description: "Could not save image.", variant: "destructive" });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative">
            <input type="file" ref={bannerInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'banner')} />
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />

            <div className="h-48 w-full rounded-t-lg bg-muted overflow-hidden relative group">
                <Image
                    src={bannerUrl}
                    alt="Banner"
                    width={1200}
                    height={400}
                    className="h-full w-full object-cover"
                    data-ai-hint="abstract cinematic"
                />
                <Button 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => bannerInputRef.current?.click()}
                >
                    <Edit className="mr-2"/>
                    Edit Banner
                </Button>
            </div>
            <div className="absolute top-28 left-8">
                <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary shadow-lg">
                        <AvatarImage src={avatarUrl} alt="User Avatar" data-ai-hint="person portrait" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <button 
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => avatarInputRef.current?.click()}
                    >
                        <Camera className="h-8 w-8" />
                    </button>
                </div>
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
                    <Button variant="outline" size="icon">
                        <Edit className="h-5 w-5"/>
                        <span className="sr-only">Edit Profile</span>
                    </Button>
                </div>
            </div>
        </div>
    );
};
