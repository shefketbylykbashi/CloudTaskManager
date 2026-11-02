import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAllTasks, getTaskStats } from "../api/tasksApi";
import { isRequestCanceled } from "../api/client";
import {
  PRIORITY_COLORS,
  PRIORITY_OPTIONS,
  STATUS_COLORS,
  STATUS_OPTIONS,
  TASKS_CHANGED_EVENT,
} from "../utils/taskConstants";
import { isOverdue } from "../utils/date";

const EMPTY_STATS = {
  totalTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  completedTasks: 0,
  overdueTasks: 0,
  completionRate: 0,
};

export function useDashboard() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const controllerRef = useRef(null);
  const requestIdRef = useRef(0);
  const hasLoadedRef = useRef(false);

  const loadDashboard = useCallback(async ({ background = false } = {}) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = ++requestIdRef.current;

    if (background || hasLoadedRef.current) setIsRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [nextStats, allTasks] = await Promise.all([
        getTaskStats({ signal: controller.signal }),
        getAllTasks(
          { sortBy: "createdAt", sortDirection: "desc", pageSize: 100 },
          { signal: controller.signal },
        ),
      ]);

      if (requestId !== requestIdRef.current) return;
      setStats(nextStats);
      setTasks(allTasks);
      hasLoadedRef.current = true;
      setHasLoaded(true);
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
  }, []);

  useEffect(() => {
    loadDashboard();
    return () => controllerRef.current?.abort();
  }, [loadDashboard]);

  useEffect(() => {
    const handleTaskChange = () => loadDashboard({ background: true });
    window.addEventListener(TASKS_CHANGED_EVENT, handleTaskChange);
    return () => window.removeEventListener(TASKS_CHANGED_EVENT, handleTaskChange);
  }, [loadDashboard]);

  const dashboardData = useMemo(() => {
    const priorityCounts = tasks.reduce(
      (counts, task) => ({
        ...counts,
        [task.priority]: (counts[task.priority] || 0) + 1,
      }),
      {},
    );
    const now = new Date();

    return {
      statusDistribution: STATUS_OPTIONS.map(({ value, label }) => ({
        key: value,
        name: label,
        value:
          value === "InProgress"
            ? stats.inProgressTasks
            : stats[`${value.toLowerCase()}Tasks`] || 0,
        color: STATUS_COLORS[value],
      })),
      priorityBreakdown: PRIORITY_OPTIONS.map(({ value, label }) => ({
        key: value,
        name: label,
        value: priorityCounts[value] || 0,
        color: PRIORITY_COLORS[value],
      })),
      recentTasks: [...tasks]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5),
      upcomingTasks: tasks
        .filter((task) => task.status !== "Completed" && task.dueDate)
        .sort((a, b) => {
          const aOverdue = isOverdue(a, now);
          const bOverdue = isOverdue(b, now);
          if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
          const difference = new Date(a.dueDate) - new Date(b.dueDate);
          return aOverdue ? -difference : difference;
        })
        .slice(0, 5),
    };
  }, [stats, tasks]);

  const refresh = useCallback(
    () => loadDashboard({ background: hasLoadedRef.current }),
    [loadDashboard],
  );

  return {
    stats,
    allTasks: tasks,
    ...dashboardData,
    loading,
    isRefreshing,
    hasLoaded,
    error,
    refresh,
  };
}

export default useDashboard;
