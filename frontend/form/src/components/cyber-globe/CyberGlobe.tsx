import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { CONTINENT_OUTLINES, TECH_HUB_COORDS } from "./continentOutlines";

// ============ CONSTANTS ============
const GLOBE_RADIUS = 2;
const ROTATION_SPEED = 0.0008;

// GDG & Google Colors
const GOOGLE_BLUE = "#4285F4";
const GOOGLE_RED = "#EA4335";
const GOOGLE_YELLOW = "#FBBC05";
const GOOGLE_GREEN = "#34A853";
const NEON_GREEN = "#00ff88";
const NEON_CYAN = "#00ffff";
const GRID_COLOR = "#003d2e";

// ============ UTILITY FUNCTIONS ============
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
	const phi = (90 - lat) * (Math.PI / 180);
	const theta = (lng + 180) * (Math.PI / 180);
	return new THREE.Vector3(
		-radius * Math.sin(phi) * Math.cos(theta),
		radius * Math.cos(phi),
		radius * Math.sin(phi) * Math.sin(theta)
	);
}

// ============ BACKGROUND STARS ============
function BackgroundStars() {
	const pointsRef = useRef<THREE.Points>(null);

	const { positions } = useMemo(() => {
		const positions: number[] = [];
		const count = 800;

		for (let i = 0; i < count; i++) {
			const r = 6 + Math.random() * 6;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);

			positions.push(
				r * Math.sin(phi) * Math.cos(theta),
				r * Math.sin(phi) * Math.sin(theta),
				r * Math.cos(phi)
			);
		}

		return {
			positions: new Float32Array(positions),
		};
	}, []);

	useFrame(() => {
		if (pointsRef.current) {
			pointsRef.current.rotation.y += 0.0001;
			pointsRef.current.rotation.x += 0.00005;
		}
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					args={[positions, 3]}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.015}
				color="#ffffff"
				transparent
				opacity={0.3}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}

// ============ DOTTED SPHERE SURFACE ============
function DottedSphere() {
	const pointsRef = useRef<THREE.Points>(null);

	const { positions, colors } = useMemo(() => {
		const positions: number[] = [];
		const colors: number[] = [];
		const color = new THREE.Color(NEON_GREEN);

		const numPoints = 1500;
		const phi = Math.PI * (3 - Math.sqrt(5));

		for (let i = 0; i < numPoints; i++) {
			const y = 1 - (i / (numPoints - 1)) * 2;
			const radius = Math.sqrt(1 - y * y);
			const theta = phi * i;

			positions.push(
				Math.cos(theta) * radius * GLOBE_RADIUS,
				y * GLOBE_RADIUS,
				Math.sin(theta) * radius * GLOBE_RADIUS
			);

			const intensity = 0.2 + Math.random() * 0.5;
			colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
		}

		return {
			positions: new Float32Array(positions),
			colors: new Float32Array(colors),
		};
	}, []);

	useFrame(() => {
		if (pointsRef.current) {
			pointsRef.current.rotation.y += ROTATION_SPEED;
		}
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					args={[positions, 3]}
				/>
				<bufferAttribute
					attach="attributes-color"
					args={[colors, 3]}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.025}
				vertexColors
				transparent
				opacity={0.6}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}

// ============ ICOSAHEDRON WIREFRAME ============
function NetworkWireframe() {
	const meshRef = useRef<THREE.LineSegments>(null);

	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.rotation.y += ROTATION_SPEED;
		}
	});

	return (
		<lineSegments ref={meshRef}>
			<edgesGeometry args={[new THREE.IcosahedronGeometry(GLOBE_RADIUS * 0.99, 2)]} />
			<lineBasicMaterial color={GRID_COLOR} transparent opacity={0.25} />
		</lineSegments>
	);
}

// ============ LAT/LONG GRID LINES ============
function LatLongGrid() {
	const groupRef = useRef<THREE.Group>(null);

	const gridLines = useMemo(() => {
		const lines: THREE.Line[] = [];
		const material = new THREE.LineBasicMaterial({
			color: NEON_GREEN,
			transparent: true,
			opacity: 0.12,
			blending: THREE.AdditiveBlending,
		});

		// Latitude circles
		for (let lat = -60; lat <= 60; lat += 30) {
			const points: THREE.Vector3[] = [];
			for (let lng = 0; lng <= 360; lng += 4) {
				points.push(latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002));
			}
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			lines.push(new THREE.Line(geometry, material));
		}

		// Longitude arcs
		for (let lng = 0; lng < 360; lng += 30) {
			const points: THREE.Vector3[] = [];
			for (let lat = -90; lat <= 90; lat += 4) {
				points.push(latLngToVector3(lat, lng, GLOBE_RADIUS * 1.002));
			}
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			lines.push(new THREE.Line(geometry, material));
		}

		return lines;
	}, []);

	useFrame(() => {
		if (groupRef.current) {
			groupRef.current.rotation.y += ROTATION_SPEED;
		}
	});

	return (
		<group ref={groupRef}>
			{gridLines.map((line, i) => (
				<primitive key={i} object={line} />
			))}
		</group>
	);
}

// ============ CONTINENT OUTLINES ============
function ContinentOutlines() {
	const groupRef = useRef<THREE.Group>(null);

	const outlineLines = useMemo(() => {
		const lines: THREE.Line[] = [];
		const material = new THREE.LineBasicMaterial({
			color: NEON_CYAN,
			transparent: true,
			opacity: 0.18,
			blending: THREE.AdditiveBlending,
		});

		CONTINENT_OUTLINES.forEach((continent) => {
			const points = continent.map(([lng, lat]) =>
				latLngToVector3(lat, lng, GLOBE_RADIUS * 1.003)
			);
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			lines.push(new THREE.Line(geometry, material));
		});

		return lines;
	}, []);

	useFrame(() => {
		if (groupRef.current) {
			groupRef.current.rotation.y += ROTATION_SPEED;
		}
	});

	return (
		<group ref={groupRef}>
			{outlineLines.map((line, i) => (
				<primitive key={i} object={line} />
			))}
		</group>
	);
}

// ============ TECH HUB NODES (Google Colors) ============
interface TechNode {
	position: THREE.Vector3;
	color: string;
	phase: number;
	size: number;
}

function TechHubNodes() {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const nodesRef = useRef<TechNode[]>([]);

	const nodeCount = TECH_HUB_COORDS.length + 20;

	useMemo(() => {
		const nodes: TechNode[] = [];
		const googleColors = [GOOGLE_BLUE, GOOGLE_RED, GOOGLE_YELLOW, GOOGLE_GREEN];

		// Add tech hub positions
		TECH_HUB_COORDS.forEach((hub, i) => {
			nodes.push({
				position: latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS * 1.01),
				color: googleColors[i % googleColors.length],
				phase: Math.random() * Math.PI * 2,
				size: 0.04 + Math.random() * 0.02,
			});
		});

		// Add some random nodes for visual balance
		for (let i = 0; i < 20; i++) {
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.acos(2 * Math.random() - 1);

			nodes.push({
				position: new THREE.Vector3(
					GLOBE_RADIUS * 1.01 * Math.sin(theta) * Math.cos(phi),
					GLOBE_RADIUS * 1.01 * Math.sin(theta) * Math.sin(phi),
					GLOBE_RADIUS * 1.01 * Math.cos(theta)
				),
				color: i % 2 === 0 ? NEON_GREEN : NEON_CYAN,
				phase: Math.random() * Math.PI * 2,
				size: 0.03 + Math.random() * 0.015,
			});
		}

		nodesRef.current = nodes;
	}, []);

	useFrame((state) => {
		if (!meshRef.current) return;

		const time = state.clock.elapsedTime;
		const dummy = new THREE.Object3D();
		const color = new THREE.Color();

		nodesRef.current.forEach((node, i) => {
			const pulse = Math.sin(time * 1.5 + node.phase) * 0.5 + 0.5;
			const scale = node.size * (0.7 + pulse * 0.6);

			dummy.position.copy(node.position);
			dummy.scale.setScalar(scale);
			dummy.updateMatrix();

			meshRef.current!.setMatrixAt(i, dummy.matrix);
			meshRef.current!.setColorAt(i, color.set(node.color).multiplyScalar(0.6 + pulse * 0.4));
		});

		meshRef.current.instanceMatrix.needsUpdate = true;
		if (meshRef.current.instanceColor) {
			meshRef.current.instanceColor.needsUpdate = true;
		}

		meshRef.current.rotation.y += ROTATION_SPEED;
	});

	return (
		<instancedMesh ref={meshRef} args={[undefined, undefined, nodeCount]}>
			<sphereGeometry args={[1, 12, 12]} />
			<meshBasicMaterial transparent opacity={0.9} blending={THREE.AdditiveBlending} />
		</instancedMesh>
	);
}

// ============ NODE GLOW RINGS ============
function NodeGlowRings() {
	const groupRef = useRef<THREE.Group>(null);

	const rings = useMemo(() => {
		const ringMeshes: { mesh: THREE.Mesh; phase: number }[] = [];
		const colors = [GOOGLE_BLUE, GOOGLE_RED, GOOGLE_YELLOW, GOOGLE_GREEN, NEON_GREEN, NEON_CYAN];

		// Place rings at some tech hub locations
		const hubIndices = [0, 3, 6, 9, 12, 15, 18, 21];
		hubIndices.forEach((idx, i) => {
			if (idx < TECH_HUB_COORDS.length) {
				const hub = TECH_HUB_COORDS[idx];
				const pos = latLngToVector3(hub.lat, hub.lng, GLOBE_RADIUS * 1.015);

				const geometry = new THREE.RingGeometry(0.06, 0.09, 24);
				const material = new THREE.MeshBasicMaterial({
					color: colors[i % colors.length],
					transparent: true,
					opacity: 0.5,
					side: THREE.DoubleSide,
					blending: THREE.AdditiveBlending,
				});

				const mesh = new THREE.Mesh(geometry, material);
				mesh.position.copy(pos);
				mesh.lookAt(0, 0, 0);
				ringMeshes.push({ mesh, phase: Math.random() * Math.PI * 2 });
			}
		});

		return ringMeshes;
	}, []);

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += ROTATION_SPEED;

			rings.forEach(({ mesh, phase }) => {
				const pulse = Math.sin(state.clock.elapsedTime * 2 + phase) * 0.5 + 0.5;
				mesh.scale.setScalar(0.8 + pulse * 0.4);
				(mesh.material as THREE.MeshBasicMaterial).opacity = 0.25 + pulse * 0.35;
			});
		}
	});

	return (
		<group ref={groupRef}>
			{rings.map(({ mesh }, i) => (
				<primitive key={i} object={mesh} />
			))}
		</group>
	);
}

// ============ ANIMATED CONNECTION LINES ============
interface ConnectionLine {
	id: number;
	start: THREE.Vector3;
	end: THREE.Vector3;
	progress: number;
	color: string;
	speed: number;
}

function ConnectionLines() {
	const [connections, setConnections] = useState<ConnectionLine[]>([]);
	const groupRef = useRef<THREE.Group>(null);
	const idRef = useRef(0);

	useEffect(() => {
		const spawnConnection = () => {
			const idx1 = Math.floor(Math.random() * TECH_HUB_COORDS.length);
			let idx2 = Math.floor(Math.random() * TECH_HUB_COORDS.length);
			while (idx2 === idx1) idx2 = Math.floor(Math.random() * TECH_HUB_COORDS.length);

			const hub1 = TECH_HUB_COORDS[idx1];
			const hub2 = TECH_HUB_COORDS[idx2];

			const colors = [GOOGLE_BLUE, GOOGLE_RED, GOOGLE_YELLOW, GOOGLE_GREEN, NEON_GREEN];

			setConnections((prev) => [
				...prev,
				{
					id: idRef.current++,
					start: latLngToVector3(hub1.lat, hub1.lng, GLOBE_RADIUS * 1.02),
					end: latLngToVector3(hub2.lat, hub2.lng, GLOBE_RADIUS * 1.02),
					progress: 0,
					color: colors[Math.floor(Math.random() * colors.length)],
					speed: 0.3 + Math.random() * 0.4,
				},
			]);
		};

		for (let i = 0; i < 3; i++) {
			setTimeout(spawnConnection, i * 800);
		}

		const interval = setInterval(spawnConnection, 2000);
		return () => clearInterval(interval);
	}, []);

	useFrame((_, delta) => {
		setConnections((prev) =>
			prev
				.map((conn) => ({ ...conn, progress: conn.progress + delta * conn.speed }))
				.filter((conn) => conn.progress < 1.8)
		);

		if (groupRef.current) {
			groupRef.current.rotation.y += ROTATION_SPEED;
		}
	});

	return (
		<group ref={groupRef}>
			{connections.map((conn) => (
				<ArcConnection key={conn.id} connection={conn} />
			))}
		</group>
	);
}

function ArcConnection({ connection }: { connection: ConnectionLine }) {
	const { start, end, progress, color } = connection;

	const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
	mid.normalize().multiplyScalar(GLOBE_RADIUS * 1.4);

	const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
	const points = curve.getPoints(30);

	const visibleProgress = Math.min(progress, 1);
	const tailStart = Math.max(0, visibleProgress - 0.3);
	const tailEnd = visibleProgress;

	const startIdx = Math.floor(tailStart * points.length);
	const endIdx = Math.floor(tailEnd * points.length);
	const visiblePoints = points.slice(startIdx, endIdx + 1);

	if (visiblePoints.length < 2) return null;

	const geometry = new THREE.BufferGeometry().setFromPoints(visiblePoints);
	const opacity = progress > 1 ? Math.max(0, 1 - (progress - 1) * 1.5) : 0.7;

	return (
		<primitive
			object={
				new THREE.Line(
					geometry,
					new THREE.LineBasicMaterial({
						color,
						transparent: true,
						opacity,
						blending: THREE.AdditiveBlending,
					})
				)
			}
		/>
	);
}

// ============ OUTER GLOW RING ============
function OuterGlowRing() {
	const ringRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (ringRef.current) {
			ringRef.current.rotation.z += 0.001;
			const pulse = Math.sin(state.clock.elapsedTime * 0.5) * 0.08 + 1;
			ringRef.current.scale.setScalar(pulse);
		}
	});

	return (
		<mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
			<ringGeometry args={[GLOBE_RADIUS * 1.35, GLOBE_RADIUS * 1.38, 64]} />
			<meshBasicMaterial
				color={NEON_GREEN}
				transparent
				opacity={0.2}
				side={THREE.DoubleSide}
				blending={THREE.AdditiveBlending}
			/>
		</mesh>
	);
}

// ============ SCENE ============
function Scene() {
	return (
		<>
			<color attach="background" args={["#030806"]} />
			<ambientLight intensity={0.05} />

			{/* Background layer */}
			<BackgroundStars />

			{/* Globe layers (middle) */}
			<DottedSphere />
			<NetworkWireframe />
			<LatLongGrid />
			<ContinentOutlines />

			{/* Interactive elements (foreground) */}
			<TechHubNodes />
			<NodeGlowRings />
			<ConnectionLines />
			<OuterGlowRing />

			<OrbitControls
				enableZoom
				enablePan={false}
				minDistance={3.5}
				maxDistance={8}
				autoRotate
				autoRotateSpeed={0.2}
			/>

			<EffectComposer>
				<Bloom
					intensity={1.2}
					luminanceThreshold={0.15}
					luminanceSmoothing={0.9}
					mipmapBlur
				/>
				<Vignette darkness={0.4} offset={0.35} />
			</EffectComposer>
		</>
	);
}

// ============ MAIN COMPONENT ============
export function CyberGlobe() {
	return (
		<div className="fixed inset-0 z-0">
			<Canvas
				camera={{ position: [0, 0, 5], fov: 60 }}
				gl={{ antialias: true, alpha: false }}
				dpr={[1, 2]}
			>
				<Suspense fallback={null}>
					<Scene />
				</Suspense>
			</Canvas>
		</div>
	);
}

export default CyberGlobe;
