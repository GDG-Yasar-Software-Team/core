import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const ISO_WITH_TIMEZONE_REGEX = /(Z|[+-]\d{2}:\d{2})$/;

function safeParse(iso: string): Date | null {
	if (!iso) {
		return null;
	}

	const normalized = iso.includes(" ") ? iso.replace(" ", "T") : iso;
	if (!ISO_WITH_TIMEZONE_REGEX.test(normalized)) {
		return null;
	}
	const parsed = parseISO(normalized);
	if (isValid(parsed)) return parsed;

	const fallback = new Date(normalized);
	if (isValid(fallback)) return fallback;

	return null;
}

function formatTurkeyDate(date: Date, withTime: boolean): string {
	const formatter = new Intl.DateTimeFormat("tr-TR", {
		timeZone: "Europe/Istanbul",
		day: "2-digit",
		month: "short",
		year: "numeric",
		...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: false } : {}),
	});
	return formatter.format(date);
}

export function formatDateTime(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "--";
	return formatTurkeyDate(date, true);
}

export function formatDateShort(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "--";
	return formatTurkeyDate(date, false);
}

export function formatRelative(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "--";
	return formatDistanceToNow(date, { addSuffix: true, locale: tr });
}

export function toLocalDatetimeValue(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "";
	const offset = date.getTimezoneOffset();
	const local = new Date(date.getTime() - offset * 60_000);
	return local.toISOString().slice(0, 16);
}

export function fromLocalDatetimeValue(local: string): string {
	return new Date(local).toISOString();
}
