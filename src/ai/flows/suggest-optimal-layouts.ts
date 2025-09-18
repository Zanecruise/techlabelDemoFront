'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal electronic shelf label (ESL) layouts.
 *
 * It takes product information and display constraints as input and returns layout suggestions.
 *
 * @fileOverview
 * - suggestOptimalLayouts - A function that suggests optimal layouts for electronic shelf labels (ESL) based on product information and display constraints.
 * - SuggestOptimalLayoutsInput - The input type for the suggestOptimalLayouts function.
 * - SuggestOptimalLayoutsOutput - The return type for the suggestOptimalLayouts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalLayoutsInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('A detailed description of the product, including key features and benefits.'),
  price: z.number().describe('The current price of the product.'),
  discount: z.number().optional().describe('The discount percentage on the product, if any.'),
  displaySize: z.string().describe('The dimensions of the electronic shelf label display area (e.g., 2.9 inch, 4.2 inch).'),
  resolution: z.string().describe('The resolution of the electronic shelf label display (e.g., 296x128 pixels).'),
  essentialInformation: z.array(z.string()).describe('A list of essential information to be included on the label (e.g., product name, price, brand logo).'),
  constraints: z.string().describe('Any specific constraints or requirements for the layout (e.g., prioritize price visibility, include promotional message).'),
});
export type SuggestOptimalLayoutsInput = z.infer<typeof SuggestOptimalLayoutsInputSchema>;

const SuggestOptimalLayoutsOutputSchema = z.object({
  layoutSuggestions: z.array(
    z.object({
      description: z.string().describe('A description of the layout suggestion.'),
      visualRepresentation: z.string().describe('A text-based visual representation of the layout, indicating the placement of different elements.'),
      justification: z.string().describe('The reasoning behind why this layout is optimal, considering the input parameters.'),
    })
  ).describe('An array of suggested electronic shelf label layouts.'),
});
export type SuggestOptimalLayoutsOutput = z.infer<typeof SuggestOptimalLayoutsOutputSchema>;

export async function suggestOptimalLayouts(input: SuggestOptimalLayoutsInput): Promise<SuggestOptimalLayoutsOutput> {
  return suggestOptimalLayoutsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalLayoutsPrompt',
  input: {schema: SuggestOptimalLayoutsInputSchema},
  output: {schema: SuggestOptimalLayoutsOutputSchema},
  prompt: `You are an expert in designing electronic shelf label (ESL) layouts that maximize readability and visual appeal.

  Given the following product information and display constraints, suggest three optimal ESL layouts.

  Product Name: {{{productName}}}
  Product Description: {{{productDescription}}}
  Price: {{{price}}}
  {{#if discount}}
  Discount: {{{discount}}}%
  {{/if}}
  Display Size: {{{displaySize}}}
  Resolution: {{{resolution}}}
  Essential Information: {{#each essentialInformation}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Constraints: {{{constraints}}}

  Consider the following factors when generating the layouts:
  - Readability: Ensure that the most important information (e.g., price, product name) is easily readable from a distance.
  - Visual Hierarchy: Use font sizes, colors, and placement to create a clear visual hierarchy.
  - Branding: Incorporate the brand logo and colors where appropriate.
  - Information Density: Avoid overcrowding the label with too much information.

  For each layout suggestion, provide a brief description, a text-based visual representation, and a justification for why it is optimal.
`,
});

const suggestOptimalLayoutsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalLayoutsFlow',
    inputSchema: SuggestOptimalLayoutsInputSchema,
    outputSchema: SuggestOptimalLayoutsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
