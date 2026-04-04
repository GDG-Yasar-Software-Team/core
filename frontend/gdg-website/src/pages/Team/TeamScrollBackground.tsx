import type React from "react";
import { useEffect, useMemo, useState } from "react";

type TeamTone = "organizers" | "organization" | "marketing" | "sponsorship" | "software";

interface TeamScrollBackgroundProps {
	className?: string;
}

interface RgbColor {
	r: number;
	g: number;
	b: number;
}

interface TeamPalette {
	base: string;
	soft: string;
	glow: string;
	deep: string;
}

interface SectionInfo {
	section: HTMLElement;
	tone: TeamTone;
}

const TEAM_COLORS: Record<TeamTone, [string, string, string, string]> = {
	organizers: ["#4285F4", "#EA4335", "#FBBC04", "#34A853"],
	organization: ["#EA4335", "#EA4335", "#EA4335", "#EA4335"],
	marketing: ["#FBBC05", "#FBBC05", "#FBBC05", "#FBBC05"],
	sponsorship: ["#4285F4", "#4285F4", "#4285F4", "#4285F4"],
	software: ["#34A853", "#34A853", "#34A853", "#34A853"],
};

const BACKGROUND_SHAPES = [
	{
		className: "absolute -top-20 -left-20 w-[40vw] h-[40vw]",
		clipPath: "polygon(0 0, 100% 0, 80% 100%, 0 80%)",
		gradientAngle: 135,
		translateX: -180,
		translateY: -120,
		rotate: -10,
		rotateDelta: 60,
		opacity: 0.82,
	},
	{
		className: "absolute -top-10 -right-10 w-[35vw] h-[35vw]",
		clipPath: "polygon(20% 0, 100% 0, 100% 80%, 0 100%)",
		gradientAngle: 225,
		translateX: 150,
		translateY: -140,
		rotate: 10,
		rotateDelta: -55,
		opacity: 0.8,
	},
	{
		className: "absolute -bottom-10 -left-10 w-[30vw] h-[30vw]",
		clipPath: "polygon(0 20%, 80% 0, 100% 100%, 0 100%)",
		gradientAngle: 45,
		translateX: -130,
		translateY: 170,
		rotate: -6,
		rotateDelta: 50,
		opacity: 0.7,
	},
	{
		className: "absolute -bottom-20 -right-20 w-[45vw] h-[45vw]",
		clipPath: "polygon(20% 0, 100% 20%, 100% 100%, 0 80%)",
		gradientAngle: 315,
		translateX: 190,
		translateY: 200,
		rotate: 7,
		rotateDelta: -65,
		opacity: 0.78,
	},
] as const;

const clamp = (value: number, min: number, max: number) =>
	Math.min(max, Math.max(min, value));

const smoothstep = (value: number) => value * value * (3 - 2 * value);

const hexToRgb = (value: string): RgbColor => {
	const normalized = value.replace("#", "");
	const expanded =
		normalized.length === 3
			? normalized
				.split("")
					.map((character) => `${character}${character}`)
					.join("")
				: normalized;

	const parsed = Number.parseInt(expanded, 16);

	return {
		r: (parsed >> 16) & 255,
		g: (parsed >> 8) & 255,
		b: parsed & 255,
	};
};

const rgbToHex = ({ r, g, b }: RgbColor) => {
	const toHex = (component: number) =>
		component.toString(16).padStart(2, "0");

	return `#${toHex(Math.round(r))}${toHex(Math.round(g))}${toHex(Math.round(b))}`;
};

const mixRgb = (first: RgbColor, second: RgbColor, ratio: number): RgbColor => ({
	r: first.r + (second.r - first.r) * ratio,
	g: first.g + (second.g - first.g) * ratio,
	b: first.b + (second.b - first.b) * ratio,
});

const mixHex = (first: string, second: string, ratio: number) =>
	rgbToHex(mixRgb(hexToRgb(first), hexToRgb(second), ratio));

const rgbaFromHex = (value: string, alpha: number) => {
	const { r, g, b } = hexToRgb(value);
	return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
};

const buildPalette = (baseColor: string): TeamPalette => ({
	base: baseColor,
	soft: mixHex(baseColor, "#ffffff", 0.3),
	glow: mixHex(baseColor, "#ffffff", 0.58),
	deep: mixHex(baseColor, "#000000", 0.2),
});

const averageColor = (hexColors: string[]) => {
	const rgbs = hexColors.map(hexToRgb);
	return rgbToHex({
		r: rgbs.reduce((acc, c) => acc + c.r, 0) / rgbs.length,
		g: rgbs.reduce((acc, c) => acc + c.g, 0) / rgbs.length,
		b: rgbs.reduce((acc, c) => acc + c.b, 0) / rgbs.length,
	});
};

export const TeamScrollBackground: React.FC<TeamScrollBackgroundProps> = ({
	className = "",
}) => {
	const [snapshot, setSnapshot] = useState({
		baseColors: TEAM_COLORS.organizers,
		scrollProgress: 0,
	});

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		let rafId = 0;

		const readSections = (): SectionInfo[] =>
			Array.from(document.querySelectorAll<HTMLElement>("[data-team-tone]"))
				.map((section) => ({
					section,
					tone: section.dataset.teamTone as TeamTone | undefined,
				}))
				.filter((item): item is SectionInfo => Boolean(item.tone && item.tone in TEAM_COLORS));

		const updateBackground = () => {
			const sections = readSections();

			if (sections.length === 0) {
				return;
			}

			const scrollTop = window.scrollY || window.pageYOffset;
			const viewportCenter = scrollTop + window.innerHeight * 0.45;
			const sectionCenters = sections.map(({ section, tone }) => ({
				tone,
				center: section.offsetTop + section.offsetHeight / 2,
			}));

			let current = sectionCenters[0];
			let next = sectionCenters[sectionCenters.length - 1];

			for (let index = 0; index < sectionCenters.length; index += 1) {
				const candidate = sectionCenters[index];

				if (candidate.center <= viewportCenter) {
					current = candidate;
					next = sectionCenters[Math.min(index + 1, sectionCenters.length - 1)];
				} else {
					next = candidate;
					break;
				}
			}

			const range = Math.max(next.center - current.center, 1);
			const progress = smoothstep(
				clamp((viewportCenter - current.center) / range, 0, 1),
			);
			const baseColors = TEAM_COLORS[current.tone].map((color, idx) =>
				mixHex(color, TEAM_COLORS[next.tone][idx], progress)
			) as [string, string, string, string];
			const totalScrollable = Math.max(
				document.documentElement.scrollHeight - window.innerHeight,
				1,
			);

			setSnapshot({
				baseColors,
				scrollProgress: clamp(scrollTop / totalScrollable, 0, 1),
			});
		};

		const scheduleUpdate = () => {
			if (rafId !== 0) {
				return;
			}

			rafId = window.requestAnimationFrame(() => {
				rafId = 0;
				updateBackground();
			});
		};

		scheduleUpdate();
		window.addEventListener("scroll", scheduleUpdate, { passive: true });
		window.addEventListener("resize", scheduleUpdate);

		return () => {
			if (rafId !== 0) {
				window.cancelAnimationFrame(rafId);
			}

			window.removeEventListener("scroll", scheduleUpdate);
			window.removeEventListener("resize", scheduleUpdate);
		};
	}, []);

	const palettes = useMemo(() => snapshot.baseColors.map(buildPalette), [snapshot.baseColors]);
	const globalPalette = useMemo(() => buildPalette(averageColor(snapshot.baseColors)), [snapshot.baseColors]);
	const motionAmount = snapshot.scrollProgress;

	return (
		<div
			className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
			aria-hidden="true"
		>
			<div
				className="absolute inset-0"
				style={{
					backgroundImage: [
						`radial-gradient(circle at top, ${rgbaFromHex(globalPalette.glow, 0.12)}, transparent 42%)`,
						`radial-gradient(circle at center, ${rgbaFromHex(globalPalette.base, 0.08)}, transparent 58%)`,
						`linear-gradient(180deg, rgba(10, 10, 10, 0.06), rgba(10, 10, 10, 0.62))`,
					].join(", "),
				}}
			/>

			{BACKGROUND_SHAPES.map((shape, index) => {
				const layerFactor = 0.5 + (index * 0.4);
				const palette = palettes[index];

				return (
					<div
						key={`${shape.clipPath}-${shape.gradientAngle}`}
						className={`${shape.className} opacity-80`}
						style={{
							clipPath: shape.clipPath,
							backgroundImage: `linear-gradient(${shape.gradientAngle}deg, ${rgbaFromHex(palette.base, 0.92)}, ${rgbaFromHex(palette.soft, 0.12)} 72%, transparent 100%)`,
							transform: `translate3d(${shape.translateX * motionAmount * layerFactor}px, ${shape.translateY * motionAmount * layerFactor}px, 0) rotate(${shape.rotate + motionAmount * shape.rotateDelta}deg)`,
							filter: `drop-shadow(0 0 ${18 + index * 8}px ${rgbaFromHex(palette.glow, 0.12)})`,
							mixBlendMode: "screen",
							opacity: shape.opacity,
							willChange: "transform, opacity, filter",
						}}
					/>
				);
			})}

			<div
				className="absolute inset-x-0 bottom-0 h-1/2"
				style={{
					backgroundImage: `linear-gradient(180deg, transparent 0%, ${rgbaFromHex(globalPalette.deep, 0.22)} 100%)`,
					transform: `translateY(${motionAmount * 50}px)`,
					mixBlendMode: "multiply",
					opacity: 0.9,
				}}
			/>
		</div>
	);
};

export default TeamScrollBackground;