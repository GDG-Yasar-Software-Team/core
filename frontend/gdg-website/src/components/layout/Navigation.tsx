import type React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import "./Navigation.css";

export interface NavigationProps {
	className?: string;
}

const navLinks = [
	{ path: "/about", label: "About" },
	{ path: "/team", label: "Team" },
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
			className={`navigation ${className}`} 
			aria-label="Main navigation"
		>
			<div className="navigation__container">
				<Link to="/" className="navigation__logo">
					<img src="/gdg-logo.png" alt="GDG Logo" className="navigation__logo-img" />
					GDG on Campus Yaşar University
				</Link>

				{/* Desktop Navigation */}
				<ul className="navigation__links">
					{navLinks.map((link) => (
						<li key={link.path}>
							<Link
								to={link.path}
								className={`navigation__link ${
									location.pathname === link.path
										? "navigation__link--active"
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
					className="navigation__hamburger"
					onClick={toggleMobileMenu}
					aria-label="Toggle menu"
					aria-expanded={isMobileMenuOpen}
					aria-controls="mobile-menu"
				>
					<span className="navigation__hamburger-line" />
					<span className="navigation__hamburger-line" />
					<span className="navigation__hamburger-line" />
				</button>
			</div>

			{/* Mobile Menu Drawer */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<>
						<motion.div
							className="navigation__overlay"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={closeMobileMenu}
						/>
						<motion.div
							id="mobile-menu"
							className="navigation__mobile-menu"
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "tween", duration: 0.3 }}
							onKeyDown={handleKeyDown}
						>
							<ul className="navigation__mobile-links">
								{navLinks.map((link) => (
									<li key={link.path}>
										<Link
											to={link.path}
											className={`navigation__mobile-link ${
												location.pathname === link.path
													? "navigation__mobile-link--active"
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
