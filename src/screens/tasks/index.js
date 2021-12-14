import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshControl } from 'react-native';
import { Divider } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import moment from 'moment';

import {
  FlatListContainer,
  Item,
  HeaderButtonGroup,
  LoadingOverlay,
  NewTaskFAB,
  Snackbar,
} from '_components';
import {
  useAuthContext,
  useTasksOptionsContext,
  TASK_PROGRESS_OPTIONS,
  TASK_SORT_OPTIONS,
} from '_contexts';
import { updateLocalTasks, setTaskDoneStatusWithCheck } from '_api';
import { isTaskDone } from '_utils';
import { renderTask } from '_utils/item-renderers';

const TasksScreen = ({ route, navigation }) => {
  const [ATSnackbarVisible, setATSnackbarVisible] = useState(false);
  const [ATState, setATState] = useState('');
  const [TDSnackbarVisible, setTDSnackbarVisible] = useState(false);
  const [TDState, setTDState] = useState({ id: null, done: false });
  const [refreshing, setRefreshing] = useState(false);
  const { auth } = useAuthContext();
  const { tasksOptions } = useTasksOptionsContext();

  const openTaskDetails = (task) =>
    navigation.navigate('TaskDetails', { id: task.id });

  const newTaskUrl = useMemo(() => route.params?.newTaskUrl, [route.params]);
  useEffect(() => {
    if (newTaskUrl) {
      setATState(newTaskUrl);
      setTDSnackbarVisible(false);
      setATSnackbarVisible(true);
    }
  }, [newTaskUrl]);

  const rerenderKey = useMemo(
    () => ({
      newTaskUrl,
      TDState,
    }),
    [newTaskUrl, TDState],
  );

  const queryClient = useQueryClient();
  const { mutate } = useMutation(
    ({ id, done }) => setTaskDoneStatusWithCheck(auth, id, !done),
    {
      onMutate: async ({ id, done }) => {
        await queryClient.cancelQueries('tasks');
        const previousTasks = queryClient.getQueryData('tasks');
        queryClient.setQueryData('tasks', (oldData) => {
          let newData = { ...oldData };
          newData[id.toString()].recipientsResponses[0].responses.push({
            authorName: auth.userData.name,
            releasedTimestamp: moment().toISOString(),
            eventType: done ? 'mark-as-undone' : 'mark-as-done',
          });
          return newData;
        });
        return { previousTasks };
      },
      onError: (err, _, context) => {
        console.warn(err);
        queryClient.setQueryData('tasks', context.previousTasks);
      },
      onSettled: (response, _, { id }) => {
        if (response === 'Task status already set') {
          return updateLocalTasks(auth, [id])
            .then(() => queryClient.invalidateQueries('tasks'))
            .catch((err) => console.warn(err));
        } else {
          return queryClient.invalidateQueries('tasks');
        }
      },
    },
  );

  const { isLoading, error, data, refetch } = useQuery(
    'tasks',
    () => updateLocalTasks(auth),
    {
      refetchInterval: 1000 * 60 * 5,
      staleTime: 1000 * 60 * 5,
      cacheTime: Infinity,
    },
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // useEffect(() => {
  //   navigation.dangerouslyGetParent().setOptions({
  //     headerRight: () => (
  //       <HeaderButtonGroup.OptionsAvatar
  //         optionsOnPress={() => navigation.navigate('TasksOptions')}
  //         avatarOnPress={() => navigation.navigate('Settings')}
  //       />
  //     ),
  //   });
  // }, [navigation]);

  const addTask = () => {
    navigation.navigate('TaskCreate');
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    console.warn(error);
    return <LoadingOverlay />;
  }

  let renderData = Object.values(data).filter((task) => !task.deleted);

  if (tasksOptions.progress.length === 1) {
    if (tasksOptions.progress[0] === TASK_PROGRESS_OPTIONS.complete) {
      renderData = renderData.filter(isTaskDone);
    } else if (tasksOptions.progress[0] === TASK_PROGRESS_OPTIONS.incomplete) {
      renderData = renderData.filter((task) => !isTaskDone(task));
    } else {
      throw `Invalid task progress option: ${tasksOptions.progress[0]}`;
    }
  }
  if (tasksOptions.setBy.length) {
    renderData = renderData.filter((task) =>
      tasksOptions.setBy.includes(task.setter.name),
    );
  }
  if (tasksOptions.dueAfter) {
    renderData = renderData.filter(
      (task) =>
        task.dueDate &&
        moment(task.dueDate).isSameOrAfter(tasksOptions.dueAfter),
    );
  }
  if (tasksOptions.dueBefore) {
    renderData = renderData.filter(
      (task) =>
        task.dueDate &&
        moment(task.dueDate).isSameOrBefore(
          moment(tasksOptions.dueBefore).add(1, 'day'),
        ),
    );
  }
  if (tasksOptions.setAfter) {
    renderData = renderData.filter((task) =>
      moment(task.setDate).add(1, 'hour').isSameOrAfter(tasksOptions.setAfter),
    );
  }
  if (tasksOptions.setBefore) {
    renderData = renderData.filter((task) =>
      moment(task.setDate)
        .add(1, 'hour')
        .isSameOrBefore(moment(tasksOptions.setBefore).add(1, 'day')),
    );
  }
  switch (tasksOptions.sort) {
    case TASK_SORT_OPTIONS.dueEarliest:
      for (const task of renderData) {
        task.dueMoment = task.dueDate ? moment(task.dueDate).unix() : 0;
      }
      renderData = renderData
        .slice()
        .sort((taskA, taskB) => taskA.dueMoment - taskB.dueMoment);
      break;
    case TASK_SORT_OPTIONS.dueLatest:
      for (const task of renderData) {
        task.dueMoment = task.dueDate ? moment(task.dueDate).unix() : 0;
      }
      renderData = renderData
        .slice()
        .sort((taskA, taskB) => taskB.dueMoment - taskA.dueMoment);
      break;
    case TASK_SORT_OPTIONS.setEarliest:
      for (const task of renderData) {
        task.setMoment = moment(task.setDate).unix();
      }
      renderData = renderData
        .slice()
        .sort((taskA, taskB) => taskA.setMoment - taskB.setMoment);
      break;
    case TASK_SORT_OPTIONS.setLatest:
      for (const task of renderData) {
        task.setMoment = moment(task.setDate).unix();
      }
      renderData = renderData
        .slice()
        .sort((taskA, taskB) => taskB.setMoment - taskA.setMoment);
      break;
    default:
      throw `Invalid sort option: ${tasksOptions.sort}`;
  }

  return (
    <>
      <FlatListContainer
        data={renderData}
        extraData={rerenderKey}
        renderItem={(props) =>
          renderTask(
            props,
            setATSnackbarVisible,
            setTDSnackbarVisible,
            setTDState,
            openTaskDetails,
            mutate,
          )
        }
        keyExtractor={(task) => task.id.toString()}
        getItemLayout={(_, index) => ({
          length: Item.ITEM_HEIGHT,
          offset: Item.ITEM_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListFooterComponent={() => (
          <>
            <Divider />
            <NewTaskFAB.BottomPadding />
          </>
        )}
      />
      <NewTaskFAB
        marginBottom={ATSnackbarVisible || TDSnackbarVisible ? 48 : 0}
        onPress={addTask}
      />
      <Snackbar.AddedTask
        visible={ATSnackbarVisible}
        onDismiss={() => setATSnackbarVisible(false)}
        url={ATState}
      />
      <Snackbar.ChangedTaskDoneState
        visible={TDSnackbarVisible}
        onDismiss={() => setTDSnackbarVisible(false)}
        onUndo={() => mutate(TDState)}
        newDone={TDState.done}
      />
    </>
  );
};

export default TasksScreen;
