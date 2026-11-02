import { useCallback, useEffect, useRef, useState } from "react";
import { getTasks } from "../api/tasksApi";
import { isRequestCanceled } from "../api/client";
import {
  DEFAULT_TASK_QUERY,
  TASKS_CHANGED_EVENT,
} from "../utils/taskConstants";

const EMPTY_PAGE = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: DEFAULT_TASK_QUERY.pageSize,
  totalPages: 0,
};

export function useTasks(initialQuery = {}) {
  const [query, setQueryState] = useState(() => ({
    ...DEFAULT_TASK_QUERY,
    ...initialQuery,
  }));
  const [pageData, setPageData] = useState(EMPTY_PAGE);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);
  const controllerRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const loadTasks = useCallback(async ({ background = false } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    if (background || hasLoadedRef.current) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const result = await getTasks(query, { signal: controller.signal });
      if (requestId !== requestIdRef.current) return;

      const lastAvailablePage = Math.max(result.totalPages, 1);
      if (query.page > lastAvailablePage) {
        setQueryState((current) => ({
          ...current,
          page: lastAvailablePage,
        }));
        return;
      }

      setPageData(result);
      hasLoadedRef.current = true;
    } catch (requestError) {
      if (!isRequestCanceled(requestError) && requestId === requestIdRef.current) {
        setError(requestError);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [query]);

  useEffect(() => {
    loadTasks();
    return () => controllerRef.current?.abort();
  }, [loadTasks]);

  useEffect(() => {
    const handleTaskChange = () => loadTasks({ background: true });
    window.addEventListener(TASKS_CHANGED_EVENT, handleTaskChange);
    return () => window.removeEventListener(TASKS_CHANGED_EVENT, handleTaskChange);
  }, [loadTasks]);

  const setQuery = useCallback((nextQuery) => {
    setQueryState((current) => {
      const patch =
        typeof nextQuery === "function" ? nextQuery(current) : nextQuery;
      return { ...current, ...patch };
    });
  }, []);

  const setFilters = useCallback((filters) => {
    setQueryState((current) => ({ ...current, ...filters, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setQueryState((current) => ({
      ...DEFAULT_TASK_QUERY,
      pageSize: current.pageSize,
    }));
  }, []);

  const refresh = useCallback(
    () => loadTasks({ background: hasLoadedRef.current }),
    [loadTasks],
  );

  return {
    tasks: pageData.items,
    pageData,
    pagination: {
      totalCount: pageData.totalCount,
      page: pageData.page,
      pageSize: pageData.pageSize,
      totalPages: pageData.totalPages,
    },
    query,
    setQuery,
    setFilters,
    resetFilters,
    loading,
    isRefreshing,
    error,
    refresh,
  };
}

export default useTasks;
