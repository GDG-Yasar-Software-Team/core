import {
	type MotionValue,
	motion,
	useMotionValue,
	useSpring,
	useTransform,
} from "motion/react";
import type React from "react";
import { useRef } from "react";

interface SocialLink {
	title: string;
	icon: React.ReactNode;
	href: string;
}

interface AnimatedSocialDockProps {
	items: SocialLink[];
	className?: string;
}

export const AnimatedSocialDock: React.FC<AnimatedSocialDockProps> = ({
	items,
	className = "",
}) => {
	const mouseXPosition = useMotionValue(Number.POSITIVE_INFINITY);

	return (
		<motion.div
			onMouseMove={(e) => mouseXPosition.set(e.pageX)}
			onMouseLeave={() => mouseXPosition.set(Number.POSITIVE_INFINITY)}
			className={`flex items-end gap-4 p-4 rounded-3xl bg-white/10 backdrop-blur-[10px] border border-white/20 justify-center h-28 min-h-28 ${className}`}
		>
			{items.map((item) => (
				<DockIcon mouseX={mouseXPosition} key={item.title} {...item} />
			))}
		</motion.div>
	);
};

function DockIcon({
	mouseX,
	title,
	icon,
	href,
}: {
	mouseX: MotionValue;
	title: string;
	icon: React.ReactNode;
	href: string;
}) {
	const ref = useRef<HTMLDivElement>(null);

	const distanceFromMouse = useTransform(mouseX, (val) => {
		const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
		return val - bounds.x - bounds.width / 2;
	});

	const widthTransform = useTransform(
		distanceFromMouse,
		[-150, 0, 150],
		[60, 60, 60],
	);
	const heightTransform = useTransform(
		distanceFromMouse,
		[-150, 0, 150],
		[60, 60, 60],
	);

	const iconWidthTransform = useTransform(
		distanceFromMouse,
		[-150, 0, 150],
		[24, 24, 24],
	);
	const iconHeightTransform = useTransform(
		distanceFromMouse,
		[-150, 0, 150],
		[24, 24, 24],
	);

	const width = useSpring(widthTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const height = useSpring(heightTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	const iconWidth = useSpring(iconWidthTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});
	const iconHeight = useSpring(iconHeightTransform, {
		mass: 0.1,
		stiffness: 150,
		damping: 12,
	});

	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			className="no-underline text-inherit"
			aria-label={title}
		>
			<motion.div
				ref={ref}
				style={{ width, height }}
				className="relative flex items-center justify-center aspect-square rounded-full bg-white/90 shadow-md text-[#5f6368] transition-all duration-200 ease-in-out hover:bg-white hover:shadow-lg"
			>
				<motion.div
					style={{ width: iconWidth, height: iconHeight }}
					className="flex items-center justify-center [&_svg]:w-full [&_svg]:h-full"
				>
					{icon}
				</motion.div>
			</motion.div>
		</a>
	);
}
