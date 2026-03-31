import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { Button, type ButtonProps } from "./Button";

/**
 * Property-Based Tests for Button Component
 * Feature: gdg-website
 */

describe("Button Component - Property-Based Tests", () => {
	/**
	 * Property 14: Interactive Element Visual Feedback
	 * **Validates: Requirements 7.5**
	 *
	 * For any interactive element (button, link, card), it should provide
	 * visual feedback for hover, active, and focus states.
	 *
	 * This test verifies that buttons have the necessary CSS classes and attributes
	 * that enable visual feedback states (hover, active, focus) as defined in Button.css
	 */
	it("Property 14: should have CSS classes that enable hover, active, and focus state styling", () => {
		// Arbitraries for generating random button configurations
		const variantArb = fc.constantFrom<ButtonProps["variant"]>(
			"filled",
			"outlined",
			"text",
		);
		const sizeArb = fc.constantFrom<ButtonProps["size"]>(
			"small",
			"medium",
			"large",
		);
		const colorArb = fc.constantFrom<ButtonProps["color"]>(
			"primary",
			"secondary",
		);
		const disabledArb = fc.boolean();
		const fullWidthArb = fc.boolean();
		const childrenArb = fc.string({ minLength: 1, maxLength: 50 });

		fc.assert(
			fc.property(
				variantArb,
				sizeArb,
				colorArb,
				disabledArb,
				fullWidthArb,
				childrenArb,
				(variant, size, color, disabled, fullWidth, children) => {
					// Render the button with random props
					const { container } = render(
						<Button
							variant={variant}
							size={size}
							color={color}
							disabled={disabled}
							fullWidth={fullWidth}
						>
							{children}
						</Button>,
					);

					const button = container.querySelector("button");
					expect(button).not.toBeNull();

					if (!button) return;

					// Property: Button should have the base button class
					// This class provides the foundation for hover, active, and focus states
					expect(button.classList.contains("button")).toBe(true);

					// Property: Button should have variant-specific class
					// Each variant (filled, outlined, text) has specific hover/active/focus styles
					expect(button.classList.contains(`button--${variant}`)).toBe(true);

					// Property: Button should have color-specific class
					// Color classes define the specific colors for hover/active/focus states
					expect(button.classList.contains(`button--${color}`)).toBe(true);

					// Property: Button should be a native button element
					// Native buttons support :hover, :active, and :focus-visible pseudo-classes
					expect(button.tagName.toLowerCase()).toBe("button");

					// Property: Button should be focusable (unless disabled)
					// Focusable elements can receive focus and trigger :focus-visible styles
					if (disabled) {
						expect(button.disabled).toBe(true);
						expect(button.classList.contains("button--disabled")).toBe(true);
					} else {
						expect(button.disabled).toBe(false);
						expect(button.tabIndex).toBe(0);
					}

					// Property: Button should have type attribute
					// Proper button type ensures correct behavior in forms
					expect(button.getAttribute("type")).toBeTruthy();
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property 14 (Extended): Focus state should be keyboard accessible
	 * **Validates: Requirements 7.5**
	 *
	 * Interactive elements should be focusable and show focus indicators.
	 * This verifies that buttons are properly set up for keyboard navigation
	 * and focus state styling.
	 */
	it("Property 14 (Extended): should be focusable and have focus indicator styling capability", () => {
		const variantArb = fc.constantFrom<ButtonProps["variant"]>(
			"filled",
			"outlined",
			"text",
		);
		const colorArb = fc.constantFrom<ButtonProps["color"]>(
			"primary",
			"secondary",
		);

		fc.assert(
			fc.property(variantArb, colorArb, (variant, color) => {
				const { container } = render(
					<Button variant={variant} color={color}>
						Test Button
					</Button>,
				);

				const button = container.querySelector("button");
				expect(button).not.toBeNull();

				if (!button) return;

				// Property: Button should be focusable (tabIndex 0 by default)
				// This allows keyboard users to navigate to the button
				expect(button.tabIndex).toBe(0);

				// Property: Button should have type attribute
				// Ensures proper button behavior
				expect(button.getAttribute("type")).toBeTruthy();

				// Property: Button element should be a native button element
				// Native buttons automatically support :focus-visible pseudo-class
				expect(button.tagName.toLowerCase()).toBe("button");

				// Property: Button should not be disabled by default
				// Non-disabled buttons can receive focus and show focus indicators
				expect(button.disabled).toBe(false);
			}),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property 14 (State Combinations): All variant/color combinations should support visual feedback
	 * **Validates: Requirements 7.5**
	 *
	 * Every combination of variant and color should have proper styling classes
	 * that enable hover, active, and focus states as defined in Button.css
	 */
	it("Property 14 (State Combinations): all variant and color combinations should have proper state styling classes", () => {
		const variants: ButtonProps["variant"][] = ["filled", "outlined", "text"];
		const colors: ButtonProps["color"][] = ["primary", "secondary"];

		// Test all combinations
		for (const variant of variants) {
			for (const color of colors) {
				const { container } = render(
					<Button variant={variant} color={color}>
						Test
					</Button>,
				);

				const button = container.querySelector("button");
				expect(button).not.toBeNull();

				if (!button) continue;

				// Property: Each combination should have both variant and color classes
				// These classes work together to provide variant-specific and color-specific
				// hover, active, and focus state styling
				expect(button.classList.contains(`button--${variant}`)).toBe(true);
				expect(button.classList.contains(`button--${color}`)).toBe(true);

				// Property: Button should have the base button class
				// The base class provides common styling including transition properties
				expect(button.classList.contains("button")).toBe(true);

				// Property: Button should be a native button element
				// Native buttons support CSS pseudo-classes for interactive states
				expect(button.tagName.toLowerCase()).toBe("button");

				// Property: Button should be interactive (not disabled)
				// Interactive buttons can show hover, active, and focus states
				expect(button.disabled).toBe(false);
			}
		}
	});

	/**
	 * Property 14 (Disabled State): Disabled buttons should not provide interactive feedback
	 * **Validates: Requirements 7.5**
	 *
	 * Disabled buttons should have the disabled class and attribute,
	 * which prevents hover/active states from being triggered
	 */
	it("Property 14 (Disabled State): disabled buttons should have proper disabled styling class", () => {
		const variantArb = fc.constantFrom<ButtonProps["variant"]>(
			"filled",
			"outlined",
			"text",
		);
		const colorArb = fc.constantFrom<ButtonProps["color"]>(
			"primary",
			"secondary",
		);

		fc.assert(
			fc.property(variantArb, colorArb, (variant, color) => {
				const { container } = render(
					<Button variant={variant} color={color} disabled>
						Disabled Button
					</Button>,
				);

				const button = container.querySelector("button");
				expect(button).not.toBeNull();

				if (!button) return;

				// Property: Disabled button should have disabled attribute
				// This prevents interaction and disables hover/active states
				expect(button.disabled).toBe(true);

				// Property: Disabled button should have disabled class
				// This class applies visual styling to indicate disabled state
				expect(button.classList.contains("button--disabled")).toBe(true);

				// Property: Disabled button should still have base classes
				// Base classes are present but disabled state overrides interactive styles
				expect(button.classList.contains("button")).toBe(true);
				expect(button.classList.contains(`button--${variant}`)).toBe(true);
				expect(button.classList.contains(`button--${color}`)).toBe(true);
			}),
			{ numRuns: 100 },
		);
	});
});
