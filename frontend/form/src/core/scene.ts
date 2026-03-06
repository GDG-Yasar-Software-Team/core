/**
 * Scene Module
 * 
 * Creates and configures the Three.js scene.
 * Kept minimal - no lights needed for BasicMaterial.
 */

import * as THREE from "three";

/**
 * Creates a minimal Three.js scene
 * 
 * Note: We don't add lights because we use MeshBasicMaterial
 * and LineBasicMaterial which don't respond to lighting.
 * This improves performance.
 */
export function createScene(): THREE.Scene {
	const scene = new THREE.Scene();
	
	// Transparent background (renderer handles clear color)
	scene.background = null;
	
	return scene;
}
