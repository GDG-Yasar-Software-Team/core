/**
 * Camera Module
 * 
 * Creates and configures the Three.js perspective camera.
 */

import * as THREE from "three";

export interface CameraConfig {
	/** Field of view in degrees (default: 45) */
	fov?: number;
	/** Near clipping plane (default: 0.1) */
	near?: number;
	/** Far clipping plane (default: 100) */
	far?: number;
	/** Camera position [x, y, z] (default: [0, 0, 8]) */
	position?: [number, number, number];
}

/**
 * Creates a perspective camera optimized for the globe view
 * 
 * The camera is positioned to show the full globe with
 * comfortable margins around it.
 */
export function createCamera(config: CameraConfig = {}): THREE.PerspectiveCamera {
	const {
		fov = 45,
		near = 0.1,
		far = 100,
		position = [0, 0, 8],
	} = config;

	// Calculate initial aspect ratio
	const aspect = window.innerWidth / window.innerHeight;

	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	
	// Position camera to view the globe
	camera.position.set(...position);
	camera.lookAt(0, 0, 0);

	return camera;
}
