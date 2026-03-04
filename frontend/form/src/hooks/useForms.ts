import { useCallback, useEffect, useState } from "react";
import { listForms } from "../services/formService";
import type { FormPreview } from "../types";

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
	const [refreshKey, setRefreshKey] = useState(0);

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
					setError(err instanceof Error ? err.message : "Failed to load forms");
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
	}, [skip, limit, refreshKey]);

	return { forms, total, isLoading, error, refetch };
}
