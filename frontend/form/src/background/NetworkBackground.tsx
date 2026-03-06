/**
 * NetworkBackground React Component
 * 
 * Integrates the Three.js network globe with the React application.
 * Handles initialization, animation loop, resize, and cleanup.
 * 
 * Usage:
 *   <NetworkBackground />
 * 
 * The component renders a fixed-position canvas behind all UI.
 */

import { useEffect, useRef } from "react";
import { createRenderer, createResizeHandler } from "../core/renderer";
import { createScene } from "../core/scene";
import { createCamera } from "../core/camera";
import { NetworkGlobe } from "./networkGlobe";

export function NetworkBackground() {
	const containerRef = useRef<HTMLDivElement>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// ======== INITIALIZATION ========
		
		// Create Three.js core components
		const renderer = createRenderer({ container, maxPixelRatio: 1.5 });
		const scene = createScene();
		const camera = createCamera({ position: [0, 0, 8], fov: 45 });

		// Create the network globe
		const globe = new NetworkGlobe();
		scene.add(globe.getObject());

		// ======== RESIZE HANDLING ========
		
		const handleResize = createResizeHandler(renderer, camera);
		window.addEventListener("resize", handleResize);

		// ======== ANIMATION LOOP ========
		
		let animationId: number;
		let lastTime = performance.now();

		function animate() {
			animationId = requestAnimationFrame(animate);

			// Calculate delta time for consistent animation speed
			const currentTime = performance.now();
			const deltaTime = (currentTime - lastTime) / 1000;
			lastTime = currentTime;

			// Update globe animation
			globe.update(deltaTime);

			// Render the scene
			renderer.render(scene, camera);
		}

		// Start animation
		animate();

		// ======== CLEANUP ========
		
		cleanupRef.current = () => {
			// Stop animation loop
			cancelAnimationFrame(animationId);

			// Remove resize listener
			window.removeEventListener("resize", handleResize);

			// Dispose globe resources
			globe.dispose();

			// Dispose renderer
			renderer.dispose();

			// Remove canvas from DOM
			if (container.contains(renderer.domElement)) {
				container.removeChild(renderer.domElement);
			}
		};

		return () => {
			if (cleanupRef.current) {
				cleanupRef.current();
			}
		};
	}, []);

	// Container div - will hold the canvas
	return (
		<div
			ref={containerRef}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				width: "100vw",
				height: "100vh",
				zIndex: 0,
				pointerEvents: "none",
				// No background color - let canvas show through
			}}
		/>
	);
}

export default NetworkBackground;
