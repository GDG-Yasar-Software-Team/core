/**
 * Event Service - API client for event microservice
 */

import type { Event } from '../types';

const API_BASE_URL = import.meta.env.VITE_EVENT_SERVICE_URL || 'http://localhost:8003';
const API_TOKEN = import.meta.env.VITE_EVENT_SERVICE_TOKEN || '';

/**
 * Fetch all events from the backend
 */
export async function fetchEvents(limit = 100, offset = 0): Promise<Event[]> {
	try {
		const url = new URL(`${API_BASE_URL}/events`);
		url.searchParams.append('limit', limit.toString());
		url.searchParams.append('offset', offset.toString());

		const response = await fetch(url.toString(), {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': API_TOKEN,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch events: ${response.statusText}`);
		}

		const events: Event[] = await response.json();
		return events;
	} catch (error) {
		console.error('Error fetching events:', error);
		throw error;
	}
}

/**
 * Fetch a single event by ID
 */
export async function fetchEventById(eventId: string): Promise<Event> {
	try {
		const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': API_TOKEN,
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch event: ${response.statusText}`);
		}

		const event: Event = await response.json();
		return event;
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
	return date.toLocaleDateString('en-US', { 
		month: 'long', 
		day: 'numeric',
		year: 'numeric' 
	});
}

/**
 * Helper function to extract city from place field
 */
export function extractCity(place: string): string {
	const parts = place.split(',');
	return parts[1]?.trim() || 'İzmir, TR';
}

/**
 * Helper function to extract location from place field
 */
export function extractLocation(place: string): string {
	const parts = place.split(',');
	return parts[0]?.trim() || place;
}
