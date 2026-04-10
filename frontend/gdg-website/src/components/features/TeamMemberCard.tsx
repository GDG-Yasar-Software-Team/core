import { motion } from "motion/react";
import type React from "react";
import type { TeamMember } from "../../types";

export interface TeamMemberCardProps {
	member: TeamMember;
	className?: string;
	index?: number;
}

const getSocialIcon = (platform: string) => {
	if (platform === "linkedin") {
		return (
			<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
			</svg>
		);
	}
	return null;
};

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
	member,
	className = "",
	index = 0,
}) => {
	const isLeader =
		member.role === "organizer" || member.role === "co-organizer";
	const isTeamLeader = member.role === "team_lead";

	const nameClass =
		isLeader || isTeamLeader
			? "text-[length:var(--font-size-lg)]"
			: "text-[length:var(--font-size-md)]";

	const memberTitleClass =
		isLeader || isTeamLeader
			? "text-[length:var(--font-size-md)]"
			: "text-[length:var(--font-size-sm)]";

	const displayTitle = member.title ?? "Team Member";

	return (
		<motion.div
			initial={{ opacity: 0, y: 100, scale: 0.8 }}
			whileInView={{ opacity: 1, y: 0, scale: 1 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{
				duration: 0.8,
				delay: index * 0.1,
				type: "spring",
				bounce: 0.35,
			}}
			className={`flex min-w-0 w-full flex-col items-center bg-transparent rounded-[var(--border-radius-md)] px-1 py-3 sm:px-4 sm:py-6 shadow-none transition-none hover:shadow-none hover:translate-y-0 hover:bg-transparent text-white ${className}`}
			data-role={member.role}
		>
			<div className="relative mb-3 sm:mb-4 group">
				<div className="absolute -inset-2 bg-gradient-to-tr from-current to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
				<div
					className={`relative z-10 rounded-full overflow-hidden bg-black/5 border-2 border-transparent group-hover:border-current transition-colors duration-300 ${isTeamLeader ? "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36" : "w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32"}`}
				>
					<img
						src={member.photoUrl}
						alt={member.name}
						loading="lazy"
						decoding="async"
						className="w-full h-full object-contain object-center transition-all duration-700  group-hover:scale-100"
					/>
				</div>
			</div>
			<h3
				className={`font-bold text-gray-200 group-hover:text-white transition-colors mb-1 m-0 text-center mt-2 sm:mt-4 leading-tight break-words ${nameClass}`}
			>
				{member.name}
			</h3>
			<p
				className={`${memberTitleClass} text-gray-400 group-hover:text-gray-300 transition-colors mb-2 m-0 text-center tracking-wide leading-tight`}
			>
				{displayTitle}
			</p>

			{member.socialLinks.length > 0 && (
				<div className="flex gap-2 mt-1 sm:mt-2">
					{member.socialLinks.map((link) => (
						<a
							key={link.platform}
							href={link.url}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-1 sm:mt-2 p-1.5 sm:p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-[#0077b5]"
							aria-label={`${member.name}'s ${link.platform}`}
						>
							{getSocialIcon(link.platform)}
						</a>
					))}
				</div>
			)}
		</motion.div>
	);
};
