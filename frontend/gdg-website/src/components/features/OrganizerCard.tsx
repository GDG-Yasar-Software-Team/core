import type React from "react";
import { motion } from "motion/react";
import type { TeamMember } from "../../types";

export interface OrganizerCardProps {
	member: TeamMember;
	index: number;
}

const LinkedinIcon = () => (
	<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
		<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
	</svg>
);

export const OrganizerCard: React.FC<OrganizerCardProps> = ({ member, index }) => {
	const linkedinUrl = member.socialLinks.find((l) => l.platform === "linkedin")?.url || "#";

	return (
		<motion.div
			key={member.name}
			initial={{ opacity: 0, y: 100, scale: 0.8 }}
			whileInView={{ opacity: 1, y: 0, scale: 1 }}
			viewport={{ once: false, amount: 0.2 }}
			transition={{ duration: 0.8, delay: index * 0.15, type: "spring", bounce: 0.35 }}
			className="flex flex-col items-center group w-full"
		>
			<div className="relative mb-8">
				{/* Image Container with Glow */}
				<div 
					className="absolute -inset-4 bg-gradient-to-tr from-purple-500/20 to-blue-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
				/>
				<div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-white/10 relative z-10 group-hover:border-white/30 transition-colors duration-300">
					<img
						src={member.photoUrl}
						alt={member.name}
						className="w-full h-full object-cover transition-all duration-700 scale-110 group-hover:scale-100"
						referrerPolicy="no-referrer"
					/>
				</div>
			</div>

			<div className="text-center space-y-1">
				<h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-200 group-hover:text-white transition-colors">
					{member.name}
				</h3>
				<p className="text-sm md:text-base text-gray-500 font-medium tracking-wide">
					{member.title}
				</p>
			</div>

			<motion.a
				href={linkedinUrl}
				target="_blank"
				rel="noopener noreferrer"
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="mt-6 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-[#0077b5]"
				aria-label={`${member.name}'s LinkedIn`}
			>
				<LinkedinIcon />
			</motion.a>
		</motion.div>
	);
};
