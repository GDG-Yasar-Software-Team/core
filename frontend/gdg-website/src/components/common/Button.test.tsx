import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button Component", () => {
	it("renders with children text", () => {
		render(<Button variant="filled">Click me</Button>);
		expect(screen.getByText("Click me")).toBeInTheDocument();
	});

	it("applies filled variant class", () => {
		render(<Button variant="filled">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--filled");
	});

	it("applies outlined variant class", () => {
		render(<Button variant="outlined">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--outlined");
	});

	it("applies text variant class", () => {
		render(<Button variant="text">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--text");
	});

	it("applies small size class", () => {
		render(
			<Button variant="filled" size="small">
				Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--small");
	});

	it("applies medium size class by default", () => {
		render(<Button variant="filled">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--medium");
	});

	it("applies large size class", () => {
		render(
			<Button variant="filled" size="large">
				Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--large");
	});

	it("applies primary color class by default", () => {
		render(<Button variant="filled">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--primary");
	});

	it("applies secondary color class", () => {
		render(
			<Button variant="filled" color="secondary">
				Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--secondary");
	});

	it("applies disabled state", () => {
		render(
			<Button variant="filled" disabled>
				Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveClass("button--disabled");
	});

	it("applies full width class", () => {
		render(
			<Button variant="filled" fullWidth>
				Button
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveClass("button--full-width");
	});

	it("applies aria-label when provided", () => {
		render(
			<Button variant="filled" ariaLabel="Submit form">
				Submit
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-label", "Submit form");
	});

	it("uses button type by default", () => {
		render(<Button variant="filled">Button</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "button");
	});

	it("applies submit type when specified", () => {
		render(
			<Button variant="filled" type="submit">
				Submit
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("type", "submit");
	});
});
