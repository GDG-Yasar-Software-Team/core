import type {
	FormResponse,
	PaginatedSubmissionsResponse,
	SubmissionCreate,
	SubmissionResponse,
} from "../types";

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

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Form service request failed: ${response.status} ${errorText}`,
		);
	}

	return (await response.json()) as T;
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

	return request<PaginatedSubmissionsResponse>(
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
