import { cn } from "@/lib/utils";
import Editor, { loader, useMonaco } from "@monaco-editor/react";
import * as monacoEditor from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTheme } from "./ui/themeProvider";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Label } from "./ui/label";

self.MonacoEnvironment = {
	getWorker(_, label) {
		if (label === "json") {
			return new jsonWorker();
		}
		if (label === "css" || label === "scss" || label === "less") {
			return new cssWorker();
		}
		if (label === "html" || label === "handlebars" || label === "razor") {
			return new htmlWorker();
		}
		if (label === "typescript" || label === "javascript") {
			return new tsWorker();
		}
		return new editorWorker();
	},
};

loader.config({ monaco });

loader.init().then(/* ... */);

type ExtendedProps = {
	onGutterClicked?: (lineNumber: number) => void;
	format?: boolean;
	debounceTime?: number;
	ideMode?: boolean;
	placeholder?: string;
};

export type MonacoModel = monacoEditor.editor.IModel;
export type MonacoProviderResults = monacoEditor.languages.ProviderResult<monacoEditor.languages.CompletionList>;
export type MonacoLanguagesItemProvider = monacoEditor.languages.CompletionItemProvider;
export type IMonaco = typeof monacoEditor;

export function useTypedMonaco() {
	return useMonaco() as IMonaco | undefined;
}

export type MonacoEditorProps = React.ComponentProps<typeof Editor> & ExtendedProps;

// function getEditorHeight(value: any) {
// 	const lines = typeof value === "string" ? (value.match(/\n/g)?.length ?? 0) + 1 : 0;
// 	return `${Math.min(lines * 19, 400) + 26}px`;
// }

function getInitialShowPlaceholder(values: (string | undefined | null)[]) {
	for (const value of values) {
		if (value && value.length > 0) {
			return false;
		}
	}
	return true;
}

export const MonacoEditor = (props: MonacoEditorProps): JSX.Element | null => {
	const {
		language,
		format,
		defaultValue,
		value,
		onGutterClicked,
		onChange,
		debounceTime,
		className,
		height,
		options,
		placeholder,
		...rest
	} = props;

	const handleClick = (e: any) => {
		if (onGutterClicked && "glyphMarginLeft" in e.target.detail) {
			onGutterClicked(e.target.position.lineNumber);
		}
	};
	//const [editorHeight, setEditorHeight] = useState(height ?? getEditorHeight(props.value ?? props.defaultValue ?? ""));

	const [showPlaceholder, setShowPlaceholder] = useState<boolean>(getInitialShowPlaceholder([defaultValue, value]));
	useEffect(() => {
		if (value !== undefined) {
			setShowPlaceholder(getInitialShowPlaceholder([value]));
		}
	}, [value]);
	const { theme } = useTheme();
	const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);

	const insertText = useCallback((text: string) => {
		if (editorRef.current) {
			const selections = editorRef.current.getSelections();
			if (selections) {
				editorRef.current.executeEdits(
					null,
					selections.map((selection) => ({ range: selection, text: text, forceMoveMarkers: true }))
				);
				editorRef.current.focus();
			}
		}
	}, []);

	return (
		<div className="flex-1 relative w-full">
			<div className="flex gap-2 items-center my-2">
				<Label>Quick Insert</Label>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline">Sender</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => insertText("{{sender.name}}")}>Name</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.email}}")}>Email</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.phoneNumber}}")}>Phone</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() =>
								insertText(
									"{{sender.address.street}} {{sender.address.city}}, {{sender.address.state}} {{sender.address.zip}}"
								)
							}
						>
							Address
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.address.street}}")}>Street</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.address.city}}")}>City</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.adddress.state}}")}>State</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{sender.address.zip}}")}>Zip</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => insertText("{{sender.custom.personalMessage}}")}>
							Personal Message
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant="outline">Legislator</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuItem onClick={() => insertText("{{legislator.name}}")}>Name</DropdownMenuItem>
						<DropdownMenuItem onClick={() => insertText("{{legislator.address}}")}>Address</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			<Editor
				height={500}
				language={language}
				onMount={(editor) => {
					editorRef.current = editor;
					if (format) {
						editor.getAction("editor.action.formatDocument")?.run();
					}
					editor.onMouseDown(handleClick);
				}}
				options={{
					fontFamily: `ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`,
					wordWrap: "on",
					renderLineHighlight: "none",
					lineNumbers: "off",
					minimap: { enabled: false },
					...options,
					wordBasedSuggestions: "off",
					automaticLayout: true,
					folding: false,
					glyphMargin: false,
				}}
				theme={`vs-${theme}`}
				defaultValue={defaultValue}
				value={value}
				onChange={(v, e) => {
					// if (height === undefined && v) {
					// 	setEditorHeight(getEditorHeight(v));
					// }
					if (v && v.length > 0 && showPlaceholder) {
						setShowPlaceholder(false);
					}
					if (!v || (v.length === 0 && !showPlaceholder)) {
						setShowPlaceholder(true);
					}
					onChange?.(v, e);
				}}
				defaultLanguage="liquid"
				className={cn("p-2", { "bg-[#1e1e1e]": theme === "dark", "bg-[#e1e1e1]": theme === "light" }, className)}
				line={1}
				{...rest}
			/>
			{placeholder && showPlaceholder && (
				<div className="absolute top-2 left-7 italic text-gray-500 pointer-events-none">{placeholder}</div>
			)}
		</div>
	);
};

export function MonacoConfig() {
	//const monaco = useTypedMonaco();

	return null;
}
