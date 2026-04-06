function parseJson(text: string): unknown {
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return undefined;
	}
}

function mapByCode(code: string): string | null {
	switch (code) {
		case "user_service_auth":
			return "Kullanıcı servisi kimlik doğrulaması başarısız.";
		case "user_service_timeout":
			return "Kullanıcı servisi yanıt vermedi.";
		case "user_service_error":
			return "Kullanıcı servisi hatası.";
		default:
			return null;
	}
}

/** User-facing Turkish message from mail API error response. */
export function formatMailApiError(status: number, bodyText: string): string {
	if (status === 401) {
		return "Yetkisiz: admin token geçersiz veya eksik.";
	}
	if (status === 404) {
		return "Kayıt bulunamadı.";
	}

	const raw = parseJson(bodyText);
	if (raw && typeof raw === "object" && "detail" in raw) {
		const d = (raw as { detail: unknown }).detail;
		if (typeof d === "string") {
			if (d === "Campaign not found") return "Kampanya bulunamadı.";
			if (d === "Invalid admin token") return "Geçersiz admin token.";
			return d.length > 160 ? `${d.slice(0, 157)}…` : d;
		}
		if (d && typeof d === "object" && !Array.isArray(d) && "message" in d) {
			const msg = (d as { message: unknown }).message;
			const code =
				"code" in d && typeof (d as { code: unknown }).code === "string"
					? (d as { code: string }).code
					: "";
			if (typeof msg === "string") {
				const byCode = mapByCode(code);
				return byCode ?? msg;
			}
		}
		if (Array.isArray(d)) {
			return "İstek doğrulanamadı.";
		}
	}

	if (status === 409) {
		return "Bu işlem şu an yapılamıyor (çakışma).";
	}
	if (status === 400) {
		return "Geçersiz istek.";
	}
	if (status === 422) {
		return "Gönderilen veri geçersiz.";
	}
	if (status === 502) {
		return "Kullanıcı servisine bağlanılamadı.";
	}
	if (status === 504) {
		return "Kullanıcı servisi zaman aşımına uğradı.";
	}
	if (status >= 500) {
		return "Sunucu hatası. Lütfen daha sonra tekrar deneyin.";
	}
	return `İstek başarısız (${status}).`;
}
