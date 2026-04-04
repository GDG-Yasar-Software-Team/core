import { getAdminToken } from "../hooks/useAdminAuth";
import type {
	FormCreate,
	FormListResponse,
	FormResponse,
	FormUpdate,
	PaginatedSubmissionsResponse,
	SubmissionCreate,
	SubmissionResponse,
} from "../types";
import { throwIfNotOk } from "../utils/apiClientError";

const FORM_SERVICE_URL =
	import.meta.env.VITE_FORM_SERVICE_URL ?? "http://localhost:8002";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(`${FORM_SERVICE_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...(init.headers ?? {}),
		},
	});

	await throwIfNotOk(response);

	const text = await response.text();
	if (!text.trim()) {
		return undefined as T;
	}
	return JSON.parse(text) as T;
}

/**
 * Make an authenticated request to the form service.
 * Includes the admin API token in the X-API-Token header.
 */
async function authenticatedRequest<T>(
	path: string,
	init: RequestInit = {},
): Promise<T> {
	const token = getAdminToken();
	if (!token) {
		throw new Error("Not authenticated - admin token not found");
	}

	return request<T>(path, {
		...init,
		headers: {
			...(init.headers ?? {}),
			"X-API-Token": token,
		},
	});
}

export async function getFormById(formId: string): Promise<FormResponse> {
	return request<FormResponse>(`/forms/${encodeURIComponent(formId)}`);
}

export async function createSubmission(
	payload: SubmissionCreate,
): Promise<SubmissionResponse> {
	return request<SubmissionResponse>("/submissions/", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function getSubmissionsByForm(
	formId: string,
	skip = 0,
	limit = 100,
): Promise<PaginatedSubmissionsResponse> {
	const query = new URLSearchParams({
		skip: String(skip),
		limit: String(limit),
	});

	return authenticatedRequest<PaginatedSubmissionsResponse>(
		`/submissions/by-form/${encodeURIComponent(formId)}?${query.toString()}`,
	);
}

export async function getAllSubmissionsByForm(
	formId: string,
): Promise<SubmissionResponse[]> {
	const pageSize = 100;
	let skip = 0;
	let total = Number.POSITIVE_INFINITY;
	const submissions: SubmissionResponse[] = [];

	while (submissions.length < total) {
		const page = await getSubmissionsByForm(formId, skip, pageSize);
		submissions.push(...page.submissions);
		total = page.total;

		if (page.submissions.length === 0) {
			break;
		}

		skip += page.submissions.length;
	}

	return submissions;
}

export async function listForms(
	skip = 0,
	limit = 20,
	activeOnly = false,
): Promise<FormListResponse> {
	const query = new URLSearchParams({
		skip: String(skip),
		limit: String(limit),
		active_only: String(activeOnly),
	});

	return authenticatedRequest<FormListResponse>(`/forms/?${query.toString()}`);
}

export async function createForm(payload: FormCreate): Promise<FormResponse> {
	return authenticatedRequest<FormResponse>("/forms/", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function updateForm(
	formId: string,
	payload: FormUpdate,
): Promise<FormResponse> {
	return authenticatedRequest<FormResponse>(
		`/forms/${encodeURIComponent(formId)}`,
		{
			method: "PUT",
			body: JSON.stringify(payload),
		},
	);
}

export async function deleteForm(formId: string): Promise<void> {
	await authenticatedRequest<void>(`/forms/${encodeURIComponent(formId)}`, {
		method: "DELETE",
	});
}

/** User-facing copy when verify cannot be completed (network / non-401 HTTP errors). */
const ADMIN_VERIFY_UNAVAILABLE =
	"Giriş şu anda doğrulanamıyor. İnternet bağlantınızı kontrol edip bir süre sonra tekrar deneyin.";

export interface VerifyTokenResult {
	valid: boolean;
	error?: string;
	/** When true, UI may offer a support mailto (token invalid vs unreachable). */
	suggestSupportContact?: boolean;
}

/**
 * Verify if an API token is valid without touching the database.
 */
export async function verifyToken(token: string): Promise<VerifyTokenResult> {
	try {
		const response = await fetch(`${FORM_SERVICE_URL}/auth/verify`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"X-API-Token": token,
			},
		});

		if (response.status === 401) {
			const data = await response.json();
			return {
				valid: false,
				error: data.detail || "Geçersiz API token",
				suggestSupportContact: false,
			};
		}

		if (!response.ok) {
			return {
				valid: false,
				error: ADMIN_VERIFY_UNAVAILABLE,
				suggestSupportContact: true,
			};
		}

		return { valid: true };
	} catch {
		return {
			valid: false,
			error: ADMIN_VERIFY_UNAVAILABLE,
			suggestSupportContact: true,
		};
	}
}
