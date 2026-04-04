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
			<div className="max-w-[1400px] w-full mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
				<Link to="/" className="flex items-center gap-3 text-lg font-medium text-[#5f6368] no-underline transition-opacity duration-200 hover:opacity-80">
					<img
						src="https://raw.githubusercontent.com/GDG-Yasar-Software-Team/core/refs/heads/main/frontend/form/public/gdg-logo.png"
						alt="GDG Logo"
						className="w-12 h-12 object-contain"
					/>
					GDG on Campus Yaşar University
				</Link>

				{/* Desktop Navigation */}
				<ul className="hidden md:flex list-none m-0 p-0 gap-2">
					{navLinks.map((link) => (
						<li key={link.path}>
							<Link
								to={link.path}
								className={`text-[#5f6368] no-underline text-sm font-medium px-4 py-2 rounded transition-colors duration-200 hover:bg-[#f1f3f4] focus-visible:outline-2 focus-visible:outline-[#4285f4] focus-visible:outline-offset-2 ${
									location.pathname === link.path
										? "bg-[#e8f0fe] text-[#1967d2]"
										: ""
								}`}
							>
								{link.label}
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
											className={`block text-[#5f6368] no-underline text-sm font-medium py-3 px-4 rounded transition-colors duration-200 hover:bg-[#f1f3f4] focus-visible:outline-2 focus-visible:outline-[#4285f4] focus-visible:outline-offset-2 ${
												location.pathname === link.path
													? "bg-[#e8f0fe] text-[#1967d2]"
													: ""
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
