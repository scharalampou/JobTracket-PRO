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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useState, useMemo } from 'react';
import { useJobApplications } from '@/contexts/JobApplicationsContext';
import { Plus, Wand2, Loader2 } from 'lucide-react';
import { scanJobUrlForDetails } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

const currentYear = new Date().getFullYear();
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(0, i).toLocaleString('default', { month: 'long' }),
}));
const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

const formSchema = z.object({
  jobDescriptionUrl: z.string().url('Please enter a valid URL.').or(z.literal('')),
  company: z.string().min(1, 'Company name is required.'),
  role: z.string().min(1, 'Role is required.'),
  location: z.string().min(1, 'Location is required.'),
  day: z.string().min(1, 'Day is required.'),
  month: z.string().min(1, 'Month is required.'),
  year: z.string().min(1, 'Year is required.'),
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
      day: String(new Date().getDate()),
      month: String(new Date().getMonth() + 1),
      year: String(new Date().getFullYear()),
    },
  });

  const selectedMonth = form.watch('month');
  const selectedYear = form.watch('year');

  const daysInMonth = useMemo(() => {
    const yearNum = parseInt(selectedYear, 10);
    const monthNum = parseInt(selectedMonth, 10);
    if (!isNaN(yearNum) && !isNaN(monthNum)) {
      return new Date(yearNum, monthNum, 0).getDate();
    }
    return 31; // Default to 31 if month/year not set
  }, [selectedMonth, selectedYear]);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);


  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { day, month, year, ...rest } = values;
    const dateApplied = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    addApplication({ ...rest, dateApplied });
    form.reset();
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
        <Button className="font-bold">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Add New Job</DialogTitle>
          <DialogDescription>
            Enter the details of the job you applied for. You can autofill by scanning a URL.
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

            <div className="grid grid-cols-3 gap-4">
               <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Applied</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map(m => (
                          <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-background'>.</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {days.map(d => (
                          <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-background'>.</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
               <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Job</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
