/**
 * Event Service - API client for event microservice
 */

import type { Event } from "../types";

const API_BASE_URL =
	import.meta.env.VITE_EVENT_SERVICE_URL || "http://localhost:8003";

function getOptionalString(value: unknown): string | undefined {
	return typeof value === "string" && value.trim().length > 0
		? value
		: undefined;
}

function normalizeEvent(rawEvent: unknown): Event {
	const e = rawEvent as Record<string, unknown>;

	const speakers = Array.isArray(e.speakers) ? e.speakers : [];
	const tags = Array.isArray(e.tags) ? e.tags : [];

	return {
		id: String(e.id ?? ""),
		title: String(e.title ?? ""),
		description: String(e.description ?? ""),
		date: String(e.date ?? ""),
		place: String(e.place ?? ""),
		image_url: getOptionalString(e.image_url ?? e.imageUrl),
		event_type: getOptionalString(e.event_type ?? e.eventType),
		registration_form_url: getOptionalString(
			e.registration_form_url ??
				e.registrationFormUrl ??
				e.registration_url ??
				e.form_url,
		),
		speakers: speakers as Event["speakers"],
		tags: tags as string[],
	};
}

/**
 * Fetch all events from the backend
 */
export async function fetchEvents(limit = 100, offset = 0): Promise<Event[]> {
	try {
		const url = new URL("/events", API_BASE_URL);
		url.searchParams.append("limit", limit.toString());
		url.searchParams.append("offset", offset.toString());

		const response = await fetch(url.toString(), {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch events: ${response.statusText}`);
		}

		const payload: unknown = await response.json();
		const events = Array.isArray(payload)
			? payload.map((event) => normalizeEvent(event))
			: [];
		return events;
	} catch (error) {
		console.error("Error fetching events:", error);
		throw error;
	}
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(eventId: string): Promise<Event> {
	try {
		const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch event: ${response.statusText}`);
		}

		const payload: unknown = await response.json();
		return normalizeEvent(payload);
	} catch (error) {
		console.error(`Error fetching event ${eventId}:`, error);
		throw error;
	}
}

/**
 * Helper function to check if an event is in the past
 */
export function isEventPast(event: Event): boolean {
	const eventDate = new Date(event.date);
	const now = new Date();
	return eventDate < now;
}

/**
 * Helper function to format event date for display
 */
export function formatEventDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleDateString("en-US", {
		month: "long",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Helper function to extract city from place field
 */
export function extractCity(place: string): string {
	const parts = place.split(",");
	return parts[1]?.trim() || "Izmir, TR";
}

/**
 * Helper function to extract location from place field
 */
export function extractLocation(place: string): string {
	const parts = place.split(",");
	return parts[0]?.trim() || place;
}
