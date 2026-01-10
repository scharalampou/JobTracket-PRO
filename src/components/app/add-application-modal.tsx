
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
import { useState } from 'react';
import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Plus, Wand2, Loader2 } from 'lucide-react';
import { scanJobUrlForDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const formSchema = z.object({
  jobDescriptionUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
  company: z.string().min(1, 'Company name is required.'),
  role: z.string().min(1, 'Role is required.'),
  location: z.string().min(1, 'Location is required.'),
  dateApplied: z.string().min(1, 'A date is required.'),
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
      dateApplied: format(new Date(), 'yyyy-MM-dd'),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addApplication({ ...values, dateApplied: new Date(values.dateApplied) });
    form.reset({
      jobDescriptionUrl: '',
      company: '',
      role: '',
      location: '',
      dateApplied: format(new Date(), 'yyyy-MM-dd'),
    });
    setOpen(false);
    toast({
      title: 'Job Added',
      description: `${values.role} at ${values.company} has been added.`,
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
      <DialogTrigger asChild>
        <Button className="font-bold text-white bg-[#4DAA57] hover:bg-[#4DAA57]/90">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Application
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">New Application</DialogTitle>
          <DialogDescription>
            Enter the details of the job you applied for. You can autofill by adding the URL of the Job Listing and click on the <Wand2 className="inline-block h-4 w-4" /> icon!
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jobDescriptionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Job Description URL (optional)</FormLabel>
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
                    <FormLabel className="font-bold">Company *</FormLabel>
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
                    <FormLabel className="font-bold">Role *</FormLabel>
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
                    <FormLabel className="font-bold">Location *</FormLabel>
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
                    <FormLabel className="font-bold">Date Applied *</FormLabel>
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
                <Button variant="ghost" className="underline">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="font-bold text-white bg-[#4DAA57] hover:bg-[#4DAA57]/90">Add Application</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
