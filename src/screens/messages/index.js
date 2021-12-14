import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import moment from 'moment';

import {
  FlatListContainer,
  HeaderButtonGroup,
  Item,
  LoadingOverlay,
  Snackbar,
} from '_components';
import {
  useAuthContext,
  useMessagesOptionsContext,
  MESSAGE_SORT_OPTIONS,
  MESSAGE_STATUS_OPTIONS,
} from '_contexts';
import { getMessages, setMessagesArchivedStatus } from '_api';
import { renderMessage } from '_utils/item-renderers';

const MessagesScreen = ({ navigation }) => {
  const [MASnackbarVisible, setMASnackbarVisible] = useState(false);
  const [MAState, setMAState] = useState({ id: null, archived: false });
  const { auth } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);
  const { messagesOptions } = useMessagesOptionsContext();

  const queryClient = useQueryClient();
  const { mutate } = useMutation(
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

  const { isLoading, error, data, refetch } = useQuery(
    'messages',
    () => getMessages(auth),
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
  //         optionsOnPress={() => navigation.navigate('MessagesOptions')}
  //         avatarOnPress={() => navigation.navigate('Settings')}
  //       />
  //     ),
  //   });
  // }, [navigation]);

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (error) {
    console.warn(error.message);
    return <LoadingOverlay />;
  }

  let renderData = data.slice();
  if (messagesOptions.status.length === 1) {
    if (messagesOptions.status[0] === MESSAGE_STATUS_OPTIONS.inbox) {
      renderData = renderData.filter((message) => !message.archived);
    } else if (messagesOptions.status[0] === MESSAGE_STATUS_OPTIONS.archive) {
      renderData = renderData.filter((message) => message.archived);
    } else {
      throw `Invalid message status option: ${messagesOptions.status[0]}`;
    }
  }
  if (messagesOptions.sentBy.length) {
    renderData = renderData.filter((message) =>
      messagesOptions.sentBy.includes(message.from.name),
    );
  }
  if (messagesOptions.after) {
    renderData = renderData.filter((message) =>
      moment(message.sent).isSameOrAfter(messagesOptions.after),
    );
  }
  if (messagesOptions.before) {
    renderData = renderData.filter((message) =>
      moment(message.sent).isSameOrBefore(
        moment(messagesOptions.before).add(1, 'day'),
      ),
    );
  }

  for (const message of renderData) {
    message.sentMoment = moment(message.sent).unix();
  }
  if (messagesOptions.sort === MESSAGE_SORT_OPTIONS.newest) {
    renderData = renderData
      .slice()
      .sort((messageA, messageB) => messageB.sentMoment - messageA.sentMoment);
  } else if (messagesOptions.sort === MESSAGE_SORT_OPTIONS.oldest) {
    renderData = renderData
      .slice()
      .sort((messageA, messageB) => messageA.sentMoment - messageB.sentMoment);
  } else {
    throw `Invalid sort option: ${messagesOptions.sort}`;
  }

  return (
    <>
      <FlatListContainer
        data={renderData}
        renderItem={(props) =>
          renderMessage(props, setMASnackbarVisible, setMAState, mutate)
        }
        keyExtractor={(message) => message.id.toString()}
        getItemLayout={(_, index) => ({
          length: Item.ITEM_HEIGHT,
          offset: Item.ITEM_HEIGHT * index,
          index,
        })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      <Snackbar.ChangedMessageArchivedState
        visible={MASnackbarVisible}
        onDismiss={() => setMASnackbarVisible(false)}
        onUndo={() => mutate(MAState)}
        newArchived={MAState.archived}
      />
    </>
  );
};

export default MessagesScreen;
