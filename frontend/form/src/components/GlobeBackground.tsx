import { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

// GDG Google colors
const GDG_COLORS = {
	blue: "#4285F4",
	red: "#EA4335",
	yellow: "#FBBC04",
	green: "#34A853",
};

const COLORS_ARRAY = [
	GDG_COLORS.blue,
	GDG_COLORS.red,
	GDG_COLORS.yellow,
	GDG_COLORS.green,
];

interface GlobePoint {
	lat: number;
	lng: number;
	size: number;
	color: string;
}

// Generate decorative points representing global GDG community
function generatePoints(count: number): GlobePoint[] {
	const points: GlobePoint[] = [];

	// Major tech hub locations (approximate)
	const hubs = [
		{ lat: 41.0082, lng: 28.9784 }, // Istanbul
		{ lat: 38.4192, lng: 27.1287 }, // Izmir (Yaşar University)
		{ lat: 37.7749, lng: -122.4194 }, // San Francisco
		{ lat: 40.7128, lng: -74.006 }, // New York
		{ lat: 51.5074, lng: -0.1278 }, // London
		{ lat: 48.8566, lng: 2.3522 }, // Paris
		{ lat: 52.52, lng: 13.405 }, // Berlin
		{ lat: 35.6762, lng: 139.6503 }, // Tokyo
		{ lat: 1.3521, lng: 103.8198 }, // Singapore
		{ lat: -33.8688, lng: 151.2093 }, // Sydney
		{ lat: 19.076, lng: 72.8777 }, // Mumbai
		{ lat: -23.5505, lng: -46.6333 }, // São Paulo
		{ lat: 37.5665, lng: 126.978 }, // Seoul
	];

	// Add hub points with larger size
	for (const hub of hubs) {
		points.push({
			lat: hub.lat,
			lng: hub.lng,
			size: 0.5,
			color: COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)],
		});
	}

	// Add random additional points
	for (let i = points.length; i < count; i++) {
		points.push({
			lat: (Math.random() - 0.5) * 140,
			lng: (Math.random() - 0.5) * 360,
			size: 0.2 + Math.random() * 0.3,
			color: COLORS_ARRAY[Math.floor(Math.random() * COLORS_ARRAY.length)],
		});
	}

	return points;
}

interface GlobeBackgroundProps {
	className?: string;
	pointCount?: number;
}

export function GlobeBackground({
	className = "",
	pointCount = 40,
}: GlobeBackgroundProps) {
	const globeEl = useRef<any>(null);
	const [dimensions, setDimensions] = useState({ width: 100, height: 100 });
	const [points] = useState(() => generatePoints(pointCount));

	// Get dimensions on mount and resize
	useEffect(() => {
		function updateSize() {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		updateSize();
		window.addEventListener("resize", updateSize);
		return () => window.removeEventListener("resize", updateSize);
	}, []);

	// Configure globe after mount
	useEffect(() => {
		if (!globeEl.current) return;

		// Small delay to ensure globe is initialized
		const timer = setTimeout(() => {
			if (!globeEl.current) return;
			
			const globe = globeEl.current;
			
			// Set initial view to Turkey/Europe
			globe.pointOfView({ lat: 39, lng: 32, altitude: 2.2 }, 0);

			// Enable auto-rotation
			const controls = globe.controls();
			if (controls) {
				controls.autoRotate = true;
				controls.autoRotateSpeed = 0.3;
				controls.enableZoom = false;
				controls.enablePan = false;
				controls.enableRotate = false;
			}
		}, 500);

		return () => clearTimeout(timer);
	}, []);

	return (
		<div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
			<Globe
				ref={globeEl}
				width={dimensions.width}
				height={dimensions.height}
				backgroundColor="rgba(241,245,249,1)"
				globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
				atmosphereColor={GDG_COLORS.blue}
				atmosphereAltitude={0.25}
				pointsData={points}
				pointLat={(d: any) => d.lat}
				pointLng={(d: any) => d.lng}
				pointColor={(d: any) => d.color}
				pointRadius={(d: any) => d.size}
				pointAltitude={0.01}
			/>
		</div>
	);
}

export default GlobeBackground;
