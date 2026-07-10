import { defineCollection, z } from "astro:content";

const aiContext = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
  }),
});

export const collections = { aiContext };
