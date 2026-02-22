import { z } from "zod";
import type { FormFieldSchema } from "../types";

export function buildFormSchema(
	questions: FormFieldSchema[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const field of questions) {
		let fieldSchema: z.ZodTypeAny;

		switch (field.field_type) {
			case "number": {
				let numSchema = z.coerce.number({
					invalid_type_error: `${field.label} geçerli bir sayı olmalıdır.`,
				});
				if (field.validation?.min_value !== undefined) {
					numSchema = numSchema.min(field.validation.min_value, {
						message: `En az ${field.validation.min_value} olmalıdır.`,
					});
				}
				if (field.validation?.max_value !== undefined) {
					numSchema = numSchema.max(field.validation.max_value, {
						message: `En fazla ${field.validation.max_value} olmalıdır.`,
					});
				}
				fieldSchema = field.required
					? numSchema
					: numSchema.optional().or(z.literal("").transform(() => undefined));
				break;
			}
			case "checkbox": {
				if ((field.options?.length ?? 0) > 0) {
					const arrSchema = z.array(z.string());
					fieldSchema = field.required
						? arrSchema.min(1, { message: `${field.label} alanı zorunludur.` })
						: arrSchema.optional();
				} else {
					const boolSchema = z.boolean();
					fieldSchema = field.required
						? boolSchema.refine((value) => value === true, {
								message: `${field.label} alanı zorunludur.`,
							})
						: boolSchema.optional();
				}
				break;
			}
			case "multiselect": {
				const arrSchema = z.array(z.string());
				fieldSchema = field.required
					? arrSchema.min(1, { message: `${field.label} alanı zorunludur.` })
					: arrSchema.optional();
				break;
			}
			default: {
				let strSchema = z.string();
				if (field.required) {
					strSchema = strSchema.min(1, {
						message: `${field.label} alanı zorunludur.`,
					});
				}
				if (field.validation?.min_length) {
					strSchema = strSchema.min(field.validation.min_length, {
						message: `En az ${field.validation.min_length} karakter olmalıdır.`,
					});
				}
				if (field.validation?.max_length) {
					strSchema = strSchema.max(field.validation.max_length, {
						message: `En fazla ${field.validation.max_length} karakter olmalıdır.`,
					});
				}
				if (field.validation?.pattern) {
					strSchema = strSchema.regex(new RegExp(field.validation.pattern), {
						message: `${field.label} geçerli bir formatta olmalıdır.`,
					});
				}
				fieldSchema = field.required
					? strSchema
					: strSchema.optional().or(z.literal(""));
				break;
			}
		}

		shape[field.field_id] = fieldSchema;
	}

	return z.object(shape);
}
