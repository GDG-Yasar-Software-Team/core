import { useCallback, useEffect, useState } from "react";
import { listForms } from "../services/formService";
import type { FormPreview } from "../types";
import { ApiClientError } from "../utils/apiClientError";

interface UseFormsResult {
	forms: FormPreview[];
	total: number;
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

export function useForms(skip = 0, limit = 20): UseFormsResult {
	const [forms, setForms] = useState<FormPreview[]>([]);
	const [total, setTotal] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [_refreshKey, setRefreshKey] = useState(0);

	const refetch = useCallback(() => {
		setRefreshKey((prev) => prev + 1);
	}, []);

	useEffect(() => {
		let isCancelled = false;

		async function fetchForms() {
			setIsLoading(true);
			setError(null);

			try {
				const response = await listForms(skip, limit);
				if (!isCancelled) {
					setForms(response.forms);
					setTotal(response.total);
				}
			} catch (err) {
				if (!isCancelled) {
					if (err instanceof ApiClientError && err.status === 401) {
						setError("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
					} else {
						setError("Formlar yüklenirken bir hata oluştu.");
					}
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		}

		fetchForms();

		return () => {
			isCancelled = true;
		};
	}, [skip, limit]);

	return { forms, total, isLoading, error, refetch };
}
