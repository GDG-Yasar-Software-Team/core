/**
 * Type definitions for GDG on Campus Yaşar University Website
 * These interfaces define the data models used throughout the application
 */

/**
 * Speaker information for events
 */
export interface Speaker {
	id: string;
	name: string;
	title: string;
	avatarUrl: string;
	bio?: string;
}

/**
 * Event model representing workshops, hackathons, talks, and meetups
 */
export interface Event {
	id: string;
	title: string;
	description: string;
	date: string;
	location: string;
	city: string;
	type: string;
	imageUrl: string;
	tags: string[];
	isPast: boolean;
	time?: string;
	featured?: boolean;
	speakers?: Speaker[];
	rsvpUrl?: string;
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
	team: "leadership" | "organization" | "marketing" | "sponsorship" | "software" | "technical" | "operations" | "design";
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
