import "../App.css";
import { useRedirectUnknown, matchPath, useLocation } from "../shared/router/index.ts";
import { SessionDetailsDialog } from "../features/sessions/SessionDetailsDialog.tsx";
import { SessionsPage } from "../features/sessions/SessionsPage.tsx";

const KNOWN_ROUTES = ["/sessions", "/sessions/:id"] as const;

function App() {
  const { pathname } = useLocation();
  useRedirectUnknown(KNOWN_ROUTES, "/sessions");

  const detailsId = matchPath("/sessions/:id", pathname)?.id ?? null;
  const known = detailsId !== null || matchPath("/sessions", pathname) !== null;
  if (!known) return null;
  // Список остаётся смонтированным под диалогом; видимость диалога выводится из URL (D-1).
  return (
    <>
      <SessionsPage />
      {detailsId === null ? null : <SessionDetailsDialog key={detailsId} id={detailsId} />}
    </>
  );
}

export default App
