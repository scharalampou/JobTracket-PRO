
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useEffect } from 'react';
import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Pencil, Wand2, Loader2 } from 'lucide-react';
import { scanJobUrlForDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { JobApplication } from '@/lib/types';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';

const formSchema = z.object({
  jobDescriptionUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  company: z.string().min(1, 'Company name is required.'),
  role: z.string().min(1, 'Role is required.'),
  location: z.string().min(1, 'Location is required.'),
  dateApplied: z.string().min(1, 'A date is required.'),
});

type EditApplicationModalProps = {
  application: JobApplication;
};

export function EditApplicationModal({ application }: EditApplicationModalProps) {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { updateApplication } = useJobApplications();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  
  useEffect(() => {
    if (open) {
      form.reset({
        jobDescriptionUrl: application.jobDescriptionUrl || '',
        company: application.company,
        role: application.role,
        location: application.location,
        dateApplied: format(new Date(application.dateApplied), 'yyyy-MM-dd'),
      });
    }
  }, [open, application, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateApplication(application.id, { ...values, dateApplied: new Date(values.dateApplied) });
    setOpen(false);
    toast({
      title: 'Job Updated',
      description: `${values.role} at ${values.company} has been updated.`,
    });
  };

  const handleScanUrl = async () => {
    const url = form.getValues('jobDescriptionUrl');
    if (!url) {
      form.setError('jobDescriptionUrl', { message: 'URL is required to scan.' });
      return;
    }
    setIsScanning(true);
    const result = await scanJobUrlForDetails(url);
    setIsScanning(false);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Scan Failed',
        description: result.error,
      });
      return;
    }

    let fieldsUpdated: string[] = [];
    if (result.company) {
      form.setValue('company', result.company, { shouldValidate: true });
      fieldsUpdated.push('Company');
    }
    if (result.role) {
      form.setValue('role', result.role, { shouldValidate: true });
      fieldsUpdated.push('Role');
    }
    if (result.location) {
      form.setValue('location', result.location, { shouldValidate: true });
      fieldsUpdated.push('Location');
    }

    if (fieldsUpdated.length > 0) {
      toast({
        title: 'Details Found!',
        description: `Autofilled the following fields: ${fieldsUpdated.join(', ')}.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Scan Complete',
        description: 'Could not find any details to autofill.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-orange-500">
                  <Pencil className="h-4 w-4 text-white" />
                </div>
                <span className="sr-only">Edit Application</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit Application</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit Application</DialogTitle>
          <DialogDescription>
            Update the details of this job application. You can autofill by adding the URL and clicking the <Wand2 className="inline-block h-4 w-4" /> icon.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobDescriptionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description URL (optional)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleScanUrl} disabled={isScanning}>
                      {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      <span className="sr-only">Scan URL</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Google" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="dateApplied"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Applied *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
               <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
