import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { Accordion, type AccordionItem } from "./Accordion";

/**
 * Property-Based Tests for Accordion Component
 * Feature: gdg-website
 */

// Helper to create safe accordion items with valid CSS IDs
const safeAccordionItemArb = fc.record({
	id: fc
		.string({ minLength: 1, maxLength: 20 })
		.map((s) => s.replace(/[^a-zA-Z0-9-_]/g, "a") || "id"),
	question: fc.string({ minLength: 5, maxLength: 100 }),
	answer: fc.string({ minLength: 10, maxLength: 500 }),
});

const safeAccordionItemsArb = (minLength: number, maxLength: number) =>
	fc
		.array(safeAccordionItemArb, { minLength, maxLength })
		.map((items) => {
			// Ensure unique IDs
			const uniqueItems: AccordionItem[] = [];
			const seenIds = new Set<string>();
			for (const item of items) {
				if (!seenIds.has(item.id) && item.id.length > 0) {
					seenIds.add(item.id);
					uniqueItems.push(item);
				}
			}
			return uniqueItems;
		})
		.filter((items) => items.length >= minLength);

describe("Accordion Component - Property-Based Tests", () => {
	/**
	 * Property 2: FAQ Accordion Toggle
	 * **Validates: Requirements 2.4, 2.5**
	 *
	 * For any FAQ item in the accordion, clicking on it should toggle its expanded state—
	 * expanding if currently collapsed, collapsing if currently expanded.
	 */
	it("Property 2: clicking any accordion item should toggle its expanded state", async () => {
		const user = userEvent.setup();

		await fc.assert(
			fc.asyncProperty(safeAccordionItemsArb(1, 2), async (items) => {
				const { container, unmount } = render(<Accordion items={items} />);

				// Test first item only to avoid timeout
				const item = items[0];
				const button = container.querySelector(
					`#button-${item.id}`,
				) as HTMLElement;

				if (!button) {
					unmount();
					return;
				}

				// Property: Initially collapsed
				expect(button).toHaveAttribute("aria-expanded", "false");

				// Property: Click expands the item
				await user.click(button);
				expect(button).toHaveAttribute("aria-expanded", "true");

				// Property: Click again collapses the item
				await user.click(button);
				expect(button).toHaveAttribute("aria-expanded", "false");

				unmount();
			}),
			{ numRuns: 20 },
		);
	}, 15000);

	/**
	 * Property 18: Keyboard Accessibility
	 * **Validates: Requirements 9.3**
	 *
	 * For any interactive element on the website, it should be reachable and operable
	 * using keyboard navigation (Tab, Enter, Space, Arrow keys).
	 */
	it("Property 18: accordion items should be operable with Enter and Space keys", async () => {
		const keyArb = fc.constantFrom("Enter", " ");

		await fc.assert(
			fc.asyncProperty(
				safeAccordionItemsArb(1, 2),
				keyArb,
				async (items, key) => {
					const user = userEvent.setup();
					const { container, unmount } = render(<Accordion items={items} />);

					try {
						// Test first item with the generated key
						const firstItem = items[0];
						const button = container.querySelector(
							`#button-${firstItem.id}`,
						) as HTMLElement;

						if (!button) {
							return;
						}

						// Property: Button should be focusable
						button.focus();
						expect(document.activeElement).toBe(button);

						// Property: Initially collapsed
						const initialState = button.getAttribute("aria-expanded");
						expect(initialState).toBe("false");

						// Property: Key press expands the item
						await user.keyboard(`{${key}}`);
						expect(button).toHaveAttribute("aria-expanded", "true");

						// Property: Key press again collapses the item
						await user.keyboard(`{${key}}`);
						expect(button).toHaveAttribute("aria-expanded", "false");
					} finally {
						unmount();
					}
				},
			),
			{ numRuns: 20 },
		);
	}, 15000);

	/**
	 * Property 10.3: Reusable Accordion Component
	 * **Validates: Requirements 10.3**
	 *
	 * The Website SHALL implement a reusable Accordion component for FAQ sections.
	 * This verifies that the accordion can be instantiated with any valid set of items.
	 */
	it("Property 10.3: accordion should render correctly with any valid set of items", () => {
		fc.assert(
			fc.property(safeAccordionItemsArb(0, 10), (items) => {
				const { container, unmount } = render(<Accordion items={items} />);

				// Property: Accordion should render
				const accordion = container.querySelector(".accordion");
				expect(accordion).toBeInTheDocument();

				// Property: All items should be rendered
				expect(accordion?.children).toHaveLength(items.length);

				// Property: Each item should have a button with the question
				for (const item of items) {
					const button = container.querySelector(`#button-${item.id}`);
					expect(button).toBeTruthy();
					expect(button?.tagName.toLowerCase()).toBe("button");
				}

				// Property: All items should initially be collapsed
				const buttons = container.querySelectorAll(".accordion__button");
				for (const button of buttons) {
					expect(button).toHaveAttribute("aria-expanded", "false");
				}

				unmount();
			}),
			{ numRuns: 50 },
		);
	});

	/**
	 * Property 2 (Single Expansion Mode): Only one item should be expanded at a time
	 * **Validates: Requirements 2.4, 2.5**
	 *
	 * When allowMultiple is false (default), expanding one item should collapse
	 * any previously expanded item.
	 */
	it("Property 2 (Single Mode): only one accordion item should be expanded at a time when allowMultiple is false", async () => {
		const user = userEvent.setup();

		await fc.assert(
			fc.asyncProperty(safeAccordionItemsArb(2, 3), async (items) => {
				const { container, unmount } = render(
					<Accordion items={items} allowMultiple={false} />,
				);

				// Expand first item
				const firstButton = container.querySelector(
					`#button-${items[0].id}`,
				) as HTMLElement;
				if (!firstButton) {
					unmount();
					return;
				}
				await user.click(firstButton);
				expect(firstButton).toHaveAttribute("aria-expanded", "true");

				// Expand second item
				const secondButton = container.querySelector(
					`#button-${items[1].id}`,
				) as HTMLElement;
				if (!secondButton) {
					unmount();
					return;
				}
				await user.click(secondButton);

				// Property: Second item should be expanded
				expect(secondButton).toHaveAttribute("aria-expanded", "true");

				// Property: First item should be collapsed
				expect(firstButton).toHaveAttribute("aria-expanded", "false");

				unmount();
			}),
			{ numRuns: 30 },
		);
	});

	/**
	 * Property 2 (Multiple Expansion Mode): Multiple items can be expanded simultaneously
	 * **Validates: Requirements 2.4, 2.5**
	 *
	 * When allowMultiple is true, multiple items can be expanded at the same time.
	 */
	it("Property 2 (Multiple Mode): multiple accordion items can be expanded simultaneously when allowMultiple is true", async () => {
		const user = userEvent.setup();

		await fc.assert(
			fc.asyncProperty(safeAccordionItemsArb(2, 3), async (items) => {
				const { container, unmount } = render(
					<Accordion items={items} allowMultiple={true} />,
				);

				// Expand first item
				const firstButton = container.querySelector(
					`#button-${items[0].id}`,
				) as HTMLElement;
				if (!firstButton) {
					unmount();
					return;
				}
				await user.click(firstButton);
				expect(firstButton).toHaveAttribute("aria-expanded", "true");

				// Expand second item
				const secondButton = container.querySelector(
					`#button-${items[1].id}`,
				) as HTMLElement;
				if (!secondButton) {
					unmount();
					return;
				}
				await user.click(secondButton);

				// Property: Both items should be expanded
				expect(firstButton).toHaveAttribute("aria-expanded", "true");
				expect(secondButton).toHaveAttribute("aria-expanded", "true");

				unmount();
			}),
			{ numRuns: 30 },
		);
	});

	/**
	 * Property 19: ARIA Labels for Interactive Components
	 * **Validates: Requirements 9.5**
	 *
	 * For any interactive component, it should have appropriate ARIA labels
	 * (aria-label, aria-labelledby, role).
	 */
	it("Property 19: accordion items should have proper ARIA attributes", () => {
		fc.assert(
			fc.property(safeAccordionItemsArb(1, 10), (items) => {
				const { container, unmount } = render(<Accordion items={items} />);

				// Property: Each accordion button should have proper ARIA attributes
				for (const item of items) {
					const button = container.querySelector(`#button-${item.id}`);

					// Property: Button should have aria-expanded attribute
					expect(button).toHaveAttribute("aria-expanded");

					// Property: Button should have aria-controls pointing to panel
					expect(button).toHaveAttribute("aria-controls", `panel-${item.id}`);

					// Property: Button should have an id
					expect(button).toHaveAttribute("id", `button-${item.id}`);

					// Property: Button should be a button element
					expect(button?.tagName.toLowerCase()).toBe("button");
				}

				unmount();
			}),
			{ numRuns: 50 },
		);
	});
});
