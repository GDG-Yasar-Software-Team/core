import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card Component", () => {
	it("renders with children content", () => {
		render(<Card variant="elevated">Card content</Card>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("applies elevated variant class", () => {
		const { container } = render(<Card variant="elevated">Content</Card>);
		const card = container.querySelector(".card");
		expect(card).toHaveClass("card--elevated");
	});

	it("applies filled variant class", () => {
		const { container } = render(<Card variant="filled">Content</Card>);
		const card = container.querySelector(".card");
		expect(card).toHaveClass("card--filled");
	});

	it("applies outlined variant class", () => {
		const { container } = render(<Card variant="outlined">Content</Card>);
		const card = container.querySelector(".card");
		expect(card).toHaveClass("card--outlined");
	});

	it("applies clickable class when clickable is true", () => {
		const { container } = render(
			<Card variant="elevated" clickable>
				Content
			</Card>,
		);
		const card = container.querySelector(".card");
		expect(card).toHaveClass("card--clickable");
	});

	it("applies custom className", () => {
		const { container } = render(
			<Card variant="elevated" className="custom-class">
				Content
			</Card>,
		);
		const card = container.querySelector(".card");
		expect(card).toHaveClass("custom-class");
	});

	it("has role button when clickable", () => {
		render(
			<Card variant="elevated" clickable>
				Content
			</Card>,
		);
		expect(screen.getByRole("button")).toBeInTheDocument();
	});

	it("has tabIndex 0 when clickable", () => {
		render(
			<Card variant="elevated" clickable>
				Content
			</Card>,
		);
		const card = screen.getByRole("button");
		expect(card).toHaveAttribute("tabIndex", "0");
	});

	it("does not have role button when not clickable", () => {
		render(<Card variant="elevated">Content</Card>);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("calls onClick when clicked and clickable", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(
			<Card variant="elevated" clickable onClick={handleClick}>
				Content
			</Card>,
		);
		const card = screen.getByRole("button");
		await user.click(card);
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("does not call onClick when not clickable", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		const { container } = render(
			<Card variant="elevated" onClick={handleClick}>
				Content
			</Card>,
		);
		const card = container.querySelector(".card");
		if (card) {
			await user.click(card);
		}
		expect(handleClick).not.toHaveBeenCalled();
	});

	it("calls onClick when Enter key is pressed and clickable", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(
			<Card variant="elevated" clickable onClick={handleClick}>
				Content
			</Card>,
		);
		const card = screen.getByRole("button");
		card.focus();
		await user.keyboard("{Enter}");
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("calls onClick when Space key is pressed and clickable", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(
			<Card variant="elevated" clickable onClick={handleClick}>
				Content
			</Card>,
		);
		const card = screen.getByRole("button");
		card.focus();
		await user.keyboard(" ");
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("does not call onClick when other keys are pressed", async () => {
		const user = userEvent.setup();
		const handleClick = vi.fn();
		render(
			<Card variant="elevated" clickable onClick={handleClick}>
				Content
			</Card>,
		);
		const card = screen.getByRole("button");
		card.focus();
		await user.keyboard("a");
		expect(handleClick).not.toHaveBeenCalled();
	});
});
