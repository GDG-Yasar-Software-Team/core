export interface Event {
	id: string;
	title: string;
	date: string;
	location: string;
	city: string;
	type: string;
	description: string;
	imageUrl: string;
	tags: string[];
	isPast?: boolean;
}
