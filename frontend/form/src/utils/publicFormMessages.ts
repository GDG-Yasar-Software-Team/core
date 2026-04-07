import type { FormLoadErrorKind } from "../hooks/useFormDetails";
import { ApiClientError, getErrorCode } from "./apiClientError";

const SUPPORT_EMAIL =
	import.meta.env.VITE_SUPPORT_EMAIL || "gdgoncampus.yu@gmail.com";

export function getSupportEmail(): string {
	return SUPPORT_EMAIL;
}

export interface FormLoadMessages {
	title: string;
	description: string;
	showContact: boolean;
}

/** Centralized copy for public form load failures (FormSubmissionPage). */
export const publicFormLoadMessages = {
	notFound: {
		title: "Form bulunamadı",
		description:
			"Aradığınız form mevcut değil veya kaldırılmış olabilir. Lütfen bağlantıyı kontrol edin.",
		showContact: false,
	},
	unavailable: {
		title: "Şu anda ulaşılamıyor",
		description:
			"Form geçici olarak yüklenemiyor. Lütfen birkaç dakika sonra tekrar deneyin.",
		showContact: true,
	},
} as const satisfies Record<"notFound" | "unavailable", FormLoadMessages>;

export function messagesForFormLoadError(
	kind: FormLoadErrorKind,
): FormLoadMessages {
	return kind === "not_found"
		? publicFormLoadMessages.notFound
		: publicFormLoadMessages.unavailable;
}

const SUBMIT_ERROR_MESSAGES: Record<string, string> = {
	form_not_active: "Bu form şu anda yanıt kabul etmiyor.",
	form_not_started: "Bu form henüz başlamadı.",
	form_deadline_passed: "Başvuru süresi sona erdi.",
	required_answer_incomplete: "Lütfen tüm zorunlu alanları eksiksiz doldurun.",
	invalid_form_schema:
		"Form şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
	invalid_form_id: "Geçersiz form bağlantısı.",
	form_not_found: "Form bulunamadı.",
	invalid_submission_payload:
		"Gönderdiğiniz bilgiler geçerli değil. Lütfen kontrol edip tekrar deneyin.",
	user_service_unavailable:
		"Kayıt işlemi şu anda tamamlanamadı. Lütfen bir süre sonra tekrar deneyin.",
};

const GENERIC_SUBMIT =
	"Gönderiminiz alınamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.";

/**
 * Maps API errors to safe Turkish copy for the public form submission flow.
 * Never surfaces raw JSON, HTTP status text, or field_id / regex messages.
 */
export function messageForPublicFormSubmitError(error: unknown): string {
	if (error instanceof ApiClientError) {
		const code = getErrorCode(error.detail);
		if (code && SUBMIT_ERROR_MESSAGES[code]) {
			return SUBMIT_ERROR_MESSAGES[code];
		}
		if (error.status === 404) {
			return SUBMIT_ERROR_MESSAGES.form_not_found;
		}
		if (error.status === 409) {
			return "Bu işlem şu anda tamamlanamadı. Lütfen tekrar deneyin.";
		}
		if (error.status === 422) {
			return SUBMIT_ERROR_MESSAGES.invalid_submission_payload;
		}
		if (error.status === 502) {
			return SUBMIT_ERROR_MESSAGES.user_service_unavailable;
		}
		if (error.status >= 500) {
			return "Sunucu geçici olarak yanıt veremiyor. Lütfen daha sonra tekrar deneyin.";
		}
		return GENERIC_SUBMIT;
	}
	return "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.";
}
