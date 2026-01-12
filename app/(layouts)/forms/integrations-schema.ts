import { z } from 'zod';

export const getIntegrationSchema = () => {
    return z.object({
        provider: z
            .string()
            .min(1, { message: 'Provider is required.' }),
        key: z
            .string()
            .min(1, { message: 'Key is required.' }),
        secret: z
            .string()
            .min(1, { message: 'Secret is required.' }),
            agent_id: z.coerce.string().min(1, { message: 'Agent ID is required.' }),

    });
};

export type IntegrationsSchemaType = z.infer<ReturnType<typeof getIntegrationSchema>>;
