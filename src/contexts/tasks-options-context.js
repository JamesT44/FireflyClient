import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const TasksOptionsContext = createContext();

export const TASK_SORT_OPTIONS = {
  dueEarliest: 'Due Earliest',
  dueLatest: 'Due Latest',
  setEarliest: 'Set Earliest',
  setLatest: 'Set Latest',
};
export const TASK_PROGRESS_OPTIONS = {
  incomplete: 'Incomplete',
  complete: 'Complete',
};

Object.freeze(TASK_SORT_OPTIONS);
Object.freeze(TASK_PROGRESS_OPTIONS);

export const INITIAL_TASKS_OPTIONS = {
  sort: TASK_SORT_OPTIONS.dueEarliest,
  setBy: [],
  progress: [TASK_PROGRESS_OPTIONS.incomplete],
  dueAfter: '',
  dueBefore: '',
  setAfter: '',
  setBefore: '',
};

export const useTasksOptionsContext = () => {
  const context = useContext(TasksOptionsContext);
  if (!context) {
    throw new Error(
      'useTasksOptions must be used within a TasksOptionsProvider',
    );
  }
  return context;
};

export const TasksOptionsProvider = (props) => {
  const [tasksOptions, setTasksOptions] = useState(INITIAL_TASKS_OPTIONS);

  const clearTasksOptions = useCallback(
    () => setTasksOptions(INITIAL_TASKS_OPTIONS),
    [setTasksOptions],
  );

  const value = useMemo(
    () => ({
      tasksOptions,
      setTasksOptions,
      clearTasksOptions,
    }),
    [tasksOptions, setTasksOptions, clearTasksOptions],
  );

  return <TasksOptionsContext.Provider value={value} {...props} />;
};
