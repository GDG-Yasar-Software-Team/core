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
	speakers: Speaker[];
	image_url: string | null;
	created_at: string; // ISO datetime string
	updated_at: string | null; // ISO datetime string
}

/**
 * Social media platform types
 */
export type SocialPlatform =
	| "linkedin"
	| "github"
	| "twitter"
	| "instagram"
	| "website";

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
	title: string;
	role: "leader" | "team-leader" | "core" | "member";
	team:
		| "leadership"
		| "organization"
		| "marketing"
		| "sponsorship"
		| "software"
		| "technical"
		| "operations"
		| "design";
	photoUrl: string;
	bio?: string;
	socialLinks: SocialLink[];
}

/**
 * FAQ (Frequently Asked Questions) model
 */
export interface FAQ {
	id: string;
	question: string;
	answer: string;
	category?: string;
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
