import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Card, List, overlay, Title } from 'react-native-paper';
import { useTheme } from '@react-navigation/native';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import moment from 'moment';

import {
  ContentContainer,
  DashboardGroup,
  HeaderButtonGroup,
  LoadingOverlay,
  Snackbar,
} from '_components';
import { useAuthContext } from '_contexts';
import {
  updateLocalTasks,
  getMessages,
  getBookmarks,
  setTaskDoneStatusWithCheck,
  setMessagesArchivedStatus,
} from '_api';
import { isTaskDone } from '_utils';
import {
  renderTask,
  renderMessage,
  renderBookmark,
} from '_utils/item-renderers';

const DashboardScreen = ({ navigation }) => {
  const { auth } = useAuthContext();
  const { colors, dark } = useTheme();
  const [TDSnackbarVisible, setTDSnackbarVisible] = useState(false);
  const [MASnackbarVisible, setMASnackbarVisible] = useState(false);
  const [TDState, setTDState] = useState({ id: null, done: false });
  const [MAState, setMAState] = useState({ id: null, archived: false });

  const openTaskDetails = (task) =>
    navigation.navigate('TaskDetails', { id: task.id });

  const queryClient = useQueryClient();
  const { mutate: mutateTD } = useMutation(
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
  const { mutate: mutateMA } = useMutation(
    ({ id, archived }) => setMessagesArchivedStatus(auth, [id], !archived),
    {
      onMutate: async ({ id, archived }) => {
        await queryClient.cancelQueries('messages');
        const previousMessages = queryClient.getQueryData('messages');
        queryClient.setQueryData('messages', (oldData) => {
          const newData = oldData.map((message) =>
            message.id === id ? { ...message, archived: !archived } : message,
          );
          return newData;
        });
        return { previousMessages };
      },
      onError: (err, _, context) => {
        console.warn(err);
        queryClient.setQueryData('messages', context.previousMessages);
      },
      onSettled: () => {
        queryClient.invalidateQueries('messages');
      },
    },
  );

  const tasksQuery = useQuery('tasks', () => updateLocalTasks(auth), {
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    cacheTime: Infinity,
  });
  const messagesQuery = useQuery('messages', () => getMessages(auth), {
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    cacheTime: Infinity,
  });
  const bookmarksQuery = useQuery('bookmarks', () => getBookmarks(auth), {
    refetchInterval: 1000 * 60 * 5,
    staleTime: 1000 * 60 * 5,
    cacheTime: Infinity,
  });

  const refetchAll = () => {
    tasksQuery.refetch();
    messagesQuery.refetch();
    bookmarksQuery.refetch();
  };

  // useEffect(() => {
  //   navigation.dangerouslyGetParent().setOptions({
  //     headerRight: () => (
  //       <HeaderButtonGroup.RefreshAvatar
  //         refreshOnPress={refetchAll}
  //         refreshing={
  //           tasksQuery.isFetching ||
  //           messagesQuery.isFetching ||
  //           bookmarksQuery.isFetching
  //         }
  //         avatarOnPress={() => navigation.navigate('Settings')}
  //       />
  //     ),
  //   });
  // }, [navigation, refetchAll]);

  if (tasksQuery.error) {
    console.warn(tasksQuery.error);
  }
  if (messagesQuery.error) {
    console.warn(messagesQuery.error);
  }
  if (bookmarksQuery.error) {
    console.warn(bookmarksQuery.error);
  }

  if (
    tasksQuery.isLoading ||
    messagesQuery.isLoading ||
    bookmarksQuery.isLoading ||
    tasksQuery.error ||
    messagesQuery.error ||
    bookmarksQuery.error
  ) {
    return <LoadingOverlay />;
  }

  const filteredTasks = Object.values(tasksQuery.data).filter(
    (task) => !task.deleted && !isTaskDone(task) && task.dueDate,
  );
  const duePastTasks = filteredTasks
    .filter(
      (task) =>
        moment(task.dueDate).isBefore(moment().startOf('day')) &&
        moment(task.dueDate).isSameOrAfter(
          moment().startOf('day').subtract(7, 'day'),
        ),
    )
    .sort((taskA, taskB) =>
      moment(taskA.dueDate).isAfter(moment(taskB.dueDate)) ? 1 : -1,
    );
  const dueTodayTasks = filteredTasks.filter((task) =>
    moment(task.dueDate).startOf('day').isSame(moment().startOf('day')),
  );
  const setTodayTasks = filteredTasks.filter((task) =>
    moment(task.setDate).startOf('day').isSame(moment().startOf('day')),
  );
  const dueTomorrowTasks = filteredTasks.filter((task) =>
    moment(task.dueDate)
      .startOf('day')
      .isSame(moment().startOf('day').add(1, 'day')),
  );

  const filteredMessages = messagesQuery.data.filter(
    (message) => !message.archived,
  );
  const pastMessages = filteredMessages
    .filter(
      (message) =>
        moment(message.sent).isSameOrBefore(moment().startOf('day')) &&
        moment(message.sent).isAfter(
          moment().startOf('day').subtract(7, 'day'),
        ),
    )
    .sort((messageA, messageB) =>
      moment(messageA.sent).isBefore(moment(messageB.sent)) ? 1 : -1,
    );
  const todayMessages = filteredMessages.filter((message) =>
    moment(message.sent).startOf('day').isSame(moment().startOf('day')),
  );

  const pastBookmarks = bookmarksQuery.data
    .filter(
      (bookmark) =>
        moment(bookmark.created).isSameOrBefore(moment().startOf('day')) &&
        moment(bookmark.created).isAfter(
          moment().startOf('day').subtract(7, 'day'),
        ),
    )
    .sort((bookmarkA, bookmarkB) =>
      moment(bookmarkA.created).isBefore(moment(bookmarkB.created)) ? 1 : -1,
    );
  const todayBookmarks = bookmarksQuery.data.filter((bookmark) =>
    moment(bookmark.created).isSame(moment().startOf('day')),
  );

  const taskRenderer = (task) =>
    renderTask(
      { item: task, index: 1 },
      setMASnackbarVisible,
      setTDSnackbarVisible,
      setTDState,
      openTaskDetails,
      mutateTD,
      dark ? overlay(1, colors.surface) : colors.surface,
    );
  const messageRenderer = (message) =>
    renderMessage(
      { item: message, index: 1 },
      (visible) => {
        setMASnackbarVisible(visible);
        if (visible) {
          setTDSnackbarVisible(false);
        }
      },
      setMAState,
      mutateMA,
      dark ? overlay(1, colors.surface) : colors.surface,
    );
  const bookmarkRenderer = (bookmark) =>
    renderBookmark({ item: bookmark, index: 1 }, auth);

  return (
    <>
      <ContentContainer style={styles.container}>
        <Title style={styles.sectionTitle}>Past 7 Days</Title>
        <DashboardGroup
          items={duePastTasks}
          title={`${duePastTasks.length} task${
            duePastTasks.length === 1 ? '' : 's'
          } due in the past 7 days`}
          renderer={taskRenderer}
        />
        <DashboardGroup
          items={pastMessages}
          title={`${pastMessages.length} message${
            pastMessages.length === 1 ? '' : 's'
          } sent in the past 7 days`}
          renderer={messageRenderer}
        />
        <DashboardGroup
          items={pastBookmarks}
          title={`${pastBookmarks.length} bookmark${
            pastBookmarks.length === 1 ? '' : 's'
          } sent in the past 7 days`}
          renderer={bookmarkRenderer}
        />
        {!(
          duePastTasks.length ||
          pastMessages.length ||
          pastBookmarks.length
        ) && (
          <Card style={styles.card}>
            <List.Item title="No items found." />
          </Card>
        )}
        <Title style={styles.sectionTitle}>Today</Title>
        <DashboardGroup
          items={dueTodayTasks}
          title={`${dueTodayTasks.length} task${
            dueTodayTasks.length === 1 ? '' : 's'
          } due today`}
          renderer={taskRenderer}
        />
        <DashboardGroup
          items={setTodayTasks}
          title={`${setTodayTasks.length} task${
            setTodayTasks.length === 1 ? '' : 's'
          } set today`}
          renderer={taskRenderer}
        />
        <DashboardGroup
          items={todayMessages}
          title={`${todayMessages.length} message${
            todayMessages.length === 1 ? '' : 's'
          } sent today`}
          renderer={messageRenderer}
        />
        <DashboardGroup
          items={todayBookmarks}
          title={`${todayBookmarks.length} bookmark${
            todayBookmarks.length === 1 ? '' : 's'
          } sent today`}
          renderer={messageRenderer}
        />
        {!(
          dueTodayTasks.length ||
          setTodayTasks.length ||
          todayMessages.length ||
          todayBookmarks.length
        ) && (
          <Card style={styles.card}>
            <List.Item title="No items found." />
          </Card>
        )}
        <Title style={styles.sectionTitle}>Tomorrow</Title>
        <DashboardGroup
          items={dueTomorrowTasks}
          title={`${dueTomorrowTasks.length} task${
            dueTomorrowTasks.length === 1 ? '' : 's'
          } due tomorrow`}
          renderer={taskRenderer}
        />
        {!dueTomorrowTasks.length && (
          <Card style={styles.card}>
            <List.Item title="No items found." />
          </Card>
        )}
      </ContentContainer>
      <Snackbar.ChangedTaskDoneState
        visible={TDSnackbarVisible}
        onDismiss={() => setTDSnackbarVisible(false)}
        onUndo={() => mutateTD(TDState)}
        newDone={TDState.done}
      />
      <Snackbar.ChangedMessageArchivedState
        visible={MASnackbarVisible}
        onDismiss={() => setMASnackbarVisible(false)}
        onUndo={() => mutateMA(MAState)}
        newArchived={MAState.archived}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  card: {
    marginVertical: 5,
    paddingVertical: 3,
  },
  sectionTitle: {
    paddingLeft: 12,
    marginTop: 10,
  },
  dividerSpacer: {
    height: 2,
  },
});

export default DashboardScreen;
