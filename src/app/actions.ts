'use server';

import { suggestOptimalLayouts, SuggestOptimalLayoutsInput, SuggestOptimalLayoutsOutput } from '@/ai/flows/suggest-optimal-layouts';
import { z } from 'zod';

const EssentialInformationSchema = z.enum(["product name", "price", "brand logo", "QR code", "promotional message"]);

const ActionInputSchema = z.object({
  productName: z.string().min(1, 'Product name is required.'),
  productDescription: z.string().min(1, 'Product description is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
  discount: z.coerce.number().optional(),
  displaySize: z.string(),
  resolution: z.string(),
  essentialInformation: z.array(EssentialInformationSchema),
  constraints: z.string().min(1, 'Constraints are required.'),
});

export type FormState = {
  status: 'success' | 'error' | 'idle';
  message: string;
  data: SuggestOptimalLayoutsOutput | null;
}

export async function getLayoutSuggestions(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = ActionInputSchema.safeParse({
    productName: formData.get('productName'),
    productDescription: formData.get('productDescription'),
    price: formData.get('price'),
    discount: formData.get('discount') || undefined,
    displaySize: formData.get('displaySize'),
    resolution: formData.get('resolution'),
    essentialInformation: formData.getAll('essentialInformation'),
    constraints: formData.get('constraints'),
  });

  if (!validatedFields.success) {
    return {
      status: 'error',
      message: validatedFields.error.flatten().fieldErrors.toString(),
      data: null,
    };
  }

  try {
    const result = await suggestOptimalLayouts(validatedFields.data as SuggestOptimalLayoutsInput);
    return {
      status: 'success',
      message: 'Layouts generated successfully.',
      data: result,
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'An unexpected error occurred while generating layouts.',
      data: null,
    };
  }
}
