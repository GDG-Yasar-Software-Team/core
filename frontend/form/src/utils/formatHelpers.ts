export function formatDateTime(value: string | undefined): string {
	if (!value) {
		return "-";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return value;
	}

	return new Intl.DateTimeFormat("tr-TR", {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
}

export function formatAnswer(value: unknown): string {
	if (value === null || value === undefined) {
		return "-";
	}

	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : "-";
	}

	if (typeof value === "number") {
		return String(value);
	}

	if (typeof value === "boolean") {
		return value ? "Evet" : "Hayır";
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return "-";
		}
		return value.map((item) => formatAnswer(item)).join(", ");
	}

	try {
		return JSON.stringify(value);
	} catch {
		return "-";
	}
}
