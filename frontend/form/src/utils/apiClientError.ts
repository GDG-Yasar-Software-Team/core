/**
 * Thrown when a fetch to our API returns a non-OK status.
 * `detail` is FastAPI's `detail` field (string, object with `code`, or validation list).
 */
export class ApiClientError extends Error {
	readonly status: number;
	readonly detail: unknown;

	constructor(status: number, detail: unknown) {
		super("ApiClientError");
		this.name = "ApiClientError";
		this.status = status;
		this.detail = detail;
	}
}

export function unwrapFastApiDetail(body: unknown): unknown {
	if (body && typeof body === "object" && "detail" in body) {
		return (body as { detail: unknown }).detail;
	}
	return body;
}

export function getErrorCode(detail: unknown): string | undefined {
	if (
		detail &&
		typeof detail === "object" &&
		!Array.isArray(detail) &&
		"code" in detail &&
		typeof (detail as { code: unknown }).code === "string"
	) {
		return (detail as { code: string }).code;
	}
	return undefined;
}

/** Read error body and throw ApiClientError if response is not OK. */
export async function throwIfNotOk(response: Response): Promise<void> {
	if (response.ok) {
		return;
	}
	const text = await response.text();
	let parsed: unknown;
	try {
		parsed = text ? JSON.parse(text) : null;
	} catch {
		parsed = text;
	}
	const detail = unwrapFastApiDetail(parsed);
	throw new ApiClientError(response.status, detail);
}
