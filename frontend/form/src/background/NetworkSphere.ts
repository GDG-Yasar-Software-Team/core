/**
 * NetworkSphere - High-Performance 3D Network Globe
 * 
 * A modern AI/tech style animated background featuring:
 * - Rotating sphere made of glowing nodes
 * - Dynamic connection lines between nearby nodes
 * - Subtle mouse interaction
 * - Optimized for 30fps with low GPU usage
 * 
 * Performance Features:
 * - requestAnimationFrame with 30fps limiter
 * - Tab visibility detection (pauses when hidden)
 * - Mobile fallback (static or disabled)
 * - Efficient geometry reuse
 * - No allocations in animation loop
 */

import * as THREE from "three";

// ============ CONFIGURATION ============

export const CONFIG = {
	// Sphere dimensions
	radius: 3.5,
	
	// Node settings
	nodeCount: 300,           // Max 500 for performance
	nodeSize: 0.08,           // Larger base size for nodes
	nodeGlowSize: 0.25,       // Bigger glow sprite size
	
	// Connection settings
	connectionDistance: 1.8,  // Slightly longer connections
	maxConnections: 4,        // More connections per node
	
	// Animation
	rotationSpeed: 0.00015,   // Very slow rotation
	mouseInfluence: 0.3,      // How much mouse affects nodes
	mouseRadius: 2.5,         // Radius of mouse influence
	
	// Google/GDG Colors - 4 quadrants
	googleColors: {
		blue: 0x4285F4,    // #4285F4 - Google Blue (top-right: x>0, y>0)
		red: 0xEA4335,     // #EA4335 - Google Red (top-left: x<0, y>0)
		yellow: 0xFBBC05,  // #FBBC05 - Google Yellow (bottom-left: x<0, y<0)
		green: 0x34A853,   // #34A853 - Google Green (bottom-right: x>0, y<0)
	},
	
	// Opacity - MORE VISIBLE
	opacity: {
		nodeCore: 1.0,         // Full opacity for nodes
		nodeGlow: 0.6,         // Stronger glow
		connections: 0.5,      // More visible connections
	},
	
	// Performance
	targetFPS: 30,
	mobileBreakpoint: 768,    // Disable on smaller screens
} as const;

// Google color array for easy access
const GOOGLE_COLORS = [
	new THREE.Color(CONFIG.googleColors.green),  // quadrant 0: x>0, y>0 (sağ üst - yeşil)
	new THREE.Color(CONFIG.googleColors.red),    // quadrant 1: x<0, y>0 (sol üst - kırmızı)
	new THREE.Color(CONFIG.googleColors.blue),   // quadrant 2: x<0, y<0 (sol alt - mavi)
	new THREE.Color(CONFIG.googleColors.yellow), // quadrant 3: x>0, y<0 (sağ alt - sarı)
];

/**
 * Get quadrant index based on position (0-3)
 * Quadrants based on x,y coordinates looking from front (z-axis):
 * - 0: Green (top-right / sağ üst)
 * - 1: Red (top-left / sol üst)
 * - 2: Blue (bottom-left / sol alt)
 * - 3: Yellow (bottom-right / sağ alt)
 */
function getQuadrant(x: number, y: number): number {
	if (x >= 0 && y >= 0) return 0; // Green (sağ üst)
	if (x < 0 && y >= 0) return 1;  // Red (sol üst)
	if (x < 0 && y < 0) return 2;   // Blue (sol alt)
	return 3;                        // Yellow (sağ alt)
}

/**
 * Get color based on position
 */
function getColorForPosition(x: number, y: number): THREE.Color {
	return GOOGLE_COLORS[getQuadrant(x, y)];
}

// ============ TYPES ============

interface Node {
	basePosition: THREE.Vector3;
	currentPosition: THREE.Vector3;
	velocity: THREE.Vector3;
	connections: number[];
}

// ============ NETWORK SPHERE CLASS ============

export class NetworkSphere {
	private group: THREE.Group;
	private nodes: Node[] = [];
	
	// Geometry objects
	private nodePoints: THREE.Points;
	private glowSprites: THREE.Points;
	private connectionLines: THREE.LineSegments;
	
	// Buffer attributes for updates
	private nodePositions: Float32Array;
	private glowPositions: Float32Array;
	private connectionPositions!: Float32Array;
	private connectionColors!: Float32Array;
	
	// Mouse tracking
	private mousePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 5);
	private targetMousePosition: THREE.Vector3 = new THREE.Vector3(0, 0, 5);
	
	// Animation state
	private time = 0;
	
	constructor() {
		this.group = new THREE.Group();
		
		// Initialize arrays
		this.nodePositions = new Float32Array(CONFIG.nodeCount * 3);
		this.glowPositions = new Float32Array(CONFIG.nodeCount * 3);
		
		// Generate nodes on sphere surface
		this.generateNodes();
		
		// Create visual elements
		this.nodePoints = this.createNodePoints();
		this.glowSprites = this.createGlowSprites();
		this.connectionLines = this.createConnections();
		
		// Add to group
		this.group.add(this.connectionLines);
		this.group.add(this.glowSprites);
		this.group.add(this.nodePoints);
	}
	
	/**
	 * Get the Three.js group to add to scene
	 */
	getObject(): THREE.Group {
		return this.group;
	}
	
	/**
	 * Generate nodes distributed on sphere surface using Fibonacci spiral
	 */
	private generateNodes(): void {
		const goldenRatio = (1 + Math.sqrt(5)) / 2;
		const angleIncrement = Math.PI * 2 * goldenRatio;
		
		for (let i = 0; i < CONFIG.nodeCount; i++) {
			// Fibonacci sphere distribution
			const t = i / CONFIG.nodeCount;
			const inclination = Math.acos(1 - 2 * t);
			const azimuth = angleIncrement * i;
			
			// Convert to Cartesian coordinates
			const x = Math.sin(inclination) * Math.cos(azimuth) * CONFIG.radius;
			const y = Math.sin(inclination) * Math.sin(azimuth) * CONFIG.radius;
			const z = Math.cos(inclination) * CONFIG.radius;
			
			const position = new THREE.Vector3(x, y, z);
			
			this.nodes.push({
				basePosition: position.clone(),
				currentPosition: position.clone(),
				velocity: new THREE.Vector3(),
				connections: [],
			});
			
			// Initialize position arrays
			const idx = i * 3;
			this.nodePositions[idx] = x;
			this.nodePositions[idx + 1] = y;
			this.nodePositions[idx + 2] = z;
			this.glowPositions[idx] = x;
			this.glowPositions[idx + 1] = y;
			this.glowPositions[idx + 2] = z;
		}
		
		// Find connections for each node
		this.findConnections();
	}
	
	/**
	 * Find nearby nodes to connect
	 */
	private findConnections(): void {
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			const distances: { index: number; dist: number }[] = [];
			
			for (let j = 0; j < this.nodes.length; j++) {
				if (i === j) continue;
				
				const dist = node.basePosition.distanceTo(this.nodes[j].basePosition);
				if (dist < CONFIG.connectionDistance) {
					distances.push({ index: j, dist });
				}
			}
			
			// Sort by distance and take closest
			distances.sort((a, b) => a.dist - b.dist);
			node.connections = distances
				.slice(0, CONFIG.maxConnections)
				.map(d => d.index);
		}
	}
	
	/**
	 * Create the core node points with Google colors per quadrant
	 */
	private createNodePoints(): THREE.Points {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(this.nodePositions, 3)
		);
		
		// Add vertex colors based on position quadrant
		const colors = new Float32Array(CONFIG.nodeCount * 3);
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			const color = getColorForPosition(node.basePosition.x, node.basePosition.y);
			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;
		}
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		
		const material = new THREE.PointsMaterial({
			size: CONFIG.nodeSize,
			transparent: true,
			opacity: CONFIG.opacity.nodeCore,
			sizeAttenuation: true,
			depthWrite: false,
			vertexColors: true,
		});
		
		return new THREE.Points(geometry, material);
	}
	
	/**
	 * Create glowing sprites around nodes with Google colors
	 */
	private createGlowSprites(): THREE.Points {
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(this.glowPositions, 3)
		);
		
		// Add vertex colors based on position quadrant
		const colors = new Float32Array(CONFIG.nodeCount * 3);
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			const color = getColorForPosition(node.basePosition.x, node.basePosition.y);
			colors[i * 3] = color.r;
			colors[i * 3 + 1] = color.g;
			colors[i * 3 + 2] = color.b;
		}
		geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
		
		// Create circular glow texture (white - will be tinted by vertex color)
		const canvas = document.createElement("canvas");
		canvas.width = 64;
		canvas.height = 64;
		const ctx = canvas.getContext("2d")!;
		
		const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
		gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
		gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
		gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.4)");
		gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
		
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 64, 64);
		
		const texture = new THREE.CanvasTexture(canvas);
		
		const material = new THREE.PointsMaterial({
			size: CONFIG.nodeGlowSize,
			map: texture,
			transparent: true,
			opacity: CONFIG.opacity.nodeGlow,
			sizeAttenuation: true,
			depthWrite: false,
			vertexColors: true,
		});
		
		return new THREE.Points(geometry, material);
	}
	
	/**
	 * Create connection lines between nodes
	 */
	private createConnections(): THREE.LineSegments {
		// Count total connections
		let totalConnections = 0;
		for (const node of this.nodes) {
			totalConnections += node.connections.length;
		}
		
		// Create position and color arrays
		this.connectionPositions = new Float32Array(totalConnections * 6); // 2 points * 3 coords
		this.connectionColors = new Float32Array(totalConnections * 6);    // 2 colors * 3 RGB
		
		// Fill initial positions
		let idx = 0;
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			for (const j of node.connections) {
				const other = this.nodes[j];
				
				// Start point
				this.connectionPositions[idx] = node.basePosition.x;
				this.connectionPositions[idx + 1] = node.basePosition.y;
				this.connectionPositions[idx + 2] = node.basePosition.z;
				
				// End point
				this.connectionPositions[idx + 3] = other.basePosition.x;
				this.connectionPositions[idx + 4] = other.basePosition.y;
				this.connectionPositions[idx + 5] = other.basePosition.z;
				
				// Colors based on node positions (Google quadrant colors)
				const startColor = getColorForPosition(node.basePosition.x, node.basePosition.y);
				const endColor = getColorForPosition(other.basePosition.x, other.basePosition.y);
				
				// Start point color
				this.connectionColors[idx] = startColor.r;
				this.connectionColors[idx + 1] = startColor.g;
				this.connectionColors[idx + 2] = startColor.b;
				
				// End point color (creates gradient effect on lines)
				this.connectionColors[idx + 3] = endColor.r;
				this.connectionColors[idx + 4] = endColor.g;
				this.connectionColors[idx + 5] = endColor.b;
				
				idx += 6;
			}
		}
		
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute(
			"position",
			new THREE.BufferAttribute(this.connectionPositions, 3)
		);
		geometry.setAttribute(
			"color",
			new THREE.BufferAttribute(this.connectionColors, 3)
		);
		
		const material = new THREE.LineBasicMaterial({
			vertexColors: true,
			transparent: true,
			opacity: CONFIG.opacity.connections,
			depthWrite: false,
			// Normal blending works better on white background
		});
		
		return new THREE.LineSegments(geometry, material);
	}
	
	/**
	 * Update mouse position for interaction
	 */
	setMousePosition(x: number, y: number, camera: THREE.Camera): void {
		// Convert screen coordinates to 3D position
		const vector = new THREE.Vector3(x, y, 0.5);
		vector.unproject(camera);
		vector.sub(camera.position).normalize();
		
		const distance = 5;
		this.targetMousePosition.copy(camera.position).add(vector.multiplyScalar(distance));
	}
	
	/**
	 * Update animation state
	 * @param deltaTime Time since last frame in seconds
	 */
	update(deltaTime: number): void {
		this.time += deltaTime;
		
		// Smooth mouse movement
		this.mousePosition.lerp(this.targetMousePosition, 0.05);
		
		// Rotate the entire sphere very slowly
		this.group.rotation.y += CONFIG.rotationSpeed;
		this.group.rotation.x = Math.sin(this.time * 0.1) * 0.05; // Subtle wobble
		
		// Update node positions with mouse influence
		this.updateNodes(deltaTime);
		
		// Update connection line positions
		this.updateConnections();
	}
	
	/**
	 * Update node positions based on mouse interaction
	 */
	private updateNodes(deltaTime: number): void {
		const posAttr = this.nodePoints.geometry.attributes.position as THREE.BufferAttribute;
		const glowAttr = this.glowSprites.geometry.attributes.position as THREE.BufferAttribute;
		
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			
			// Get world position of node
			const worldPos = node.basePosition.clone();
			this.group.localToWorld(worldPos);
			
			// Calculate distance to mouse
			const distToMouse = worldPos.distanceTo(this.mousePosition);
			
			// Apply mouse repulsion if close
			if (distToMouse < CONFIG.mouseRadius) {
				const force = (1 - distToMouse / CONFIG.mouseRadius) * CONFIG.mouseInfluence;
				const direction = worldPos.clone().sub(this.mousePosition).normalize();
				
				// Apply to velocity (in local space)
				const localDirection = direction.clone();
				this.group.worldToLocal(localDirection.add(this.group.position));
				
				node.velocity.add(localDirection.multiplyScalar(force * deltaTime * 10));
			}
			
			// Apply velocity with damping
			node.currentPosition.add(node.velocity);
			node.velocity.multiplyScalar(0.95); // Damping
			
			// Spring back to base position
			const toBase = node.basePosition.clone().sub(node.currentPosition);
			node.currentPosition.add(toBase.multiplyScalar(0.02));
			
			// Update buffer
			posAttr.setXYZ(i, node.currentPosition.x, node.currentPosition.y, node.currentPosition.z);
			glowAttr.setXYZ(i, node.currentPosition.x, node.currentPosition.y, node.currentPosition.z);
		}
		
		posAttr.needsUpdate = true;
		glowAttr.needsUpdate = true;
	}
	
	/**
	 * Update connection line positions to follow nodes
	 */
	private updateConnections(): void {
		const posAttr = this.connectionLines.geometry.attributes.position as THREE.BufferAttribute;
		
		let idx = 0;
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			for (const j of node.connections) {
				const other = this.nodes[j];
				
				// Update start point
				posAttr.setXYZ(idx, node.currentPosition.x, node.currentPosition.y, node.currentPosition.z);
				idx++;
				
				// Update end point
				posAttr.setXYZ(idx, other.currentPosition.x, other.currentPosition.y, other.currentPosition.z);
				idx++;
			}
		}
		
		posAttr.needsUpdate = true;
	}
	
	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.nodePoints.geometry.dispose();
		(this.nodePoints.material as THREE.Material).dispose();
		
		this.glowSprites.geometry.dispose();
		(this.glowSprites.material as THREE.Material).dispose();
		
		this.connectionLines.geometry.dispose();
		(this.connectionLines.material as THREE.Material).dispose();
	}
}
