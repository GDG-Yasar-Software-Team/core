import { z } from "zod";
import type { FormFieldSchema } from "../types";

export function buildFormSchema(questions: FormFieldSchema[]): z.ZodObject<Record<string, z.ZodTypeAny>> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const field of questions) {
		let fieldSchema: z.ZodTypeAny;

		switch (field.fieldType) {
			case "number": {
				let numSchema = z.coerce.number({
					invalid_type_error: `${field.label} geçerli bir sayı olmalıdır.`,
				});
				if (field.validation?.minValue !== undefined) {
					numSchema = numSchema.min(field.validation.minValue, {
						message: `En az ${field.validation.minValue} olmalıdır.`,
					});
				}
				if (field.validation?.maxValue !== undefined) {
					numSchema = numSchema.max(field.validation.maxValue, {
						message: `En fazla ${field.validation.maxValue} olmalıdır.`,
					});
				}
				fieldSchema = field.required
					? numSchema
					: numSchema.optional().or(z.literal("").transform(() => undefined));
				break;
			}
			case "checkbox": {
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
				if (field.validation?.minLength) {
					strSchema = strSchema.min(field.validation.minLength, {
						message: `En az ${field.validation.minLength} karakter olmalıdır.`,
					});
				}
				if (field.validation?.maxLength) {
					strSchema = strSchema.max(field.validation.maxLength, {
						message: `En fazla ${field.validation.maxLength} karakter olmalıdır.`,
					});
				}
				if (field.validation?.pattern) {
					strSchema = strSchema.regex(new RegExp(field.validation.pattern), {
						message: `${field.label} geçerli bir formatta olmalıdır.`,
					});
				}
				fieldSchema = field.required ? strSchema : strSchema.optional().or(z.literal(""));
				break;
			}
		}

		shape[field.fieldId] = fieldSchema;
	}

	return z.object(shape);
}
