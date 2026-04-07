import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

export interface NavigationProps {
	className?: string;
}

const navLinks = [
	{ path: "/team", label: "Team" },
	{ path: "/about", label: "About" },
	{ path: "/upcoming-events", label: "Upcoming Events" },
];

export const Navigation: React.FC<NavigationProps> = ({ className = "" }) => {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const location = useLocation();

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen((prev) => !prev);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Escape" && isMobileMenuOpen) {
			closeMobileMenu();
		}
	};

	return (
		<nav
			className={`sticky top-0 w-full z-[1000] bg-white shadow-[0_1px_2px_0_rgba(60,64,67,0.3),0_1px_3px_1px_rgba(60,64,67,0.15)] border-b border-[#e8eaed] ${className}`}
			aria-label="Main navigation"
		>
			<div className="w-full px-4 md:px-8 py-3 flex items-center justify-between md:justify-start">
				<Link
					to="/"
					className="flex items-center gap-2 sm:gap-3 text-[#5f6368] no-underline transition-opacity duration-200 hover:opacity-80 shrink min-w-0"
				>
					<img
						src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/core/refs/heads/main/frontend/form/public/gdg-logo.png"
						alt="GDG Logo"
						className="w-10 h-10 sm:w-12 sm:h-12 object-contain shrink-0"
					/>
					<span className="sm:hidden text-sm font-medium truncate">
						GDG Yaşar
					</span>
					<span className="hidden sm:inline text-sm md:text-lg font-medium truncate">
						GDG on Campus Yaşar University
					</span>
				</Link>

				{/* Desktop Navigation */}
				<ul className="hidden md:flex list-none m-0 p-0 gap-6 md:ml-12">
					{navLinks.map((link) => (
						<li key={link.path}>
							<Link
								to={link.path}
								className={`relative no-underline text-sm font-medium px-2 py-1 mx-2 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#4285f4] focus-visible:outline-offset-2 group ${
									location.pathname === link.path
										? "text-[#1a73e8]"
										: "text-[#5f6368] hover:text-[#1a73e8]"
								}`}
							>
								{link.label}
								<span className="absolute left-0 -bottom-1 w-full h-[2px] bg-[#1a73e8] rounded-full transition-transform duration-300 origin-left scale-x-0 group-hover:scale-x-100" />
							</Link>
						</li>
					))}
				</ul>

				{/* Mobile Menu Button */}
				<button
					type="button"
					className="flex md:hidden flex-col gap-1.5 bg-transparent border-none cursor-pointer p-2 rounded hover:bg-[#f1f3f4] focus-visible:outline-2 focus-visible:outline-[#4285f4] focus-visible:outline-offset-2"
					onClick={toggleMobileMenu}
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
					aria-controls="mobile-menu"
				>
					<span className="w-6 h-0.5 bg-[#5f6368] rounded-sm" />
					<span className="w-6 h-0.5 bg-[#5f6368] rounded-sm" />
					<span className="w-6 h-0.5 bg-[#5f6368] rounded-sm" />
				</button>
			</div>

			{/* Mobile Menu Drawer */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<>
						<motion.div
							className="fixed inset-0 bg-black/50 z-[999]"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={closeMobileMenu}
						/>
						<motion.div
							id="mobile-menu"
							className="fixed top-0 right-0 bottom-0 w-[280px] bg-white shadow-[0_8px_10px_1px_rgba(0,0,0,0.14),0_3px_14px_2px_rgba(0,0,0,0.12),0_5px_5px_-3px_rgba(0,0,0,0.2)] z-[1000] p-6"
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "tween", duration: 0.3 }}
							onKeyDown={handleKeyDown}
						>
							<ul className="list-none m-0 p-0 flex flex-col gap-1">
								{navLinks.map((link) => (
									<li key={link.path}>
										<Link
											to={link.path}
											className={`block no-underline text-sm font-medium py-3 px-4 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-[#4285f4] focus-visible:outline-offset-2 rounded-lg ${
												location.pathname === link.path
													? "text-[#1a73e8] bg-[#f8f9fa]"
													: "text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#f8f9fa]"
											}`}
											onClick={closeMobileMenu}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</nav>
	);
};
