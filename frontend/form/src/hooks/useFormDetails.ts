import { useEffect, useState } from "react";
import { getFormById } from "../services/formService";
import type { FormResponse } from "../types";
import { ApiClientError } from "../utils/apiClientError";

export type FormLoadErrorKind = "not_found" | "unavailable";

export interface FormLoadError {
	kind: FormLoadErrorKind;
	message: string;
}

interface UseFormDetailsReturn {
	form: FormResponse | null;
	isLoading: boolean;
	error: FormLoadError | null;
}

function classifyError(error: unknown): FormLoadError {
	if (error instanceof ApiClientError && error.status === 404) {
		return { kind: "not_found", message: "Form bulunamadı." };
	}
	return { kind: "unavailable", message: "Form yüklenemedi." };
}

export function useFormDetails(
	formId: string | undefined,
): UseFormDetailsReturn {
	const [form, setForm] = useState<FormResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<FormLoadError | null>(null);

	useEffect(() => {
		if (!formId) {
			setError({ kind: "not_found", message: "Form kimliği bulunamadı." });
			setForm(null);
			setIsLoading(false);
			return;
		}

		let isCancelled = false;

		const fetchForm = async () => {
			setIsLoading(true);
			setError(null);

			try {
				const data = await getFormById(formId);
				if (!isCancelled) {
					setForm(data);
				}
			} catch (err) {
				if (!isCancelled) {
					setForm(null);
					setError(classifyError(err));
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		void fetchForm();

		return () => {
			isCancelled = true;
		};
	}, [formId]);

	return { form, isLoading, error };
}
