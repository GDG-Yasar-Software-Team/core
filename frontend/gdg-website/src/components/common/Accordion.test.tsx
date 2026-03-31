import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Accordion, type AccordionItem } from "./Accordion";

const mockItems: AccordionItem[] = [
	{
		id: "1",
		question: "What is GDG?",
		answer: "Google Developer Groups are community groups for developers.",
	},
	{
		id: "2",
		question: "How do I join?",
		answer: "You can join by attending our events.",
	},
	{
		id: "3",
		question: "Are events free?",
		answer: "Yes, all our events are free to attend.",
	},
];

describe("Accordion Component", () => {
	it("renders all accordion items", () => {
		render(<Accordion items={mockItems} />);
		expect(screen.getByText("What is GDG?")).toBeInTheDocument();
		expect(screen.getByText("How do I join?")).toBeInTheDocument();
		expect(screen.getByText("Are events free?")).toBeInTheDocument();
	});

	it("initially renders all items collapsed", () => {
		render(<Accordion items={mockItems} />);
		const buttons = screen.getAllByRole("button");
		for (const button of buttons) {
			expect(button).toHaveAttribute("aria-expanded", "false");
		}
	});

	it("expands item when clicked", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
		expect(
			screen.getByText(
				"Google Developer Groups are community groups for developers.",
			),
		).toBeInTheDocument();
	});

	it("collapses expanded item when clicked again", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });

		// Expand
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");

		// Collapse
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "false");
	});

	it("collapses previously expanded item when another is clicked (single mode)", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		const secondButton = screen.getByRole("button", {
			name: /How do I join?/i,
		});

		// Expand first
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");

		// Expand second (should collapse first)
		await user.click(secondButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "false");
		expect(secondButton).toHaveAttribute("aria-expanded", "true");
	});

	it("allows multiple items to be expanded when allowMultiple is true", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} allowMultiple />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		const secondButton = screen.getByRole("button", {
			name: /How do I join?/i,
		});

		// Expand first
		await user.click(firstButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");

		// Expand second (first should remain expanded)
		await user.click(secondButton);
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
		expect(secondButton).toHaveAttribute("aria-expanded", "true");
	});

	it("expands item when Enter key is pressed", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		firstButton.focus();
		await user.keyboard("{Enter}");
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
	});

	it("expands item when Space key is pressed", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		firstButton.focus();
		await user.keyboard(" ");
		expect(firstButton).toHaveAttribute("aria-expanded", "true");
	});

	it("does not expand item when other keys are pressed", async () => {
		const user = userEvent.setup();
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });
		firstButton.focus();
		await user.keyboard("a");
		expect(firstButton).toHaveAttribute("aria-expanded", "false");
	});

	it("has correct ARIA attributes", () => {
		render(<Accordion items={mockItems} />);
		const firstButton = screen.getByRole("button", { name: /What is GDG?/i });

		expect(firstButton).toHaveAttribute("aria-expanded");
		expect(firstButton).toHaveAttribute("aria-controls", "panel-1");
		expect(firstButton).toHaveAttribute("id", "button-1");
	});

	it("renders empty accordion when no items provided", () => {
		const { container } = render(<Accordion items={[]} />);
		const accordion = container.querySelector(".accordion");
		expect(accordion).toBeInTheDocument();
		expect(accordion?.children).toHaveLength(0);
	});

	it("handles single item accordion", async () => {
		const user = userEvent.setup();
		const singleItem: AccordionItem[] = [
			{
				id: "1",
				question: "Single question?",
				answer: "Single answer.",
			},
		];
		render(<Accordion items={singleItem} />);
		const button = screen.getByRole("button", { name: /Single question?/i });
		await user.click(button);
		expect(button).toHaveAttribute("aria-expanded", "true");
		expect(screen.getByText("Single answer.")).toBeInTheDocument();
	});
});
