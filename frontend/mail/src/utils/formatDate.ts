import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

const ISO_WITH_TIMEZONE_REGEX = /(Z|[+-]\d{2}:\d{2})$/;

function safeParse(iso: string): Date | null {
	if (!ISO_WITH_TIMEZONE_REGEX.test(iso)) {
		return null;
	}
	const date = parseISO(iso);
	return isValid(date) ? date : null;
}

export function formatDateTime(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "--";
	return format(date, "dd MMM yyyy HH:mm", { locale: tr });
}

export function formatDateShort(iso: string): string {
	const date = safeParse(iso);
	if (!date) return "--";
	return format(date, "dd MMM yyyy", { locale: tr });
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
