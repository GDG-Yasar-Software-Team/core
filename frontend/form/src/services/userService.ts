import type { UserCreateResponse, UserPayload, UserResponse } from "../types";

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
			`User service request failed: ${response.status} ${errorText}`,
		);
	}

	return (await response.json()) as T;
}

export async function getUserByEmail(
	email: string,
): Promise<UserResponse | null> {
	const response = await fetch(
		`${FORM_SERVICE_URL}/users/by-email/${encodeURIComponent(email)}`,
		{
			headers: { "Content-Type": "application/json" },
		},
	);

	if (response.status === 404) {
		return null;
	}

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`User lookup failed: ${response.status} ${errorText}`);
	}

	return (await response.json()) as UserResponse;
}

export async function createUser(
	payload: UserPayload,
): Promise<UserCreateResponse> {
	return request<UserCreateResponse>("/users/", {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export async function updateUser(
	email: string,
	payload: UserPayload,
): Promise<UserResponse> {
	return request<UserResponse>(`/users/by-email/${encodeURIComponent(email)}`, {
		method: "PUT",
		body: JSON.stringify(payload),
	});
}

export async function recordFormSubmission(
	email: string,
	formId: string,
): Promise<void> {
	await request<{ status: string }>(
		`/users/by-email/${encodeURIComponent(email)}/forms/${formId}`,
		{
			method: "POST",
		},
	);
}
