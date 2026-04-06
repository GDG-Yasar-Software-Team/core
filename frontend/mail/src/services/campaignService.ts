import { clearAdminToken, getAdminToken } from "../components/AuthGate.tsx";
import type {
	CampaignCreate,
	CampaignListItem,
	CampaignResponse,
	CampaignUpdate,
	ExecutionProgress,
	TestMailRequest,
	TestMailResponse,
	TriggerStartResponse,
} from "../types";

const MAIL_SERVICE_URL =
	import.meta.env.VITE_MAIL_SERVICE_URL ?? "http://localhost:8000";

function authHeaders(): Record<string, string> {
	const token = getAdminToken();
	return token ? { "X-Admin-Token": token } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	const response = await fetch(`${MAIL_SERVICE_URL}${path}`, {
		...init,
		headers: {
			"Content-Type": "application/json",
			...authHeaders(),
			...(init.headers ?? {}),
		},
	});

	if (response.status === 401) {
		clearAdminToken();
		window.location.reload();
		throw new Error("Unauthorized");
	}

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Mail service request failed: ${response.status} ${errorText}`,
		);
	}

	return (await response.json()) as T;
}

export async function listCampaigns(
	limit = 20,
	offset = 0,
): Promise<CampaignListItem[]> {
	const query = new URLSearchParams({
		limit: String(limit),
		offset: String(offset),
	});
	return request<CampaignListItem[]>(`/campaigns/?${query.toString()}`);
}

export async function getCampaign(id: string): Promise<CampaignResponse> {
	return request<CampaignResponse>(`/campaigns/${encodeURIComponent(id)}`);
}

export async function createCampaign(
	data: CampaignCreate,
): Promise<{ id: string; status: string }> {
	return request<{ id: string; status: string }>("/campaigns/", {
		method: "POST",
		body: JSON.stringify(data),
	});
}

export async function createCampaignWithFile(
	formData: FormData,
): Promise<{ id: string; status: string }> {
	const response = await fetch(`${MAIL_SERVICE_URL}/campaigns/`, {
		method: "POST",
		headers: authHeaders(),
		body: formData,
	});

	if (response.status === 401) {
		clearAdminToken();
		window.location.reload();
		throw new Error("Unauthorized");
	}

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Mail service request failed: ${response.status} ${errorText}`,
		);
	}

	return (await response.json()) as { id: string; status: string };
}

export async function updateCampaign(
	id: string,
	data: CampaignUpdate,
): Promise<CampaignResponse> {
	return request<CampaignResponse>(`/campaigns/${encodeURIComponent(id)}`, {
		method: "PUT",
		body: JSON.stringify(data),
	});
}

export async function triggerCampaign(
	id: string,
): Promise<TriggerStartResponse> {
	return request<TriggerStartResponse>(
		`/campaigns/${encodeURIComponent(id)}/trigger`,
		{ method: "POST" },
	);
}

export async function getCampaignProgress(
	id: string,
): Promise<ExecutionProgress> {
	return request<ExecutionProgress>(
		`/campaigns/${encodeURIComponent(id)}/progress`,
	);
}

export async function sendTestMail(
	data: TestMailRequest,
): Promise<TestMailResponse> {
	return request<TestMailResponse>("/campaigns/test-send", {
		method: "POST",
		body: JSON.stringify(data),
	});
}
