import type { ReactNode } from "react";
import { GlobeBackground } from "./GlobeBackground";

interface PageWithGlobeProps {
	children: ReactNode;
	showGlobe?: boolean;
	pointCount?: number;
}

export function PageWithGlobe({
	children,
	showGlobe = true,
	pointCount = 40,
}: PageWithGlobeProps) {
	return (
		<>
			{showGlobe && <GlobeBackground pointCount={pointCount} />}
			<div className="relative z-20">{children}</div>
		</>
	);
}

export default PageWithGlobe;
