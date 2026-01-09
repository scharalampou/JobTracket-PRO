'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
import { useState } from 'react';
import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { CalendarIcon, Plus, Scan, Loader2 } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { scanJobUrlForDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  jobDescriptionUrl: z.string().url('Please enter a valid URL'),
  company: z.string().min(1, 'Company name is required'),
  role: z.string().min(1, 'Role is required'),
  dateApplied: z.date({ required_error: 'Application date is required' }),
  location: z.string().min(1, 'Location is required'),
});

export function AddApplicationModal() {
  const [open, setOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { addApplication } = useJobApplications();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescriptionUrl: '',
      company: '',
      role: '',
      location: '',
      dateApplied: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addApplication(values);
    form.reset({
      jobDescriptionUrl: '',
      company: '',
      role: '',
      location: '',
      dateApplied: new Date(),
    });
    setOpen(false);
    toast({
      title: 'Application Added',
      description: `${values.role} at ${values.company} has been added.`,
    })
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
      <DialogTrigger asChild>
        <Button className="bg-brand hover:bg-brand/90 text-white">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Application</DialogTitle>
          <DialogDescription>
            Enter the details of the job you applied for. Start by scanning a job description URL.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="jobDescriptionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description URL</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input type="url" placeholder="https://..." {...field} />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={handleScanUrl} disabled={isScanning}>
                      {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scan className="h-4 w-4" />}
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
                    <FormLabel>Company</FormLabel>
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
                    <FormLabel>Role</FormLabel>
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
                    <FormLabel>Location</FormLabel>
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
                  <FormItem className="flex flex-col pt-2">
                    <FormLabel>Date Applied</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Add Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
