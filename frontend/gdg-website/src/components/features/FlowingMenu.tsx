import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

/** Former FlowingMenu.css font modifiers; TeamPage passes these `fontClass` keys. */
const FLOWING_MENU_FONT_TW: Record<string, string> = {
	"marquee--font-bebas": "font-bold [&_span]:tracking-[0.05em]",
	"marquee--font-righteous": "font-medium",
	"marquee--font-orbitron": "font-bold [&_span]:tracking-[0.1em]",
	"marquee--font-bungee": "font-black uppercase",
};

interface FlowingMenuProps {
	items: Array<{ link: string; text: string; image: string }>;
	speed?: number;
	textColor?: string;
	bgColor?: string;
	marqueeBgColor?: string;
	marqueeTextColor?: string;
	borderColor?: string;
	fontClass?: string;
}

function FlowingMenu({
	items = [],
	speed = 15,
	textColor = "#fff",
	bgColor = "#060010",
	marqueeBgColor = "#fff",
	marqueeTextColor = "#060010",
	borderColor = "#fff",
	fontClass = "",
}: FlowingMenuProps) {
	return (
		<div
			className="w-full h-full overflow-hidden"
			style={{ backgroundColor: bgColor }}
		>
			<nav className="flex flex-col h-full m-0 p-0">
				{items.map((item, idx) => (
					<MenuItem
						key={idx}
						{...item}
						speed={speed}
						textColor={textColor}
						marqueeBgColor={marqueeBgColor}
						marqueeTextColor={marqueeTextColor}
						borderColor={borderColor}
						fontClass={fontClass}
					/>
				))}
			</nav>
		</div>
	);
}

interface MenuItemProps {
	link: string;
	text: string;
	image: string;
	speed: number;
	textColor: string;
	marqueeBgColor: string;
	marqueeTextColor: string;
	borderColor: string;
	fontClass: string;
}

function MenuItem({
	link: _link,
	text,
	image,
	speed,
	textColor: _textColor,
	marqueeBgColor,
	marqueeTextColor,
	borderColor,
	fontClass,
}: MenuItemProps) {
	const itemRef = useRef<HTMLDivElement>(null);
	const marqueeRef = useRef<HTMLDivElement>(null);
	const marqueeInnerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<gsap.core.Tween | null>(null);
	const [repetitions, setRepetitions] = useState(4);
	const animationDefaults = { duration: 0.6, ease: "expo" };

	const findClosestEdge = (
		mouseX: number,
		mouseY: number,
		width: number,
		height: number,
	) => {
		const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
		const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
		return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
	};

	const distMetric = (x: number, y: number, x2: number, y2: number) => {
		const xDiff = x - x2;
		const yDiff = y - y2;
		return xDiff * xDiff + yDiff * yDiff;
	};

	useEffect(() => {
		const inner = marqueeInnerRef.current;
		if (!inner) return;

		const calculateRepetitions = () => {
			if (!marqueeInnerRef.current) return;
			const marqueeContent = marqueeInnerRef.current.querySelector(
				".marquee__part",
			) as HTMLElement;
			if (!marqueeContent) return;
			const contentWidth = marqueeContent.offsetWidth;
			const viewportWidth = window.innerWidth;
			const needed = Math.ceil(viewportWidth / contentWidth) + 2;
			setRepetitions(Math.max(4, needed));
		};

		calculateRepetitions();
		const resizeObserver = new ResizeObserver(calculateRepetitions);
		resizeObserver.observe(inner);
		window.addEventListener("resize", calculateRepetitions);
		return () => {
			resizeObserver.disconnect();
			window.removeEventListener("resize", calculateRepetitions);
		};
	}, []);

	useEffect(() => {
		const inner = marqueeInnerRef.current;
		if (!inner) return;

		const setupMarquee = () => {
			if (!marqueeInnerRef.current || !marqueeRef.current) return;
			const marqueeContent = marqueeInnerRef.current.querySelector(
				".marquee__part",
			) as HTMLElement;
			if (!marqueeContent) return;
			const contentWidth = marqueeContent.offsetWidth;
			if (contentWidth === 0) return;

			// Make marquee visible immediately
			gsap.set(marqueeRef.current, { y: "0%" });
			gsap.set(marqueeInnerRef.current, { y: "0%", x: 0 });

			if (animationRef.current) {
				animationRef.current.kill();
			}

			// Start the horizontal scrolling animation
			animationRef.current = gsap.to(marqueeInnerRef.current, {
				x: -contentWidth,
				duration: speed,
				ease: "none",
				repeat: -1,
			});
		};

		let debounceId: ReturnType<typeof setTimeout> | null = null;
		const scheduleSetup = () => {
			if (debounceId) clearTimeout(debounceId);
			debounceId = setTimeout(() => {
				debounceId = null;
				setupMarquee();
			}, 100);
		};

		scheduleSetup();
		const resizeObserver = new ResizeObserver(scheduleSetup);
		resizeObserver.observe(inner);

		return () => {
			if (debounceId) clearTimeout(debounceId);
			resizeObserver.disconnect();
			if (animationRef.current) {
				animationRef.current.kill();
			}
		};
	}, [speed]);

	const handleMouseEnter = (ev: React.MouseEvent) => {
		if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
			return;
		const rect = itemRef.current.getBoundingClientRect();
		const x = ev.clientX - rect.left;
		const y = ev.clientY - rect.top;
		const edge = findClosestEdge(x, y, rect.width, rect.height);

		gsap
			.timeline({ defaults: animationDefaults })
			.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
			.set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
			.to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
	};

	const handleMouseLeave = (ev: React.MouseEvent) => {
		if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
			return;
		const rect = itemRef.current.getBoundingClientRect();
		const x = ev.clientX - rect.left;
		const y = ev.clientY - rect.top;
		const edge = findClosestEdge(x, y, rect.width, rect.height);

		gsap
			.timeline({ defaults: animationDefaults })
			.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
			.to(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0);
	};

	const innerFontTw =
		FLOWING_MENU_FONT_TW[fontClass] ??
		(fontClass && !FLOWING_MENU_FONT_TW[fontClass] ? fontClass : "");

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: this wrapper handles mouse interactions for visual effects
		<div
			ref={itemRef}
			className="flex-1 relative overflow-hidden text-center border-t border-solid bg-transparent first:border-t-0 pointer-events-auto"
			style={{ borderColor }}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			<div
				ref={marqueeRef}
				className="relative overflow-hidden w-full h-full bg-transparent pointer-events-none [transform:translate3d(0,0,0)]"
				style={{ backgroundColor: marqueeBgColor }}
			>
				<div className="h-full w-full overflow-hidden">
					<div
						ref={marqueeInnerRef}
						className={`flex items-center relative h-full w-fit will-change-transform [&_span]:whitespace-nowrap [&_span]:uppercase [&_span]:font-normal [&_span]:text-[4vh] [&_span]:leading-none [&_span]:px-[1vw] ${innerFontTw}`}
						aria-hidden="true"
					>
						{[...Array(repetitions)].map((_, idx) => (
							<div
								className="flex items-center shrink-0"
								key={idx}
								style={{ color: marqueeTextColor }}
							>
								<span>{text}</span>
								<div
									className="w-20 h-20 mx-[2vw] rounded-full bg-[length:60%] bg-no-repeat bg-center shrink-0"
									style={{ backgroundImage: `url(${image})` }}
								/>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default FlowingMenu;
