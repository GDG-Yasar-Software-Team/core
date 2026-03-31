import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { Card, type CardProps } from "./Card";

/**
 * Property-Based Tests for Card Component
 * Feature: gdg-website
 */

describe("Card Component - Property-Based Tests", () => {
	/**
	 * Property 14: Interactive Element Visual Feedback
	 * **Validates: Requirements 7.1, 10.1**
	 *
	 * For any interactive element (button, link, card), it should provide
	 * visual feedback for hover, active, and focus states.
	 *
	 * This test verifies that clickable cards have the necessary CSS classes
	 * and attributes that enable visual feedback states (hover, active, focus)
	 * as defined in Card.css
	 */
	it("Property 14: clickable cards should have CSS classes that enable hover, active, and focus state styling", () => {
		// Arbitraries for generating random card configurations
		const variantArb = fc.constantFrom<CardProps["variant"]>(
			"elevated",
			"filled",
			"outlined",
		);
		const childrenArb = fc.string({ minLength: 1, maxLength: 100 });
		const classNameArb = fc.option(fc.string({ minLength: 1, maxLength: 20 }), {
			nil: "",
		});

		fc.assert(
			fc.property(
				variantArb,
				childrenArb,
				classNameArb,
				(variant, children, className) => {
					// Render the card with random props and clickable=true
					const { container } = render(
						<Card variant={variant} clickable className={className}>
							{children}
						</Card>,
					);

					const card = container.querySelector('[role="button"]');
					expect(card).not.toBeNull();

					if (!card) return;

					// Property: Card should have the base card class
					// This class provides the foundation for hover, active, and focus states
					expect(card.classList.contains("card")).toBe(true);

					// Property: Card should have variant-specific class
					// Each variant (elevated, filled, outlined) has specific hover/active/focus styles
					expect(card.classList.contains(`card--${variant}`)).toBe(true);

					// Property: Clickable card should have clickable class
					// This class enables hover cursor and user-select styling
					expect(card.classList.contains("card--clickable")).toBe(true);

					// Property: Clickable card should have role="button"
					// This makes it semantically interactive and supports accessibility
					expect(card.getAttribute("role")).toBe("button");

					// Property: Clickable card should be focusable
					// Focusable elements can receive focus and trigger :focus-visible styles
					expect(card.getAttribute("tabIndex")).toBe("0");

					// Property: Card should be a div element
					// Divs with role="button" can support interactive pseudo-classes
					expect(card.tagName.toLowerCase()).toBe("div");
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property 14 (Extended): Non-clickable cards should not have interactive attributes
	 * **Validates: Requirements 7.1, 10.1**
	 *
	 * Cards that are not clickable should not have role="button" or tabIndex,
	 * and should not have the clickable class that enables hover effects.
	 */
	it("Property 14 (Extended): non-clickable cards should not have interactive attributes", () => {
		const variantArb = fc.constantFrom<CardProps["variant"]>(
			"elevated",
			"filled",
			"outlined",
		);
		const childrenArb = fc.string({ minLength: 1, maxLength: 100 });

		fc.assert(
			fc.property(variantArb, childrenArb, (variant, children) => {
				const { container } = render(<Card variant={variant}>{children}</Card>);

				const card = container.querySelector(".card");
				expect(card).not.toBeNull();

				if (!card) return;

				// Property: Non-clickable card should have base card class
				expect(card.classList.contains("card")).toBe(true);

				// Property: Non-clickable card should have variant class
				expect(card.classList.contains(`card--${variant}`)).toBe(true);

				// Property: Non-clickable card should NOT have clickable class
				expect(card.classList.contains("card--clickable")).toBe(false);

				// Property: Non-clickable card should NOT have role="button"
				expect(card.getAttribute("role")).toBeNull();

				// Property: Non-clickable card should NOT have tabIndex
				expect(card.getAttribute("tabIndex")).toBeNull();
			}),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property 14 (Variant Combinations): All variants should support visual feedback when clickable
	 * **Validates: Requirements 7.1, 10.1**
	 *
	 * Every variant (elevated, filled, outlined) should have proper styling classes
	 * that enable hover, active, and focus states as defined in Card.css
	 */
	it("Property 14 (Variant Combinations): all variants should have proper state styling classes when clickable", () => {
		const variants: CardProps["variant"][] = ["elevated", "filled", "outlined"];

		// Test all variants
		for (const variant of variants) {
			const { container } = render(
				<Card variant={variant} clickable>
					Test Content
				</Card>,
			);

			const card = container.querySelector('[role="button"]');
			expect(card).not.toBeNull();

			if (!card) continue;

			// Property: Each variant should have both base and variant classes
			// These classes work together to provide variant-specific
			// hover, active, and focus state styling
			expect(card.classList.contains("card")).toBe(true);
			expect(card.classList.contains(`card--${variant}`)).toBe(true);
			expect(card.classList.contains("card--clickable")).toBe(true);

			// Property: Card should have role="button"
			// This enables semantic interactivity
			expect(card.getAttribute("role")).toBe("button");

			// Property: Card should be focusable
			// Focusable elements can show focus indicators
			expect(card.getAttribute("tabIndex")).toBe("0");
		}
	});

	/**
	 * Property: Card Material 3 Border Radius
	 * **Validates: Requirements 7.1, 10.1**
	 *
	 * All cards should have the Material 3 border radius (12px) applied
	 * through the card base class which uses var(--radius-lg)
	 */
	it("Property: all cards should have Material 3 border radius class", () => {
		const variantArb = fc.constantFrom<CardProps["variant"]>(
			"elevated",
			"filled",
			"outlined",
		);
		const clickableArb = fc.boolean();
		const childrenArb = fc.string({ minLength: 1, maxLength: 100 });

		fc.assert(
			fc.property(
				variantArb,
				clickableArb,
				childrenArb,
				(variant, clickable, children) => {
					const { container } = render(
						<Card variant={variant} clickable={clickable}>
							{children}
						</Card>,
					);

					const card = container.querySelector(".card");
					expect(card).not.toBeNull();

					if (!card) return;

					// Property: Card should have the base card class
					// The base card class applies border-radius: var(--radius-lg) which is 12px
					expect(card.classList.contains("card")).toBe(true);

					// Property: Card should have variant-specific class
					expect(card.classList.contains(`card--${variant}`)).toBe(true);
				},
			),
			{ numRuns: 100 },
		);
	});

	/**
	 * Property: Card Custom ClassName Preservation
	 * **Validates: Requirements 7.1, 10.1**
	 *
	 * Cards should preserve custom className prop while maintaining
	 * all required Material 3 styling classes
	 */
	it("Property: cards should preserve custom className while maintaining required classes", () => {
		const variantArb = fc.constantFrom<CardProps["variant"]>(
			"elevated",
			"filled",
			"outlined",
		);
		const clickableArb = fc.boolean();
		// Generate valid CSS class names (alphanumeric, hyphens, underscores)
		const classNameArb = fc
			.stringMatching(/^[a-zA-Z][a-zA-Z0-9_-]{0,29}$/)
			.filter((s) => s.length > 0);
		const childrenArb = fc.string({ minLength: 1, maxLength: 100 });

		fc.assert(
			fc.property(
				variantArb,
				clickableArb,
				classNameArb,
				childrenArb,
				(variant, clickable, className, children) => {
					const { container } = render(
						<Card variant={variant} clickable={clickable} className={className}>
							{children}
						</Card>,
					);

					const card = container.querySelector(".card");
					expect(card).not.toBeNull();

					if (!card) return;

					// Property: Card should have base card class
					expect(card.classList.contains("card")).toBe(true);

					// Property: Card should have variant class
					expect(card.classList.contains(`card--${variant}`)).toBe(true);

					// Property: Card should have clickable class if clickable
					if (clickable) {
						expect(card.classList.contains("card--clickable")).toBe(true);
					}

					// Property: Card should have custom className
					expect(card.classList.contains(className)).toBe(true);
				},
			),
			{ numRuns: 100 },
		);
	});
});
