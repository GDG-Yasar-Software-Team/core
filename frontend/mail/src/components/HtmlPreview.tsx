interface HtmlPreviewProps {
	html: string;
	className?: string;
}

export default function HtmlPreview({
	html: htmlContent,
	className = "",
}: HtmlPreviewProps) {
	const srcDoc = `
		<!DOCTYPE html>
		<html>
		<head>
			<meta charset="utf-8" />
			<style>
				body {
					font-family: 'Roboto', 'Noto Sans', sans-serif;
					font-size: 14px;
					color: #333;
					padding: 16px;
					margin: 0;
				}
			</style>
		</head>
		<body>${htmlContent}</body>
		</html>
	`;

	return (
		<iframe
			title="HTML Önizleme"
			srcDoc={srcDoc}
			sandbox=""
			className={`w-full rounded-lg border border-gray-200 bg-white ${className}`}
			style={{ minHeight: "300px" }}
		/>
	);
}
