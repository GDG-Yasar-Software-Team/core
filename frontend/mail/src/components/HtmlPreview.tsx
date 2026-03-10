import { useEffect, useRef } from "react";

interface HtmlPreviewProps {
	html: string;
	className?: string;
}

export default function HtmlPreview({
	html: htmlContent,
	className = "",
}: HtmlPreviewProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;
		const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
		if (!doc) return;
		doc.open();
		doc.write(`
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
		`);
		doc.close();
	}, [htmlContent]);

	return (
		<iframe
			ref={iframeRef}
			title="HTML Önizleme"
			sandbox="allow-same-origin"
			className={`w-full rounded-lg border border-gray-200 bg-white ${className}`}
			style={{ minHeight: "300px" }}
		/>
	);
}
