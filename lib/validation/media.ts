import { z } from "zod";
export const mediaMetadataSchema=z.object({title:z.string().trim().max(240).optional().nullable(),altText:z.string().trim().max(300).optional().nullable(),caption:z.string().trim().max(1000).optional().nullable(),description:z.string().trim().max(5000).optional().nullable()});
export const mediaQuerySchema=z.object({q:z.string().trim().max(120).optional(),mime:z.string().trim().max(80).optional(),page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(30),collectionId:z.string().trim().optional()});
