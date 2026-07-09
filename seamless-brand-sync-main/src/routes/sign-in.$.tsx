import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/sign-in/$")({
  component: Page,
});

function Page() {
  return <Navigate to="/auth" search={{ mode: "login" }} />;
}
