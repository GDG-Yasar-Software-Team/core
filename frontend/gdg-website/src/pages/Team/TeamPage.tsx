import type React from "react";
import { motion } from "motion/react";
import FlowingMenu from "../../components/features/FlowingMenu";
import LightPillar from "../../components/features/LightPillar";
import { TeamMemberCard } from "../../components/features/TeamMemberCard";
import { OrganizerCard } from "../../components/features/OrganizerCard";
import { Footer } from "../../components/layout/Footer";
import { Navigation } from "../../components/layout/Navigation";
import { teamMembers } from "./team.data";

export const TeamPage: React.FC = () => {
	const leaders = teamMembers.filter((m) => m.role === "leader");
	const organizationTeam = teamMembers.filter((m) => m.team === "organization");
	const marketingTeam = teamMembers.filter((m) => m.team === "marketing");
	const sponsorshipTeam = teamMembers.filter((m) => m.team === "sponsorship");
	const softwareTeam = teamMembers.filter((m) => m.team === "software");

	// Team menu items with matching colors and icons
	const teamMenus = [
		{
			items: [
				{
					link: "#",
					text: "ORGANIZATION TEAM",
					image:
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📋%3C/text%3E%3C/svg%3E",
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
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E📱%3C/text%3E%3C/svg%3E",
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
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💼%3C/text%3E%3C/svg%3E",
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
						"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='75' font-size='75'%3E💻%3C/text%3E%3C/svg%3E",
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
		<div className="h-[100dvh] w-full overflow-y-auto overflow-x-hidden snap-y snap-mandatory scroll-smooth flex flex-col">
			<Navigation />

			<main className="flex-1">
				{/* Organizers Section */}
				<section className="snap-start snap-always h-[100dvh] w-full flex items-center justify-center relative overflow-hidden bg-[#0a0a0a] pt-20">
					{/* Geometric Background Elements from organizers-background */}
					<div className="absolute inset-0 pointer-events-none overflow-hidden">
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

					<div className="max-w-[1240px] mx-auto px-6 relative z-10 w-full">
						<div className="flex flex-col items-center mb-20 text-center">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.6, ease: "easeOut" }}
								className="mb-6"
							>
								<span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-[0.3em] font-medium text-gray-400 backdrop-blur-sm">
									Leadership
								</span>
							</motion.div>
							
							<motion.h2 
								initial={{ opacity: 0, scale: 0.95 }}
								whileInView={{ opacity: 1, scale: 1 }}
								viewport={{ once: true }}
								transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
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

				<section className="p-0 bg-white">
					<div className="max-w-full p-0 flex flex-col w-full">
						{/* Organization Team */}
						<div className="snap-start snap-always h-[100dvh] w-full flex flex-col py-16 transition-[background] duration-[600ms] relative bg-white overflow-hidden [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#EA4335_100%)]">
							<LightPillar
								topColor="#EA4335"
								bottomColor="#FF6B6B"
								intensity={1.5}
								rotationSpeed={0.2}
								glowAmount={0.01}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="low"
							/>
							<div className="h-[120px] flex-shrink-0 relative z-[2]">
								<FlowingMenu {...teamMenus[0]} speed={15} />
							</div>
							<div className="flex-1 flex flex-col justify-center px-6 z-[2]">
								<div className="flex justify-center mb-10 items-center justify-items-center">
									{organizationTeam
										.filter((m) => m.role === "team-leader")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 1} />
												</div>
											))}
									</div>
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{organizationTeam
											.filter((m) => m.role === "member")
											.slice(3, 6)
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 4} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						{/* Marketing Team */}
						<div className="snap-start snap-always h-[100dvh] w-full flex flex-col py-16 transition-[background] duration-[600ms] relative bg-white overflow-hidden [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#FBBC05_100%)]">
							<LightPillar
								topColor="#FBBC05"
								bottomColor="#FFD700"
								intensity={1.5}
								rotationSpeed={0.2}
								glowAmount={0.01}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="low"
							/>
							<div className="h-[120px] flex-shrink-0 relative z-[2]">
								<FlowingMenu {...teamMenus[1]} speed={15} />
							</div>
							<div className="flex-1 flex flex-col justify-center px-6 z-[2]">
								<div className="flex justify-center mb-10 items-center justify-items-center">
									{marketingTeam
										.filter((m) => m.role === "team-leader")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[950px]">
										{marketingTeam
											.filter((m) => m.role === "member")
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 1} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						{/* Sponsorship Team */}
						<div className="snap-start snap-always h-[100dvh] w-full flex flex-col py-16 transition-[background] duration-[600ms] relative bg-white overflow-hidden [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#4285F4_100%)]">
							<LightPillar
								topColor="#4285F4"
								bottomColor="#64B5F6"
								intensity={1.5}
								rotationSpeed={0.2}
								glowAmount={0.01}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="low"
							/>
							<div className="h-[120px] flex-shrink-0 relative z-[2]">
								<FlowingMenu {...teamMenus[2]} speed={15} />
							</div>
							<div className="flex-1 flex flex-col justify-center px-6 z-[2]">
								<div className="flex justify-center mb-10 items-center justify-items-center">
									{sponsorshipTeam
										.filter((m) => m.role === "team-leader")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{sponsorshipTeam
											.filter((m) => m.role === "member")
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 1} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>

						{/* Software Team */}
						<div className="snap-start snap-always h-[100dvh] w-full flex flex-col py-16 transition-[background] duration-[600ms] relative bg-white overflow-hidden [background:radial-gradient(circle_at_center,rgba(255,255,255,0)_0%,rgba(255,255,255,0)_30%,#34A853_100%)]">
							<LightPillar
								topColor="#34A853"
								bottomColor="#66BB6A"
								intensity={1.5}
								rotationSpeed={0.2}
								glowAmount={0.01}
								pillarWidth={2.0}
								pillarHeight={0.5}
								noiseIntensity={0.2}
								pillarRotation={25}
								interactive={false}
								mixBlendMode="screen"
								quality="low"
							/>
							<div className="h-[120px] flex-shrink-0 relative z-[2]">
								<FlowingMenu {...teamMenus[3]} speed={15} />
							</div>
							<div className="flex-1 flex flex-col justify-center px-6 z-[2]">
								<div className="flex justify-center mb-10 items-center justify-items-center">
									{softwareTeam
										.filter((m) => m.role === "team-leader")
										.map((member, idx) => (
											<TeamMemberCard key={member.id} member={member} index={idx} />
										))}
								</div>
								<div className="flex flex-col gap-4 items-center">
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(0, 3)
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 1} />
												</div>
											))}
									</div>
									<div className="flex justify-center gap-4 flex-wrap max-w-[700px]">
										{softwareTeam
											.filter((m) => m.role === "member")
											.slice(3, 5)
											.map((member, idx) => (
												<div key={member.id} className="flex-[0_0_auto] w-[180px] lg:w-[200px] min-w-0">
													<TeamMemberCard member={member} index={idx + 4} />
												</div>
											))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>

			<div className="snap-end w-full shrink-0">
				<Footer />
			</div>
		</div>
	);
};

export default TeamPage;
