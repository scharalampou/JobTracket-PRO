
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import type { JobApplication } from '@/lib/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const formSchema = z.object({
  notes: z.string().optional(),
});

type CloseApplicationDialogProps = {
  application: JobApplication;
};

export function CloseApplicationDialog({ application }: CloseApplicationDialogProps) {
  const [open, setOpen] = useState(false);
  const { archiveApplication } = useJobApplications();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      notes: '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    archiveApplication(application.id, values.notes);
    form.reset();
    setOpen(false);
    toast({
      title: 'Application Closed',
      description: `The application for ${application.role} at ${application.company} has been archived.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-transparent">
                <div
                  className="flex items-center justify-center h-6 w-6 rounded-sm transition-transform ease-in-out hover:scale-125"
                  style={{ backgroundColor: '#F9624E' }}
                >
                  <Archive className="h-4 w-4 text-white" />
                </div>
                <span className="sr-only">Close Application</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Close Application</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Close Application</DialogTitle>
          <DialogDescription>
            Archive this application and add any final notes or feedback from the interview process.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Notes / Feedback</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., 'Received positive feedback on the technical task, but they went with a more senior candidate.'"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" type="button" className="underline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="font-bold">Close Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
