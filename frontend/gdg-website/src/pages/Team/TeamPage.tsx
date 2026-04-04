import type React from "react";
import { motion } from "motion/react";
import FlowingMenu from "../../components/features/FlowingMenu";
import LightPillar from "../../components/features/LightPillar";
import { TeamMemberCard } from "../../components/features/TeamMemberCard";
import { OrganizerCard } from "../../components/features/OrganizerCard";
import { Navigation } from "../../components/layout/Navigation";
import { teamMembers } from "./team.data";

export const TeamPage: React.FC = () => {
	const leaders = teamMembers.filter((m) => m.role === "organizer" || m.role === "co-organizer");
	const organizationTeam = teamMembers.filter((m) => m.team === "organization" && m.role !== "organizer" && m.role !== "co-organizer");
	const marketingTeam = teamMembers.filter((m) => m.team === "marketing" && m.role !== "organizer" && m.role !== "co-organizer");
	const sponsorshipTeam = teamMembers.filter((m) => m.team === "sponsorship" && m.role !== "organizer" && m.role !== "co-organizer");
	const softwareTeam = teamMembers.filter((m) => m.team === "software" && m.role !== "organizer" && m.role !== "co-organizer");

	// Team menu items with matching colors and icons
	const teamMenus = [
		{
			items: [
				{
					link: "#",
					text: "ORGANIZATION TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3EğŸ“‹%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#ea4335",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#ea4335",
			borderColor: "transparent",
			fontClass: "marquee--font-bebas",
		},
		{
			items: [
				{
					link: "#",
					text: "MARKETING TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3EğŸ“±%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#FBBC05",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#FBBC05",
			borderColor: "transparent",
			fontClass: "marquee--font-righteous",
		},
		{
			items: [
				{
					link: "#",
					text: "SPONSORSHIP TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3EğŸ’¼%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#4285f4",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#4285f4",
			borderColor: "transparent",
			fontClass: "marquee--font-orbitron",
		},
		{
			items: [
				{
					link: "#",
					text: "SOFTWARE TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3EğŸ’»%3C/text%3E%3C/svg%3E",
				},
			],
			bgColor: "transparent",
			textColor: "#34a853",
			marqueeBgColor: "transparent",
			marqueeTextColor: "#34a853",
			borderColor: "transparent",
			fontClass: "marquee--font-bungee",
		},
	];

	return (
		<div className="min-h-screen flex flex-col bg-[#0a0a0a] relative">
			{/* Global Fixed Geometric Background */}
			<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
				{/* Top Left Shape (GDG Blue) */}
				<div 
					className="absolute -top-20 -left-20 w-[40vw] h-[40vw] bg-gradient-to-br from-[#4285F4] to-transparent rotate-12 opacity-80"
					style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 80%)' }}
				/>
				{/* Top Right Shape (GDG Red) */}
				<div 
					className="absolute -top-10 -right-10 w-[35vw] h-[35vw] bg-gradient-to-bl from-[#EA4335] to-transparent -rotate-12 opacity-80"
					style={{ clipPath: 'polygon(20% 0, 100% 0, 100% 80%, 0 100%)' }}
				/>
				{/* Bottom Left Shape (GDG Yellow) */}
				<div 
					className="absolute -bottom-10 -left-10 w-[30vw] h-[30vw] bg-gradient-to-tr from-[#FBBC04] to-transparent -rotate-6 opacity-70"
					style={{ clipPath: 'polygon(0 20%, 80% 0, 100% 100%, 0 100%)' }}
				/>
				{/* Bottom Right Shape (GDG Green) */}
				<div 
					className="absolute -bottom-20 -right-20 w-[45vw] h-[45vw] bg-gradient-to-tl from-[#34A853] to-transparent rotate-6 opacity-80"
					style={{ clipPath: 'polygon(20% 0, 100% 20%, 100% 100%, 0 80%)' }}
				/>
			</div>

			<Navigation />

			<main className="flex-1 relative z-10 w-full">
				{/* Organizers Section */}
				<section className="h-[calc(100vh-74px)] snap-start w-full flex items-center justify-center relative overflow-hidden py-12 md:py-16">

					<div className="max-w-[1240px] mx-auto px-6 relative z-10 w-full">
						<div className="flex flex-col items-center mb-20 text-center">
							<motion.div
								initial={{ opacity: 0, y: 50, scale: 0.8 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: false, amount: 0.2 }}
								transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
								className="mb-6"
							>
								<span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-medium text-gray-400 backdrop-blur-sm">
									Leadership
								</span>
							</motion.div>
							
							<motion.h2 
								initial={{ opacity: 0, y: 50, scale: 0.8 }}
								whileInView={{ opacity: 1, y: 0, scale: 1 }}
								viewport={{ once: false, amount: 0.2 }}
								transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.35 }}
								className="text-5xl md:text-7xl font-black tracking-tighter text-white m-0 uppercase"
							>
								ORGANIZERS
							</motion.h2>
						</div>
						
						<div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 max-w-[850px] mx-auto justify-items-center items-start">
							{leaders.map((member, i) => (
								<OrganizerCard key={member.id} member={member} index={i} />
							))}
						</div>
					</div>

					{/* Footer Decoration */}
					<div className="absolute bottom-10 left-1/2 -translate-x-1/2 opacity-20">
						<div className="w-px h-20 bg-gradient-to-b from-transparent via-white to-transparent" />
					</div>
				</section>

				<section className="p-0 bg-transparent">
					<div className="max-w-full p-0 flex flex-col w-full text-white">
						{/* Organization Team */}
						<div className="h-[calc(100vh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-hidden">
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2]">
								<motion.div
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
									className="mb-6"
								>
									<span className="px-4 py-1.5 rounded-full bg-[#EA4335]/20 border border-[#EA4335]/30 text-[10px] uppercase tracking-[0.3em] font-medium text-white backdrop-blur-sm">
										Team
									</span>
								</motion.div>
								
								<motion.h2 
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.35 }}
									className="text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase"
								>
									ORGANIZATION
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{organizationTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-7xl mx-auto w-full px-2">
									{organizationTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div key={member.id} className="w-[130px] sm:w-[150px] md:w-[170px] ">
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Marketing Team */}
						<div className="h-[calc(100vh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-hidden">
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2]">
								<motion.div
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
									className="mb-6"
								>
									<span className="px-4 py-1.5 rounded-full bg-[#FBBC05]/20 border border-[#FBBC05]/30 text-[10px] uppercase tracking-[0.3em] font-medium text-white backdrop-blur-sm">
										Team
									</span>
								</motion.div>
								
								<motion.h2 
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.35 }}
									className="text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase"
								>
									MARKETING
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{marketingTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-7xl mx-auto w-full px-2">
									{marketingTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div key={member.id} className="w-[130px] sm:w-[150px] md:w-[170px] ">
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Sponsorship Team */}
						<div className="h-[calc(100vh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-hidden">
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2]">
								<motion.div
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
									className="mb-6"
								>
									<span className="px-4 py-1.5 rounded-full bg-[#4285F4]/20 border border-[#4285F4]/30 text-[10px] uppercase tracking-[0.3em] font-medium text-white backdrop-blur-sm">
										Team
									</span>
								</motion.div>
								
								<motion.h2 
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.35 }}
									className="text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase"
								>
									SPONSORSHIP
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{sponsorshipTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-7xl mx-auto w-full px-2">
									{sponsorshipTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div key={member.id} className="w-[130px] sm:w-[150px] md:w-[170px] ">
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Software Team */}
						<div className="h-[calc(100vh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-hidden">
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2]">
								<motion.div
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, type: "spring", bounce: 0.35 }}
									className="mb-6"
								>
									<span className="px-4 py-1.5 rounded-full bg-[#34A853]/20 border border-[#34A853]/30 text-[10px] uppercase tracking-[0.3em] font-medium text-white backdrop-blur-sm">
										Team
									</span>
								</motion.div>
								
								<motion.h2 
									initial={{ opacity: 0, y: 50, scale: 0.8 }}
									whileInView={{ opacity: 1, y: 0, scale: 1 }}
									viewport={{ once: false, amount: 0.2 }}
									transition={{ duration: 0.8, delay: 0.1, type: "spring", bounce: 0.35 }}
									className="text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase"
								>
									SOFTWARE
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{softwareTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex justify-center gap-4 md:gap-6 flex-wrap max-w-7xl mx-auto w-full px-2">
									{softwareTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div key={member.id} className="w-[130px] sm:w-[150px] md:w-[170px] ">
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default TeamPage;




