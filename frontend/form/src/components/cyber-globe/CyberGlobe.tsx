import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { Suspense, useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";

// ============ CONSTANTS ============
const GLOBE_RADIUS = 2;
const PRIMARY_COLOR = "#00ff88"; // Neon green
const SECONDARY_COLOR = "#00ffff"; // Cyan
const ACCENT_COLOR = "#ff00ff"; // Magenta
const WARNING_COLOR = "#ffaa00"; // Orange
const GRID_COLOR = "#004422";

// ============ DOTTED GLOBE ============
function DottedGlobe() {
	const pointsRef = useRef<THREE.Points>(null);
	
	const { positions, colors } = useMemo(() => {
		const positions: number[] = [];
		const colors: number[] = [];
		const color = new THREE.Color(PRIMARY_COLOR);
		
		// Create dots on sphere surface using fibonacci sphere
		const numPoints = 2000;
		const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
		
		for (let i = 0; i < numPoints; i++) {
			const y = 1 - (i / (numPoints - 1)) * 2;
			const radius = Math.sqrt(1 - y * y);
			const theta = phi * i;
			
			const x = Math.cos(theta) * radius;
			const z = Math.sin(theta) * radius;
			
			positions.push(x * GLOBE_RADIUS, y * GLOBE_RADIUS, z * GLOBE_RADIUS);
			
			// Vary color intensity
			const intensity = 0.3 + Math.random() * 0.7;
			colors.push(color.r * intensity, color.g * intensity, color.b * intensity);
		}
		
		return {
			positions: new Float32Array(positions),
			colors: new Float32Array(colors),
		};
	}, []);

	useFrame((state) => {
		if (pointsRef.current) {
			pointsRef.current.rotation.y += 0.001;
		}
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={positions.length / 3}
					array={positions}
					itemSize={3}
				/>
				<bufferAttribute
					attach="attributes-color"
					count={colors.length / 3}
					array={colors}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.03}
				vertexColors
				transparent
				opacity={0.8}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}

// ============ WIREFRAME GLOBE ============
function WireframeGlobe() {
	const meshRef = useRef<THREE.LineSegments>(null);

	useFrame(() => {
		if (meshRef.current) {
			meshRef.current.rotation.y += 0.001;
		}
	});

	return (
		<lineSegments ref={meshRef}>
			<edgesGeometry args={[new THREE.IcosahedronGeometry(GLOBE_RADIUS, 2)]} />
			<lineBasicMaterial color={GRID_COLOR} transparent opacity={0.3} />
		</lineSegments>
	);
}

// ============ LATITUDE/LONGITUDE GRID ============
function GridLines() {
	const groupRef = useRef<THREE.Group>(null);

	const lines = useMemo(() => {
		const lineData: JSX.Element[] = [];
		
		// Latitude lines
		for (let lat = -60; lat <= 60; lat += 30) {
			const points: THREE.Vector3[] = [];
			const latRad = (lat * Math.PI) / 180;
			const r = GLOBE_RADIUS * Math.cos(latRad);
			const y = GLOBE_RADIUS * Math.sin(latRad);
			
			for (let lng = 0; lng <= 360; lng += 5) {
				const lngRad = (lng * Math.PI) / 180;
				points.push(new THREE.Vector3(
					r * Math.cos(lngRad),
					y,
					r * Math.sin(lngRad)
				));
			}
			
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			lineData.push(
				<line key={`lat-${lat}`} geometry={geometry}>
					<lineBasicMaterial color={PRIMARY_COLOR} transparent opacity={0.15} />
				</line>
			);
		}
		
		// Longitude lines
		for (let lng = 0; lng < 360; lng += 30) {
			const points: THREE.Vector3[] = [];
			const lngRad = (lng * Math.PI) / 180;
			
			for (let lat = -90; lat <= 90; lat += 5) {
				const latRad = (lat * Math.PI) / 180;
				const r = GLOBE_RADIUS * Math.cos(latRad);
				const y = GLOBE_RADIUS * Math.sin(latRad);
				points.push(new THREE.Vector3(
					r * Math.cos(lngRad),
					y,
					r * Math.sin(lngRad)
				));
			}
			
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			lineData.push(
				<line key={`lng-${lng}`} geometry={geometry}>
					<lineBasicMaterial color={PRIMARY_COLOR} transparent opacity={0.15} />
				</line>
			);
		}
		
		return lineData;
	}, []);

	useFrame(() => {
		if (groupRef.current) {
			groupRef.current.rotation.y += 0.001;
		}
	});

	return <group ref={groupRef}>{lines}</group>;
}

// ============ PULSING NODES ============
interface NodeData {
	position: THREE.Vector3;
	color: string;
	phase: number;
	scale: number;
}

function PulsingNodes() {
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const nodesRef = useRef<NodeData[]>([]);
	
	const nodeCount = 30;
	
	useMemo(() => {
		const nodes: NodeData[] = [];
		const colors = [PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, WARNING_COLOR];
		
		for (let i = 0; i < nodeCount; i++) {
			// Random position on sphere
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.acos(2 * Math.random() - 1);
			
			const x = GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi);
			const y = GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi);
			const z = GLOBE_RADIUS * Math.cos(theta);
			
			nodes.push({
				position: new THREE.Vector3(x, y, z),
				color: colors[Math.floor(Math.random() * colors.length)],
				phase: Math.random() * Math.PI * 2,
				scale: 0.8 + Math.random() * 0.4,
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
			const pulse = Math.sin(time * 2 + node.phase) * 0.5 + 0.5;
			const scale = node.scale * (0.8 + pulse * 0.4);
			
			dummy.position.copy(node.position);
			dummy.scale.setScalar(scale * 0.05);
			dummy.updateMatrix();
			
			meshRef.current!.setMatrixAt(i, dummy.matrix);
			meshRef.current!.setColorAt(i, color.set(node.color).multiplyScalar(0.5 + pulse * 0.5));
		});
		
		meshRef.current.instanceMatrix.needsUpdate = true;
		if (meshRef.current.instanceColor) {
			meshRef.current.instanceColor.needsUpdate = true;
		}
		
		// Rotate with globe
		meshRef.current.rotation.y += 0.001;
	});

	return (
		<instancedMesh ref={meshRef} args={[undefined, undefined, nodeCount]}>
			<sphereGeometry args={[1, 8, 8]} />
			<meshBasicMaterial transparent opacity={0.9} blending={THREE.AdditiveBlending} />
		</instancedMesh>
	);
}

// ============ NODE HALOS ============
function NodeHalos() {
	const groupRef = useRef<THREE.Group>(null);
	const halosRef = useRef<THREE.Mesh[]>([]);
	
	const halos = useMemo(() => {
		const haloElements: JSX.Element[] = [];
		const colors = [PRIMARY_COLOR, SECONDARY_COLOR, WARNING_COLOR];
		
		for (let i = 0; i < 15; i++) {
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.acos(2 * Math.random() - 1);
			
			const pos = new THREE.Vector3(
				GLOBE_RADIUS * Math.sin(theta) * Math.cos(phi),
				GLOBE_RADIUS * Math.sin(theta) * Math.sin(phi),
				GLOBE_RADIUS * Math.cos(theta)
			);
			
			haloElements.push(
				<mesh
					key={i}
					position={pos}
					rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
				>
					<ringGeometry args={[0.08, 0.12, 32]} />
					<meshBasicMaterial
						color={colors[i % colors.length]}
						transparent
						opacity={0.6}
						side={THREE.DoubleSide}
						blending={THREE.AdditiveBlending}
					/>
				</mesh>
			);
		}
		
		return haloElements;
	}, []);

	useFrame((state) => {
		if (groupRef.current) {
			groupRef.current.rotation.y += 0.001;
			
			// Pulse halos
			groupRef.current.children.forEach((child, i) => {
				if (child instanceof THREE.Mesh) {
					const pulse = Math.sin(state.clock.elapsedTime * 3 + i) * 0.5 + 0.5;
					child.scale.setScalar(0.8 + pulse * 0.4);
					(child.material as THREE.MeshBasicMaterial).opacity = 0.3 + pulse * 0.4;
				}
			});
		}
	});

	return <group ref={groupRef}>{halos}</group>;
}

// ============ ATTACK BEAMS ============
interface BeamData {
	start: THREE.Vector3;
	end: THREE.Vector3;
	progress: number;
	color: string;
	speed: number;
}

function AttackBeams() {
	const [beams, setBeams] = useState<BeamData[]>([]);
	const groupRef = useRef<THREE.Group>(null);

	// Spawn new beams
	useEffect(() => {
		const spawnBeam = () => {
			// Random start position in space
			const startPhi = Math.random() * Math.PI * 2;
			const startTheta = Math.acos(2 * Math.random() - 1);
			const startDist = 4 + Math.random() * 2;
			
			const start = new THREE.Vector3(
				startDist * Math.sin(startTheta) * Math.cos(startPhi),
				startDist * Math.sin(startTheta) * Math.sin(startPhi),
				startDist * Math.cos(startTheta)
			);
			
			// Random end position on globe
			const endPhi = Math.random() * Math.PI * 2;
			const endTheta = Math.acos(2 * Math.random() - 1);
			
			const end = new THREE.Vector3(
				GLOBE_RADIUS * Math.sin(endTheta) * Math.cos(endPhi),
				GLOBE_RADIUS * Math.sin(endTheta) * Math.sin(endPhi),
				GLOBE_RADIUS * Math.cos(endTheta)
			);
			
			const colors = [PRIMARY_COLOR, SECONDARY_COLOR, ACCENT_COLOR, WARNING_COLOR];
			
			setBeams(prev => [...prev, {
				start,
				end,
				progress: 0,
				color: colors[Math.floor(Math.random() * colors.length)],
				speed: 0.5 + Math.random() * 0.5,
			}]);
		};

		// Spawn initial beams
		for (let i = 0; i < 5; i++) {
			setTimeout(spawnBeam, i * 500);
		}

		// Continue spawning
		const interval = setInterval(spawnBeam, 1500);
		return () => clearInterval(interval);
	}, []);

	useFrame((state, delta) => {
		setBeams(prev => prev
			.map(beam => ({
				...beam,
				progress: beam.progress + delta * beam.speed,
			}))
			.filter(beam => beam.progress < 1.5)
		);
		
		if (groupRef.current) {
			groupRef.current.rotation.y += 0.001;
		}
	});

	return (
		<group ref={groupRef}>
			{beams.map((beam, i) => (
				<BeamLine key={i} beam={beam} />
			))}
		</group>
	);
}

function BeamLine({ beam }: { beam: BeamData }) {
	const progress = Math.min(beam.progress, 1);
	const tailLength = 0.3;
	
	const startT = Math.max(0, progress - tailLength);
	const endT = progress;
	
	const currentStart = beam.start.clone().lerp(beam.end, startT);
	const currentEnd = beam.start.clone().lerp(beam.end, endT);
	
	const points = [currentStart, currentEnd];
	const geometry = new THREE.BufferGeometry().setFromPoints(points);
	
	const opacity = progress > 1 ? 1 - (progress - 1) * 2 : 1;
	
	return (
		<>
			<line geometry={geometry}>
				<lineBasicMaterial
					color={beam.color}
					transparent
					opacity={opacity * 0.8}
					blending={THREE.AdditiveBlending}
				/>
			</line>
			{/* Impact point */}
			{progress >= 0.9 && (
				<mesh position={beam.end}>
					<sphereGeometry args={[0.05 * (1 + (progress - 0.9) * 2), 8, 8]} />
					<meshBasicMaterial
						color={beam.color}
						transparent
						opacity={opacity * 0.6}
						blending={THREE.AdditiveBlending}
					/>
				</mesh>
			)}
		</>
	);
}

// ============ COMET STREAKS ============
function CometStreaks() {
	const [comets, setComets] = useState<{
		position: THREE.Vector3;
		velocity: THREE.Vector3;
		color: string;
		life: number;
	}[]>([]);

	useEffect(() => {
		const spawnComet = () => {
			const phi = Math.random() * Math.PI * 2;
			const theta = Math.acos(2 * Math.random() - 1);
			const dist = 5 + Math.random() * 2;
			
			const pos = new THREE.Vector3(
				dist * Math.sin(theta) * Math.cos(phi),
				dist * Math.sin(theta) * Math.sin(phi),
				dist * Math.cos(theta)
			);
			
			// Velocity toward center
			const vel = pos.clone().normalize().multiplyScalar(-0.03);
			
			setComets(prev => [...prev, {
				position: pos,
				velocity: vel,
				color: Math.random() > 0.5 ? PRIMARY_COLOR : SECONDARY_COLOR,
				life: 0,
			}]);
		};

		const interval = setInterval(spawnComet, 2000);
		return () => clearInterval(interval);
	}, []);

	useFrame(() => {
		setComets(prev => prev
			.map(comet => ({
				...comet,
				position: comet.position.clone().add(comet.velocity),
				life: comet.life + 0.02,
			}))
			.filter(comet => comet.position.length() > GLOBE_RADIUS * 0.5 && comet.life < 2)
		);
	});

	return (
		<>
			{comets.map((comet, i) => (
				<mesh key={i} position={comet.position}>
					<sphereGeometry args={[0.02, 4, 4]} />
					<meshBasicMaterial
						color={comet.color}
						transparent
						opacity={Math.max(0, 1 - comet.life)}
						blending={THREE.AdditiveBlending}
					/>
				</mesh>
			))}
		</>
	);
}

// ============ SPACE PARTICLES ============
function SpaceParticles() {
	const pointsRef = useRef<THREE.Points>(null);
	
	const positions = useMemo(() => {
		const pos: number[] = [];
		const count = 500;
		
		for (let i = 0; i < count; i++) {
			const r = 4 + Math.random() * 4;
			const theta = Math.random() * Math.PI * 2;
			const phi = Math.acos(2 * Math.random() - 1);
			
			pos.push(
				r * Math.sin(phi) * Math.cos(theta),
				r * Math.sin(phi) * Math.sin(theta),
				r * Math.cos(phi)
			);
		}
		
		return new Float32Array(pos);
	}, []);

	useFrame((state) => {
		if (pointsRef.current) {
			pointsRef.current.rotation.y += 0.0002;
			pointsRef.current.rotation.x += 0.0001;
		}
	});

	return (
		<points ref={pointsRef}>
			<bufferGeometry>
				<bufferAttribute
					attach="attributes-position"
					count={positions.length / 3}
					array={positions}
					itemSize={3}
				/>
			</bufferGeometry>
			<pointsMaterial
				size={0.02}
				color={PRIMARY_COLOR}
				transparent
				opacity={0.4}
				sizeAttenuation
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}

// ============ OUTER RING ============
function OuterRing() {
	const ringRef = useRef<THREE.Mesh>(null);

	useFrame((state) => {
		if (ringRef.current) {
			ringRef.current.rotation.z += 0.002;
			const pulse = Math.sin(state.clock.elapsedTime) * 0.1 + 1;
			ringRef.current.scale.setScalar(pulse);
		}
	});

	return (
		<mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
			<ringGeometry args={[GLOBE_RADIUS * 1.3, GLOBE_RADIUS * 1.32, 64]} />
			<meshBasicMaterial
				color={PRIMARY_COLOR}
				transparent
				opacity={0.3}
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
			<color attach="background" args={["#050a08"]} />
			<ambientLight intensity={0.1} />
			
			<DottedGlobe />
			<WireframeGlobe />
			<GridLines />
			<PulsingNodes />
			<NodeHalos />
			<AttackBeams />
			<CometStreaks />
			<SpaceParticles />
			<OuterRing />
			
			<OrbitControls
				enableZoom={true}
				enablePan={false}
				minDistance={3.5}
				maxDistance={8}
				autoRotate
				autoRotateSpeed={0.3}
			/>
			
			<EffectComposer>
				<Bloom
					intensity={1.5}
					luminanceThreshold={0.1}
					luminanceSmoothing={0.9}
					mipmapBlur
				/>
				<Vignette darkness={0.5} offset={0.3} />
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
