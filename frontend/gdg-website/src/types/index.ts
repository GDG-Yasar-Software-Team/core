/**
 * Type definitions for GDG on Campus Yaşar University Website
 * These interfaces define the data models used throughout the application
 */

/**
 * Speaker information for events (matches backend Speaker model)
 */
export interface Speaker {
	name: string;
	title: string;
	company: string;
}

/**
 * Event model (matches backend EventResponse model)
 */
export interface Event {
	id: string;
	title: string;
	description: string;
	date: string; // ISO datetime string from backend
	place: string;
	image_url?: string;
	registration_form_url?: string;
	speakers: Speaker[];
	tags: string[];
}

/**
 * Platform types for social media links
 */
export type SocialPlatform = "linkedin";

/**
 * Social media link for team members
 */
export interface SocialLink {
	platform: SocialPlatform;
	url: string;
}

/**
 * Team member model representing leadership and team members
 */
export interface TeamMember {
	id: string;
	name: string;
	title?: string;
	role: "organizer" | "co-organizer" | "team_lead" | "member";
	team: "organization" | "marketing" | "sponsorship" | "software";
	photoUrl: string;
	bio?: string;
	socialLinks: SocialLink[];
}

/**
 * Highlight model for showcasing key activities (Workshops, Hackathons, Talks)
 */
export interface Highlight {
	id: string;
	icon: string;
	title: string;
	description: string;
}
