'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Loader2, Sparkles } from 'lucide-react';

import { getLayoutSuggestions, FormState } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCommandLog } from '@/hooks/use-command-log';
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  productName: z.string().min(2, 'Product name must be at least 2 characters.'),
  productDescription: z.string().min(10, 'Description must be at least 10 characters.'),
  price: z.coerce.number().positive('Price must be a positive number.'),
  discount: z.coerce.number().min(0).max(100).optional(),
  displaySize: z.string({ required_error: 'Please select a display size.' }),
  resolution: z.string({ required_error: 'Please select a resolution.' }),
  essentialInformation: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
  constraints: z.string().min(10, 'Constraints must be at least 10 characters.'),
});

type FormValues = z.infer<typeof formSchema>;

const essentialItems = [
  { id: 'product name', label: 'Product Name' },
  { id: 'price', label: 'Price' },
  { id: 'brand logo', label: 'Brand Logo' },
  { id: 'QR code', label: 'QR Code' },
  { id: 'promotional message', label: 'Promotional Message' },
];

const initialState: FormState = {
  status: 'idle',
  message: '',
  data: null,
};

export default function SmartLayoutClient() {
  const [state, formAction] = useActionState(getLayoutSuggestions, initialState);
  const { addLogEntry } = useCommandLog();
  const formRef = React.useRef<HTMLFormElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productDescription: '',
      price: 0,
      essentialInformation: ['product name', 'price'],
      constraints: 'Prioritize price visibility and include promotional message.',
      displaySize: '2.9 inch',
      resolution: '296x128 pixels'
    },
  });

  const onSubmit = (formData: FormData) => {
    formAction(formData);
    addLogEntry('Generating smart layout suggestions...');
  };
  
  React.useEffect(() => {
    if (state.status === 'success') {
      addLogEntry('Smart layout suggestions generated successfully.');
    } else if (state.status === 'error') {
      addLogEntry(`Smart layout generation failed: ${state.message}`);
    }
  }, [state, addLogEntry]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Layout Parameters</CardTitle>
          <CardDescription>
            Fill in the product details to get AI-powered layout suggestions for your electronic shelf labels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form ref={formRef} action={onSubmit} className="space-y-6">
                <FormField
                    control={form.control}
                    name="productName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Organic Blueberries" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="productDescription"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Product Description</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Fresh, sweet, and packed with antioxidants." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                                <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Discount (%)</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="e.g., 15" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="displaySize"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Display Size</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select display size" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="2.9 inch">2.9 inch</SelectItem>
                                    <SelectItem value="4.2 inch">4.2 inch</SelectItem>
                                    <SelectItem value="7.5 inch">7.5 inch</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="resolution"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Resolution</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue placeholder="Select resolution" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="296x128 pixels">296x128 pixels</SelectItem>
                                    <SelectItem value="400x300 pixels">400x300 pixels</SelectItem>
                                    <SelectItem value="800x480 pixels">800x480 pixels</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="essentialInformation"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Essential Information</FormLabel>
                            <FormDescription>Select the items to include in the layout.</FormDescription>
                        </div>
                        {essentialItems.map((item) => (
                            <FormField
                            key={item.id}
                            control={form.control}
                            name="essentialInformation"
                            render={({ field }) => {
                                return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                    <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                        return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(field.value?.filter((value) => value !== item.id));
                                        }}
                                    />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                                );
                            }}
                            />
                        ))}
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="constraints"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Constraints</FormLabel>
                        <FormControl>
                            <Textarea placeholder="e.g., Modern look, large price font, space for QR code." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} onClick={() => form.handleSubmit(() => formRef.current?.requestSubmit())()}>
                    {form.formState.isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Layouts
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center"><Bot className="mr-2" /> AI Suggestions</h2>
        {form.formState.isSubmitting ? (
            <div className="space-y-4">
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardContent className="p-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
            </div>
        ) : state.status === 'success' && state.data ? (
          <div className="space-y-4">
            {state.data.layoutSuggestions.map((suggestion, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>Layout Option {index + 1}</CardTitle>
                  <CardDescription>{suggestion.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Visual Representation</h4>
                    <pre className="bg-muted p-4 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {suggestion.visualRepresentation}
                    </pre>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Justification</h4>
                    <p className="text-sm text-muted-foreground">{suggestion.justification}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex items-center justify-center h-96">
            <div className="text-center text-muted-foreground">
              <Sparkles className="mx-auto h-12 w-12 mb-4" />
              <p>Your generated layouts will appear here.</p>
            </div>
          </Card>
        )}
        {state.status === 'error' && state.message && (
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Error</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{state.message}</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
