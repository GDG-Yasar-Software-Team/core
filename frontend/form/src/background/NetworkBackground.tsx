/**
 * NetworkBackground - High-Performance 3D Background Component
 * 
 * Features:
 * - 30fps animation limiter for low CPU/GPU usage
 * - Tab visibility detection (pauses when hidden)
 * - Mouse interaction for subtle node movement
 * - Mobile fallback (disabled on small screens)
 * - Smooth resize handling
 * 
 * Usage:
 *   <NetworkBackground />
 */

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { NetworkSphere, CONFIG } from "./NetworkSphere";

// Performance constants
const TARGET_FPS = CONFIG.targetFPS;
const FRAME_DURATION = 1000 / TARGET_FPS;
const MOBILE_BREAKPOINT = CONFIG.mobileBreakpoint;

export function NetworkBackground() {
	const containerRef = useRef<HTMLDivElement>(null);
	const stateRef = useRef<{
		renderer: THREE.WebGLRenderer | null;
		scene: THREE.Scene | null;
		camera: THREE.PerspectiveCamera | null;
		sphere: NetworkSphere | null;
		animationId: number | null;
		lastFrameTime: number;
		isVisible: boolean;
		isMobile: boolean;
		mouseX: number;
		mouseY: number;
	}>({
		renderer: null,
		scene: null,
		camera: null,
		sphere: null,
		animationId: null,
		lastFrameTime: 0,
		isVisible: true,
		isMobile: false,
		mouseX: 0,
		mouseY: 0,
	});

	// Check if mobile
	const checkMobile = useCallback(() => {
		return window.innerWidth < MOBILE_BREAKPOINT;
	}, []);

	// Handle mouse movement
	const handleMouseMove = useCallback((event: MouseEvent) => {
		const state = stateRef.current;
		if (!state.camera) return;
		
		// Normalize coordinates to -1 to 1
		state.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
		state.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
		
		// Update sphere mouse position
		if (state.sphere) {
			state.sphere.setMousePosition(state.mouseX, state.mouseY, state.camera);
		}
	}, []);

	// Handle visibility change
	const handleVisibilityChange = useCallback(() => {
		stateRef.current.isVisible = !document.hidden;
	}, []);

	// Handle resize
	const handleResize = useCallback(() => {
		const state = stateRef.current;
		if (!state.renderer || !state.camera) return;
		
		const width = window.innerWidth;
		const height = window.innerHeight;
		
		// Check mobile
		const wasMobile = state.isMobile;
		state.isMobile = checkMobile();
		
		// If switching to/from mobile, may need to reinitialize
		if (wasMobile !== state.isMobile) {
			// Will be handled by the animation loop
		}
		
		state.camera.aspect = width / height;
		state.camera.updateProjectionMatrix();
		state.renderer.setSize(width, height);
	}, [checkMobile]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;
		
		const state = stateRef.current;
		
		// Check if mobile - show static fallback
		state.isMobile = checkMobile();
		
		// ======== RENDERER SETUP ========
		const renderer = new THREE.WebGLRenderer({
			antialias: false,
			alpha: true,
			powerPreference: "low-power",
			stencil: false,
		});
		
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0xffffff, 1);
		
		// Style canvas
		const canvas = renderer.domElement;
		canvas.style.position = "fixed";
		canvas.style.top = "0";
		canvas.style.left = "0";
		canvas.style.width = "100%";
		canvas.style.height = "100%";
		canvas.style.zIndex = "0";
		canvas.style.pointerEvents = "none";
		
		container.appendChild(canvas);
		state.renderer = renderer;
		
		// ======== SCENE SETUP ========
		const scene = new THREE.Scene();
		scene.background = null;
		state.scene = scene;
		
		// ======== CAMERA SETUP ========
		const camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			100
		);
		camera.position.set(0, 0, 8);
		state.camera = camera;
		
		// ======== SPHERE SETUP ========
		if (!state.isMobile) {
			const sphere = new NetworkSphere();
			scene.add(sphere.getObject());
			state.sphere = sphere;
		}
		
		// ======== EVENT LISTENERS ========
		window.addEventListener("resize", handleResize);
		window.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		
		// ======== ANIMATION LOOP ========
		let lastTime = performance.now();
		
		function animate(currentTime: number) {
			state.animationId = requestAnimationFrame(animate);
			
			// Skip if not visible or mobile
			if (!state.isVisible || state.isMobile) return;
			
			// 30fps limiter
			const elapsed = currentTime - lastTime;
			if (elapsed < FRAME_DURATION) return;
			
			// Adjust for actual elapsed time
			const deltaTime = elapsed / 1000;
			lastTime = currentTime - (elapsed % FRAME_DURATION);
			
			// Update sphere
			if (state.sphere) {
				state.sphere.update(deltaTime);
			}
			
			// Render
			if (state.renderer && state.scene && state.camera) {
				state.renderer.render(state.scene, state.camera);
			}
		}
		
		// Start animation
		state.animationId = requestAnimationFrame(animate);
		
		// Initial render
		if (state.renderer && state.scene && state.camera) {
			state.renderer.render(state.scene, state.camera);
		}
		
		// ======== CLEANUP ========
		return () => {
			// Stop animation
			if (state.animationId) {
				cancelAnimationFrame(state.animationId);
			}
			
			// Remove listeners
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			
			// Dispose sphere
			if (state.sphere) {
				state.sphere.dispose();
			}
			
			// Dispose renderer
			if (state.renderer) {
				state.renderer.dispose();
				if (container.contains(state.renderer.domElement)) {
					container.removeChild(state.renderer.domElement);
				}
			}
		};
	}, [checkMobile, handleMouseMove, handleResize, handleVisibilityChange]);

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
			}}
		/>
	);
}

export default NetworkBackground;
