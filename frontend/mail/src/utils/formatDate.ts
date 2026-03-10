import { format, formatDistanceToNow, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

export function formatDateTime(iso: string): string {
	return format(parseISO(iso), "dd MMM yyyy HH:mm", { locale: tr });
}

export function formatDateShort(iso: string): string {
	return format(parseISO(iso), "dd MMM yyyy", { locale: tr });
}

export function formatRelative(iso: string): string {
	return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: tr });
}

export function toLocalDatetimeValue(iso: string): string {
	const date = parseISO(iso);
	const offset = date.getTimezoneOffset();
	const local = new Date(date.getTime() - offset * 60_000);
	return local.toISOString().slice(0, 16);
}

export function fromLocalDatetimeValue(local: string): string {
	return new Date(local).toISOString();
}
