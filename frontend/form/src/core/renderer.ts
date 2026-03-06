/**
 * WebGL Renderer Module
 * 
 * Creates and configures the Three.js WebGL renderer with
 * performance optimizations for background rendering.
 */

import * as THREE from "three";

export interface RendererConfig {
	/** Container element for the canvas */
	container: HTMLElement;
	/** Maximum device pixel ratio (default: 1.5) */
	maxPixelRatio?: number;
}

/**
 * Creates a performance-optimized WebGL renderer
 * 
 * Performance optimizations:
 * - Pixel ratio capped to prevent excessive GPU usage on retina displays
 * - Alpha enabled for transparent background
 * - Antialias disabled (subtle geometry doesn't need it)
 * - Power preference set to low-power for battery savings
 * - Stencil buffer disabled (not needed)
 */
export function createRenderer(config: RendererConfig): THREE.WebGLRenderer {
	const { container, maxPixelRatio = 1.5 } = config;

	const renderer = new THREE.WebGLRenderer({
		antialias: false,           // Disable for performance
		alpha: true,                // Transparent background
		powerPreference: "low-power", // Request integrated GPU
		stencil: false,             // Not needed for this scene
	});

	// Cap pixel ratio to prevent excessive rendering on high-DPI displays
	const pixelRatio = Math.min(window.devicePixelRatio, maxPixelRatio);
	renderer.setPixelRatio(pixelRatio);

	// Set initial size - use window dimensions for reliability
	const width = container.clientWidth || window.innerWidth;
	const height = container.clientHeight || window.innerHeight;
	renderer.setSize(width, height);

	// Clear color - white background
	renderer.setClearColor(0xffffff, 1);

	// Style the canvas to sit behind UI
	const canvas = renderer.domElement;
	canvas.style.position = "fixed";
	canvas.style.top = "0";
	canvas.style.left = "0";
	canvas.style.width = "100%";
	canvas.style.height = "100%";
	canvas.style.zIndex = "0";
	canvas.style.pointerEvents = "none";

	// Append to container
	container.appendChild(canvas);

	return renderer;
}

/**
 * Creates a resize handler for the renderer
 */
export function createResizeHandler(
	renderer: THREE.WebGLRenderer,
	camera: THREE.PerspectiveCamera
): () => void {
	return () => {
		const width = window.innerWidth;
		const height = window.innerHeight;

		camera.aspect = width / height;
		camera.updateProjectionMatrix();

		renderer.setSize(width, height);
	};
}
