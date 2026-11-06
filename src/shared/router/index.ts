import { useEffect, useMemo, useSyncExternalStore } from "react";

// Тонкий слой History API. Доменных имён параметров не знает.

const NAVIGATE_EVENT = "app:navigate";

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

export interface RouterLocation {
  pathname: string;
  search: string;
}

export function navigate(to: string, options: NavigateOptions = {}): void {
  if (options.replace) {
    window.history.replaceState(options.state ?? null, "", to);
  } else {
    window.history.pushState(options.state ?? null, "", to);
  }
  window.dispatchEvent(new Event(NAVIGATE_EVENT));
}

/** Состояние текущей записи истории (флаг «из приложения / из списка» задаёт вызывающий код). */
export function readHistoryState(): unknown {
  return window.history.state;
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  window.addEventListener(NAVIGATE_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(NAVIGATE_EVENT, onChange);
  };
}

function getSnapshot(): string {
  return window.location.pathname + window.location.search;
}

/** Текущие path и search с подпиской на popstate и собственные навигации. */
export function useLocation(): RouterLocation {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  return useMemo(() => {
    const i = snapshot.indexOf("?");
    return i === -1
      ? { pathname: snapshot, search: "" }
      : { pathname: snapshot.slice(0, i), search: snapshot.slice(i) };
  }, [snapshot]);
}

function normalizePath(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/** Сопоставление пути с шаблоном вида `/sessions/:id`. `null`, если путь не подходит. */
export function matchPath(pattern: string, pathname: string): Record<string, string> | null {
  const want = normalizePath(pattern).split("/");
  const have = normalizePath(pathname).split("/");
  if (want.length !== have.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < want.length; i += 1) {
    const w = want[i];
    const h = have[i];
    if (w.startsWith(":")) {
      if (h === "") return null;
      try {
        params[w.slice(1)] = decodeURIComponent(h);
      } catch {
        return null;
      }
    } else if (w !== h) {
      return null;
    }
  }
  return params;
}

export function getSearchParam(search: string, name: string): string | null {
  return new URLSearchParams(search).get(name);
}

/**
 * Возвращает новый search (`?a=b` или пустую строку). `null`/`undefined`/`""` удаляют параметр,
 * остальные параметры сохраняются нетронутыми.
 */
export function updateSearch(
  search: string,
  updates: Record<string, string | null | undefined>,
): string {
  const params = new URLSearchParams(search);
  for (const [name, value] of Object.entries(updates)) {
    if (value === null || value === undefined || value === "") {
      params.delete(name);
    } else {
      params.set(name, value);
    }
  }
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** Неизвестный путь -> `replace` на `fallback` с сохранением search. */
export function useRedirectUnknown(knownPatterns: readonly string[], fallback: string): void {
  const { pathname, search } = useLocation();
  const known = knownPatterns.some((pattern) => matchPath(pattern, pathname) !== null);
  useEffect(() => {
    if (!known) navigate(`${fallback}${search}`, { replace: true });
  }, [known, fallback, search]);
}
