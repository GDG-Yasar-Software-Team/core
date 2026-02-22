import { z } from "zod";
import type { FormFieldSchema } from "../types";
import { isQuestionVisible } from "./fieldVisibility";

function emptyStringToUndefined(value: unknown): unknown {
	if (typeof value === "string" && value.trim().length === 0) {
		return undefined;
	}
	return value;
}

function hasRequiredValue(field: FormFieldSchema, value: unknown): boolean {
	if (field.field_type === "checkbox" && (field.options?.length ?? 0) === 0) {
		return value === true;
	}

	if (field.field_type === "multiselect" || field.field_type === "checkbox") {
		return Array.isArray(value) && value.length > 0;
	}

	if (field.field_type === "number") {
		return (
			typeof value === "number" &&
			Number.isFinite(value) &&
			!Number.isNaN(value)
		);
	}

	if (typeof value === "string") {
		return value.trim().length > 0;
	}

	return value !== undefined && value !== null;
}

function buildFieldSchema(field: FormFieldSchema): z.ZodTypeAny {
	switch (field.field_type) {
		case "number": {
			let numSchema = z.coerce.number();

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

			return z.preprocess(emptyStringToUndefined, numSchema).optional();
		}
		case "checkbox": {
			if ((field.options?.length ?? 0) > 0) {
				return z.array(z.string()).optional();
			}
			return z.boolean().optional();
		}
		case "multiselect":
			return z.array(z.string()).optional();
		default: {
			let strSchema = z.string();

			if (field.validation?.min_length !== undefined) {
				strSchema = strSchema.min(field.validation.min_length, {
					message: `En az ${field.validation.min_length} karakter olmalıdır.`,
				});
			}
			if (field.validation?.max_length !== undefined) {
				strSchema = strSchema.max(field.validation.max_length, {
					message: `En fazla ${field.validation.max_length} karakter olmalıdır.`,
				});
			}
			if (field.validation?.pattern) {
				strSchema = strSchema.regex(new RegExp(field.validation.pattern), {
					message: `${field.label} geçerli bir formatta olmalıdır.`,
				});
			}

			return z.preprocess(emptyStringToUndefined, strSchema).optional();
		}
	}
}

export function buildFormSchema(
	questions: FormFieldSchema[],
): z.ZodType<Record<string, unknown>> {
	const shape: Record<string, z.ZodTypeAny> = {};

	for (const field of questions) {
		shape[field.field_id] = buildFieldSchema(field);
	}

	return z.object(shape).superRefine((values, ctx) => {
		for (const field of questions) {
			if (!field.required) {
				continue;
			}
			if (!isQuestionVisible(field, values)) {
				continue;
			}

			if (!hasRequiredValue(field, values[field.field_id])) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: [field.field_id],
					message: `${field.label} alanı zorunludur.`,
				});
			}
		}
	});
}
