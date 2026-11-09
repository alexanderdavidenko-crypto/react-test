import { useState } from "react";
import "../App.css";
import {
  FROM_LIST_STATE,
  matchPath,
  navigate,
  readHistoryState,
  useLocation,
  useRedirectUnknown,
} from "../shared/router/index.ts";
import { CreateSessionDialog } from "../features/create-session/CreateSessionDialog.tsx";
import { SessionDetailsDialog } from "../features/sessions/SessionDetailsDialog.tsx";
import { SessionsPage } from "../features/sessions/SessionsPage.tsx";
import { clearFilters, hasActiveFilters, readFilters } from "../features/sessions/filters.ts";

const KNOWN_ROUTES = ["/sessions", "/sessions/:id"] as const;

function App() {
  const { pathname, search } = useLocation();
  useRedirectUnknown(KNOWN_ROUTES, "/sessions");
  // Форма создания не имеет URL: открытость локальная. reloadKey перезапрашивает список (D-4).
  const [createOpen, setCreateOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const detailsId = matchPath("/sessions/:id", pathname)?.id ?? null;
  const known = detailsId !== null || matchPath("/sessions", pathname) !== null;
  if (!known) return null;

  function openCreate(): void {
    // Детали модальны, фон инертен; форма поверх них не открывается.
    if (detailsId === null) setCreateOpen(true);
  }

  function closeCreate({ refetch }: { refetch: boolean }): void {
    setCreateOpen(false);
    if (refetch) setReloadKey((n) => n + 1);
  }

  function openCreatedSession(id: string): void {
    setCreateOpen(false);
    navigate(`/sessions/${encodeURIComponent(id)}${search}`, { state: FROM_LIST_STATE });
  }

  function resetFilters(): void {
    navigate(`${pathname}${clearFilters(search)}`, { replace: true, state: readHistoryState() });
  }

  // Список остаётся смонтированным под диалогом; видимость диалога деталей выводится из URL (D-1).
  return (
    <>
      <SessionsPage onCreateSession={openCreate} reloadKey={reloadKey} />
      {detailsId === null ? null : <SessionDetailsDialog key={detailsId} id={detailsId} />}
      {createOpen ? (
        <CreateSessionDialog
          filtersActive={hasActiveFilters(readFilters(search))}
          onClose={closeCreate}
          onCreated={() => setReloadKey((n) => n + 1)}
          onOpenSession={openCreatedSession}
          onClearFilters={resetFilters}
        />
      ) : null}
    </>
  );
}

export default App
