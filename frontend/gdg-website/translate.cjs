const fs = require("node:fs");

const path =
	"C:/Users/burak/Pictures/Screenshots/core/frontend/gdg-website/src/pages/About/AboutPage.tsx";
let content = fs.readFileSync(path, "utf8");

const replacements = [
	[
		"We are a university-based student community that brings together individuals interested in technology, innovation, and personal development.",
		"We are a university-based student community that brings together individuals interested in technology, innovation, and personal development.",
	],
	[
		"Our members come from different backgrounds, but we share a common goal: learning by doing and growing together.",
		"Our members come from different backgrounds, but we share a common goal: learning by doing and growing together.",
	],
	[
		"We are more than just a club; we are a community that bridges the gap between theory and practice. Check out our diverse domains where we learn, build, and grow together.",
		"We are more than just a club; we are a community that bridges the gap between theory and practice. Check out our diverse domains where we learn, build, and grow together.",
	],
];

for (const [search, replacement] of replacements) {
	content = content.replace(search, replacement);
}

fs.writeFileSync(path, content, "utf8");
