import type { Event } from "../types";

export const events: Event[] = [
	{
		id: "intro-to-react-2024",
		title: "Introduction to React",
		description:
			"Learn the fundamentals of React including components, hooks, and state management. Perfect for beginners!",
		date: "2024-04-15T14:00:00Z",
		time: "14:00",
		location: "Yaşar University, Engineering Building Room 301",
		type: "workshop",
		status: "upcoming",
		featured: true,
		speakers: [
			{
				id: "speaker-1",
				name: "Ahmet Yılmaz",
				title: "Senior Frontend Developer",
				avatarUrl: "https://i.pravatar.cc/150?img=12",
			},
		],
		rsvpUrl:
			"https://gdg.community.dev/events/details/google-gdg-on-campus-yasar-university-izmir-turkey-presents-intro-to-react/",
		imageUrl:
			"https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
	},
	{
		id: "cloud-computing-basics",
		title: "Cloud Computing with Google Cloud",
		description:
			"Explore cloud computing fundamentals and get hands-on experience with Google Cloud Platform services.",
		date: "2024-04-22T15:00:00Z",
		time: "15:00",
		location: "Yaşar University, Computer Lab B",
		type: "workshop",
		status: "upcoming",
		featured: false,
		speakers: [
			{
				id: "speaker-2",
				name: "Zeynep Kaya",
				title: "Cloud Solutions Architect",
				avatarUrl: "https://i.pravatar.cc/150?img=45",
			},
		],
		rsvpUrl: "https://gdg.community.dev/",
		imageUrl:
			"https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
	},
	{
		id: "spring-hackathon-2024",
		title: "Spring Hackathon 2024",
		description:
			"48-hour hackathon focused on building solutions for sustainability. Form teams and compete for prizes!",
		date: "2024-05-10T09:00:00Z",
		time: "09:00",
		location: "Yaşar University, Innovation Center",
		type: "hackathon",
		status: "upcoming",
		featured: false,
		speakers: [],
		rsvpUrl: "https://gdg.community.dev/",
		imageUrl:
			"https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800",
	},
	{
		id: "ai-ml-workshop",
		title: "Introduction to Machine Learning",
		description:
			"Discover the basics of machine learning and build your first ML model using TensorFlow.",
		date: "2024-03-10T14:00:00Z",
		time: "14:00",
		location: "Yaşar University, Engineering Building Room 205",
		type: "workshop",
		status: "past",
		featured: false,
		speakers: [
			{
				id: "speaker-3",
				name: "Mehmet Demir",
				title: "AI Research Engineer",
				avatarUrl: "https://i.pravatar.cc/150?img=33",
			},
		],
		imageUrl: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800",
	},
	{
		id: "web-dev-fundamentals",
		title: "Web Development Fundamentals",
		description:
			"Learn HTML, CSS, and JavaScript basics to start your web development journey.",
		date: "2024-02-20T13:00:00Z",
		time: "13:00",
		location: "Yaşar University, Computer Lab A",
		type: "workshop",
		status: "past",
		featured: false,
		speakers: [
			{
				id: "speaker-4",
				name: "Ayşe Şahin",
				title: "Full Stack Developer",
				avatarUrl: "https://i.pravatar.cc/150?img=47",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
	},
	{
		id: "tech-career-talk",
		title: "Building a Career in Tech",
		description:
			"Industry professionals share insights on career paths, interview tips, and professional development.",
		date: "2024-03-05T16:00:00Z",
		time: "16:00",
		location: "Yaşar University, Conference Hall",
		type: "talk",
		status: "past",
		featured: false,
		speakers: [
			{
				id: "speaker-5",
				name: "Can Öztürk",
				title: "Engineering Manager",
				avatarUrl: "https://i.pravatar.cc/150?img=68",
			},
			{
				id: "speaker-6",
				name: "Elif Yıldız",
				title: "Product Manager",
				avatarUrl: "https://i.pravatar.cc/150?img=44",
			},
		],
		imageUrl:
			"https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
	},
];
