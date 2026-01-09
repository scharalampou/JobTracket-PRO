
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FirebaseError } from 'firebase/app';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebase } from '@/firebase';
import {
  signUpWithEmailPassword,
  signInWithEmailPassword,
} from '@/firebase/auth/service';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type AuthError = {
  code: string;
  message: string;
} | null;

export function EmailPasswordForm() {
  const [activeTab, setActiveTab] = React.useState('sign-in');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<AuthError>(null);
  const { auth, firestore } = useFirebase();
  const { toast } = useToast();

  const signInForm = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });

  const signUpForm = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  const handleError = (e: any) => {
    setIsLoading(false);
    if (e instanceof FirebaseError) {
      console.error('Authentication Error:', { code: e.code, message: e.message });
      let friendlyMessage = 'An unexpected error occurred.';
      switch (e.code) {
        case 'auth/user-not-found':
          friendlyMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          friendlyMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = 'An account already exists with this email address.';
          break;
        case 'auth/invalid-email':
            friendlyMessage = 'The email address is not valid.';
            break;
        default:
          friendlyMessage = e.message;
      }
      setError({ code: e.code, message: friendlyMessage });
    } else {
        setError({ code: 'unknown', message: 'An unknown error occurred.' });
    }
  };

  const onSignInSubmit = async (values: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailPassword(auth, firestore, values.email, values.password);
      // No need to setIsLoading(false) because the component will unmount on successful login
    } catch (e) {
      handleError(e);
    }
  };

  const onSignUpSubmit = async (values: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    setError(null);
    try {
      await signUpWithEmailPassword(auth, firestore, values.email, values.password);
      toast({
        title: 'Account Created!',
        description: "You've been signed in successfully.",
      });
      // No need to setIsLoading(false) because the component will unmount on successful login
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        <TabsTrigger value="sign-up">Create Account</TabsTrigger>
      </TabsList>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Authentication Failed</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="sign-in">
        <Form {...signInForm}>
          <form onSubmit={signInForm.handleSubmit(onSignInSubmit)} className="space-y-4 mt-4">
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Password *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </Form>
      </TabsContent>
      <TabsContent value="sign-up">
        <Form {...signUpForm}>
          <form onSubmit={signUpForm.handleSubmit(onSignUpSubmit)} className="space-y-4 mt-4">
            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Email *</FormLabel>
                  <FormControl>
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Password *</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
}
