import { motion } from "motion/react";
import type React from "react";
import { TeamScrollBackground } from "@/pages/Team/TeamScrollBackground";
import { OrganizerCard } from "../../components/features/OrganizerCard";
import { TeamMemberCard } from "../../components/features/TeamMemberCard";
import { Navigation } from "../../components/layout/Navigation";
import { teamMembers } from "./team.data";

export const TeamPage: React.FC = () => {
	const leaders = teamMembers.filter(
		(m) => m.role === "organizer" || m.role === "co-organizer",
	);
	const organizationTeam = teamMembers.filter(
		(m) =>
			m.team === "organization" &&
			m.role !== "organizer" &&
			m.role !== "co-organizer",
	);
	const marketingTeam = teamMembers.filter(
		(m) =>
			m.team === "marketing" &&
			m.role !== "organizer" &&
			m.role !== "co-organizer",
	);
	const sponsorshipTeam = teamMembers.filter(
		(m) =>
			m.team === "sponsorship" &&
			m.role !== "organizer" &&
			m.role !== "co-organizer",
	);
	const softwareTeam = teamMembers.filter(
		(m) =>
			m.team === "software" &&
			m.role !== "organizer" &&
			m.role !== "co-organizer",
	);

	return (
		<div className="min-h-screen flex flex-col bg-[#0a0a0a] relative">
			<TeamScrollBackground />

			<Navigation />

			<main className="flex-1 relative z-10 w-full overflow-x-hidden">
				{/* Organizers Section */}
				<section
					className="min-h-[calc(100dvh-74px)] snap-start w-full flex items-center justify-center relative overflow-visible py-12 md:py-16"
					data-team-tone="organizers"
				>
					<div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 w-full">
						<div className="flex flex-col items-center mb-12 sm:mb-20 text-center px-2">
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
								transition={{
									duration: 0.8,
									delay: 0.1,
									type: "spring",
									bounce: 0.35,
								}}
								className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white m-0 uppercase break-words"
							>
								ORGANIZERS
							</motion.h2>
						</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 max-w-[850px] mx-auto justify-items-center items-start px-2 sm:px-0">
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
						<div
							className="min-h-[calc(100dvh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-visible"
							data-team-tone="organization"
						>
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2] px-2">
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
									transition={{
										duration: 0.8,
										delay: 0.1,
										type: "spring",
										bounce: 0.35,
									}}
									className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase break-words"
								>
									ORGANIZATION
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-3 sm:px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{organizationTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard
												key={member.id}
												member={member}
												index={idx}
											/>
										))}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 max-w-7xl mx-auto w-full">
									{organizationTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div
												key={member.id}
												className="w-full max-w-[170px] justify-self-center"
											>
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Marketing Team */}
						<div
							className="min-h-[calc(100dvh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-visible"
							data-team-tone="marketing"
						>
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2] px-2">
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
									transition={{
										duration: 0.8,
										delay: 0.1,
										type: "spring",
										bounce: 0.35,
									}}
									className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase break-words"
								>
									MARKETING
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-3 sm:px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{marketingTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard
												key={member.id}
												member={member}
												index={idx}
											/>
										))}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 max-w-7xl mx-auto w-full">
									{marketingTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div
												key={member.id}
												className="w-full max-w-[170px] justify-self-center"
											>
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Sponsorship Team */}
						<div
							className="min-h-[calc(100dvh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-visible"
							data-team-tone="sponsorship"
						>
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2] px-2">
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
									transition={{
										duration: 0.8,
										delay: 0.1,
										type: "spring",
										bounce: 0.35,
									}}
									className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase break-words"
								>
									SPONSORSHIP
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-3 sm:px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{sponsorshipTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard
												key={member.id}
												member={member}
												index={idx}
											/>
										))}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 max-w-7xl mx-auto w-full">
									{sponsorshipTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div
												key={member.id}
												className="w-full max-w-[170px] justify-self-center"
											>
												<TeamMemberCard member={member} index={idx + 1} />
											</div>
										))}
								</div>
							</div>
						</div>

						{/* Software Team */}
						<div
							className="min-h-[calc(100dvh-74px)] snap-start w-full flex flex-col py-12 md:py-16 hover-trigger relative bg-transparent overflow-visible"
							data-team-tone="software"
						>
							<div className="flex flex-col items-center mb-8 md:mb-12 text-center relative z-[2] px-2">
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
									transition={{
										duration: 0.8,
										delay: 0.1,
										type: "spring",
										bounce: 0.35,
									}}
									className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tighter text-white m-0 uppercase break-words"
								>
									SOFTWARE
								</motion.h2>
							</div>
							<div className="flex-1 flex flex-col justify-center px-3 sm:px-4 z-[2] max-w-7xl mx-auto w-full">
								<div className="flex justify-center mb-6 md:mb-10 items-center justify-items-center">
									{softwareTeam
										.filter((m) => m.role === "team_lead")
										.map((member, idx) => (
											<TeamMemberCard
												key={member.id}
												member={member}
												index={idx}
											/>
										))}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 max-w-7xl mx-auto w-full">
									{softwareTeam
										.filter((m) => m.role === "member")
										.map((member, idx) => (
											<div
												key={member.id}
												className="w-full max-w-[170px] justify-self-center"
											>
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
