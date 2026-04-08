import { html } from "@codemirror/lang-html";
import CodeMirror from "@uiw/react-codemirror";

interface HtmlEditorProps {
	value: string;
	onChange: (value: string) => void;
	height?: string;
}

export default function HtmlEditor({
	value,
	onChange,
	height = "400px",
}: HtmlEditorProps) {
	return (
		<div className="overflow-hidden rounded-lg border border-gray-300 focus-within:border-google-blue focus-within:ring-2 focus-within:ring-blue-100">
			<CodeMirror
				value={value}
				height={height}
				extensions={[html()]}
				onChange={onChange}
				basicSetup={{
					lineNumbers: true,
					foldGutter: true,
					highlightActiveLineGutter: true,
					highlightActiveLine: true,
					bracketMatching: true,
					autocompletion: true,
				}}
			/>
		</div>
	);
}
