/**
 * Network Globe Module
 * 
 * Creates a "digital network infrastructure" visualization:
 * - Low-poly icosahedron wireframe sphere
 * - Network nodes distributed on the surface
 * - Connection lines between nearby nodes
 * - Data particles flowing along connections
 * 
 * Performance Optimizations:
 * - All geometry created once at initialization
 * - No object creation in animation loop
 * - Low polygon count (~42 vertices for wireframe)
 * - Limited node count (~80 nodes)
 * - Simple materials (no lighting calculations)
 */

import * as THREE from "three";

// ============ CONFIGURATION ============

const CONFIG = {
	// Globe dimensions
	radius: 3,
	wireframeDetail: 1, // Icosahedron subdivision (1 = 42 vertices)
	
	// Network settings
	nodeCount: 100,          // Total nodes on sphere (balanced for performance)
	connectionDistance: 1.8, // Max distance for node connections
	dataParticleCount: 20,   // Flowing data particles
	
	// Animation speeds (very slow for subtlety)
	rotationSpeed: 0.0003,   // Slower rotation for elegance
	nodePulseSpeed: 0.0015,
	dataFlowSpeed: 0.002,
	
	// Colors - teal palette matching login accent (#34c9a5)
	colors: {
		wireframe: 0x34c9a5,
		nodes: 0x34c9a5,
		connections: 0x34c9a5,
		dataParticles: 0x2db89a,
	},
	
	// Opacity levels - subtle but visible on white
	opacity: {
		wireframe: 0.15,
		nodes: 0.7,
		connections: 0.25,
		dataParticles: 0.9,
	},
	
	// Sizes
	nodeSize: 0.08,
	dataParticleSize: 0.12,
} as const;

// ============ TYPES ============

interface NetworkNode {
	position: THREE.Vector3;
	basePosition: THREE.Vector3;
	phase: number; // For pulse animation
}

interface Connection {
	startIndex: number;
	endIndex: number;
	startPos: THREE.Vector3;
	endPos: THREE.Vector3;
}

interface DataParticle {
	connectionIndex: number;
	progress: number; // 0 to 1 along the connection
	speed: number;
}

// ============ GLOBE CLASS ============

export class NetworkGlobe {
	// Three.js objects
	private group: THREE.Group;
	private wireframe: THREE.LineSegments;
	private nodePoints: THREE.Points;
	private connectionLines: THREE.LineSegments;
	private dataParticlePoints: THREE.Points;
	
	// Data structures
	private nodes: NetworkNode[] = [];
	private connections: Connection[] = [];
	private dataParticles: DataParticle[] = [];
	
	// Animation state (stored to avoid allocation in loop)
	private time = 0;
	private nodePositions!: Float32Array;
	private dataParticlePositions!: Float32Array;
	
	constructor() {
		// Create main group to hold all elements
		this.group = new THREE.Group();
		
		// Initialize all components
		this.wireframe = this.createWireframe();
		this.nodePoints = this.createNodes();
		this.connectionLines = this.createConnections();
		this.dataParticlePoints = this.createDataParticles();
		
		// Add all to group
		this.group.add(this.wireframe);
		this.group.add(this.nodePoints);
		this.group.add(this.connectionLines);
		this.group.add(this.dataParticlePoints);
	}
	
	/**
	 * Get the Three.js group to add to scene
	 */
	getObject(): THREE.Group {
		return this.group;
	}
	
	/**
	 * Creates the low-poly wireframe sphere
	 */
	private createWireframe(): THREE.LineSegments {
		const geometry = new THREE.IcosahedronGeometry(
			CONFIG.radius,
			CONFIG.wireframeDetail
		);
		
		const edgesGeometry = new THREE.EdgesGeometry(geometry);
		
		const material = new THREE.LineBasicMaterial({
			color: CONFIG.colors.wireframe,
			transparent: true,
			opacity: CONFIG.opacity.wireframe,
		});
		
		// Clean up original geometry
		geometry.dispose();
		
		return new THREE.LineSegments(edgesGeometry, material);
	}
	
	/**
	 * Creates network nodes distributed on the sphere surface
	 * Uses Fibonacci sphere distribution for even spacing
	 */
	private createNodes(): THREE.Points {
		const positions: number[] = [];
		
		// Fibonacci sphere algorithm for even distribution
		const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
		
		for (let i = 0; i < CONFIG.nodeCount; i++) {
			// Calculate position on unit sphere
			const y = 1 - (i / (CONFIG.nodeCount - 1)) * 2; // y goes from 1 to -1
			const radiusAtY = Math.sqrt(1 - y * y);
			const theta = phi * i;
			
			const x = Math.cos(theta) * radiusAtY;
			const z = Math.sin(theta) * radiusAtY;
			
			// Scale to globe radius (slightly outside wireframe)
			const pos = new THREE.Vector3(x, y, z).multiplyScalar(CONFIG.radius * 1.01);
			
			// Store node data
			this.nodes.push({
				position: pos.clone(),
				basePosition: pos.clone(),
				phase: Math.random() * Math.PI * 2, // Random phase for pulse
			});
			
			positions.push(pos.x, pos.y, pos.z);
		}
		
		// Create buffer geometry
		const geometry = new THREE.BufferGeometry();
		this.nodePositions = new Float32Array(positions);
		geometry.setAttribute("position", new THREE.BufferAttribute(this.nodePositions, 3));
		
		const material = new THREE.PointsMaterial({
			color: CONFIG.colors.nodes,
			size: CONFIG.nodeSize,
			transparent: true,
			opacity: CONFIG.opacity.nodes,
			sizeAttenuation: true,
		});
		
		return new THREE.Points(geometry, material);
	}
	
	/**
	 * Creates connection lines between nearby nodes
	 */
	private createConnections(): THREE.LineSegments {
		const positions: number[] = [];
		
		// Find connections between nearby nodes
		for (let i = 0; i < this.nodes.length; i++) {
			for (let j = i + 1; j < this.nodes.length; j++) {
				const distance = this.nodes[i].basePosition.distanceTo(this.nodes[j].basePosition);
				
				if (distance < CONFIG.connectionDistance) {
					// Store connection data
					this.connections.push({
						startIndex: i,
						endIndex: j,
						startPos: this.nodes[i].basePosition,
						endPos: this.nodes[j].basePosition,
					});
					
					// Add line segment (start and end points)
					positions.push(
						this.nodes[i].basePosition.x,
						this.nodes[i].basePosition.y,
						this.nodes[i].basePosition.z,
						this.nodes[j].basePosition.x,
						this.nodes[j].basePosition.y,
						this.nodes[j].basePosition.z
					);
				}
			}
		}
		
		const geometry = new THREE.BufferGeometry();
		geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(positions), 3));
		
		const material = new THREE.LineBasicMaterial({
			color: CONFIG.colors.connections,
			transparent: true,
			opacity: CONFIG.opacity.connections,
		});
		
		return new THREE.LineSegments(geometry, material);
	}
	
	/**
	 * Creates data particles that flow along connections
	 */
	private createDataParticles(): THREE.Points {
		// Initialize data particles on random connections
		const positions: number[] = [];
		
		// Safety check - need connections for particles
		if (this.connections.length === 0) {
			const geometry = new THREE.BufferGeometry();
			this.dataParticlePositions = new Float32Array(0);
			geometry.setAttribute("position", new THREE.BufferAttribute(this.dataParticlePositions, 3));
			const material = new THREE.PointsMaterial({
				color: CONFIG.colors.dataParticles,
				size: CONFIG.dataParticleSize,
			});
			return new THREE.Points(geometry, material);
		}
		
		for (let i = 0; i < CONFIG.dataParticleCount; i++) {
			// Pick a random connection
			const connectionIndex = Math.floor(Math.random() * this.connections.length);
			const connection = this.connections[connectionIndex];
			
			// Random position along connection
			const progress = Math.random();
			
			// Random speed variation
			const speed = CONFIG.dataFlowSpeed * (0.5 + Math.random());
			
			this.dataParticles.push({
				connectionIndex,
				progress,
				speed,
			});
			
			// Calculate initial position
			const pos = new THREE.Vector3().lerpVectors(
				connection.startPos,
				connection.endPos,
				progress
			);
			
			positions.push(pos.x, pos.y, pos.z);
		}
		
		const geometry = new THREE.BufferGeometry();
		this.dataParticlePositions = new Float32Array(positions);
		geometry.setAttribute("position", new THREE.BufferAttribute(this.dataParticlePositions, 3));
		
		const material = new THREE.PointsMaterial({
			color: CONFIG.colors.dataParticles,
			size: CONFIG.dataParticleSize,
			transparent: true,
			opacity: CONFIG.opacity.dataParticles,
			sizeAttenuation: true,
		});
		
		return new THREE.Points(geometry, material);
	}
	
	/**
	 * Update animation state
	 * Called every frame from the render loop
	 * 
	 * IMPORTANT: No object allocation happens here for performance
	 */
	update(deltaTime: number): void {
		this.time += deltaTime;
		
		// 1. Rotate the entire globe slowly
		this.group.rotation.y += CONFIG.rotationSpeed;
		this.group.rotation.x += CONFIG.rotationSpeed * 0.3;
		
		// 2. Pulse nodes (subtle size variation via position offset)
		this.updateNodePulse();
		
		// 3. Move data particles along connections
		this.updateDataParticles();
	}
	
	/**
	 * Updates node positions with subtle pulse effect
	 */
	private updateNodePulse(): void {
		const posAttr = this.nodePoints.geometry.attributes.position as THREE.BufferAttribute;
		
		for (let i = 0; i < this.nodes.length; i++) {
			const node = this.nodes[i];
			
			// Calculate pulse offset (subtle radial movement)
			const pulse = Math.sin(this.time * CONFIG.nodePulseSpeed + node.phase) * 0.02;
			const scale = 1 + pulse;
			
			// Update position (no new Vector3 created)
			posAttr.setXYZ(
				i,
				node.basePosition.x * scale,
				node.basePosition.y * scale,
				node.basePosition.z * scale
			);
		}
		
		posAttr.needsUpdate = true;
	}
	
	/**
	 * Updates data particle positions along connections
	 */
	private updateDataParticles(): void {
		const posAttr = this.dataParticlePoints.geometry.attributes.position as THREE.BufferAttribute;
		
		for (let i = 0; i < this.dataParticles.length; i++) {
			const particle = this.dataParticles[i];
			
			// Move particle along connection
			particle.progress += particle.speed;
			
			// Reset when reaching end (jump to new random connection)
			if (particle.progress >= 1) {
				particle.progress = 0;
				particle.connectionIndex = Math.floor(Math.random() * this.connections.length);
				particle.speed = CONFIG.dataFlowSpeed * (0.5 + Math.random());
			}
			
			// Calculate position along connection line
			const conn = this.connections[particle.connectionIndex];
			
			// Linear interpolation (manual to avoid allocation)
			const t = particle.progress;
			const x = conn.startPos.x + (conn.endPos.x - conn.startPos.x) * t;
			const y = conn.startPos.y + (conn.endPos.y - conn.startPos.y) * t;
			const z = conn.startPos.z + (conn.endPos.z - conn.startPos.z) * t;
			
			posAttr.setXYZ(i, x, y, z);
		}
		
		posAttr.needsUpdate = true;
	}
	
	/**
	 * Clean up resources
	 */
	dispose(): void {
		this.wireframe.geometry.dispose();
		(this.wireframe.material as THREE.Material).dispose();
		
		this.nodePoints.geometry.dispose();
		(this.nodePoints.material as THREE.Material).dispose();
		
		this.connectionLines.geometry.dispose();
		(this.connectionLines.material as THREE.Material).dispose();
		
		this.dataParticlePoints.geometry.dispose();
		(this.dataParticlePoints.material as THREE.Material).dispose();
	}
}
