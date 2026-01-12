import { z } from 'zod';

export const getCompanySettingsSchema = () => {
    return z.object({
        company: z
            .string()
            .min(1, { message: 'Company is required.' }),
        domain: z
            .string()
            .min(1, { message: 'Domain is required.' }),
        tenant_id: z.string().min(1, { message: 'Tenant ID is required.' }),

    });
};

export type CompanySettingsSchemaType = z.infer<ReturnType<typeof getCompanySettingsSchema>>;
