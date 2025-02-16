import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

//theme provider
import { ThemeProvider } from "@/components/ui/themeProvider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";

//global styles
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MonacoConfig } from "./components/MonacoEditor";
import { TooltipProvider } from "./components/ui/tooltip";
import "./index.css";
import { SupabaseAuthProvider } from "./lib/useAuth";
import { DevToolsWrapper } from "./lib/useDevTools";

// Create a new router instance
const router = createRouter({ routeTree, scrollRestoration: true });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

const queryClient = new QueryClient();

function App() {
	return (
		<>
			<MonacoConfig />
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<QueryClientProvider client={queryClient}>
					<TooltipProvider>
						<SupabaseAuthProvider />
						<RouterProvider router={router} />
						<DevToolsWrapper>
							<ReactQueryDevtools />
						</DevToolsWrapper>
					</TooltipProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</>
	);
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);

	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	);
}
