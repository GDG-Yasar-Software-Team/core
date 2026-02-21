import { useEffect, useState } from "react";
import { getFormById } from "../services/formService";
import type { FormResponse } from "../types";

interface UseFormDetailsReturn {
	form: FormResponse | null;
	isLoading: boolean;
	error: string | null;
}

function formatError(error: unknown): string {
	if (error instanceof Error) {
		if (error.message.includes("404")) {
			return "Form bulunamadı.";
		}
		return "Form yüklenirken bir hata oluştu.";
	}
	return "Form yüklenemedi.";
}

export function useFormDetails(
	formId: string | undefined,
): UseFormDetailsReturn {
	const [form, setForm] = useState<FormResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!formId) {
			setError("Form kimliği bulunamadı.");
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
			} catch (error) {
				if (!isCancelled) {
					setForm(null);
					setError(formatError(error));
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
