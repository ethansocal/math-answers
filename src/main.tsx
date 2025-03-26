import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeProvider } from "./components/theme-provider.tsx";
import * as Sentry from "@sentry/react";

Sentry.init({
    dsn: "https://4a1b6ac5469cd0c5a8bb94bea519da4f@o1112946.ingest.us.sentry.io/4509042480381952",
    integrations: [Sentry.browserTracingIntegration()],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
        "localhost",
        /^http(s)?:\/\/ethansocal.github.io\/math-answers.+/,
    ],
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="ui-theme">
            <App />
        </ThemeProvider>
    </StrictMode>
);
