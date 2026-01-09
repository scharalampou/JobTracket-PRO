'use client';

import { useFirebase } from '@/firebase/provider';
import { signOut } from '@/firebase/auth/service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User as UserIcon, Loader2 } from 'lucide-react';

export function UserProfile() {
  const { auth, user, isUserLoading } = useFirebase();

  // Show a loading indicator while Firebase is determining the auth state.
  if (isUserLoading) {
    return <Button variant="ghost" size="icon" disabled={true} className="h-8 w-8 rounded-full"><Loader2 className="animate-spin" /></Button>;
  }

  // If there's no user, this component doesn't render anything,
  // as the sign-in button is now handled by the main page.
  if (!user) {
    return null;
  }

  // Prepare the user's initial for the avatar fallback.
  const userInitial = user.displayName ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-4 w-4" />;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut(auth)}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
