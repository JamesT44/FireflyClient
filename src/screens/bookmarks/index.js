import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { useQuery } from 'react-query';
import moment from 'moment';

import {
  FlatListContainer,
  HeaderButtonGroup,
  Item,
  LoadingOverlay,
} from '_components';
import {
  useAuthContext,
  useBookmarksOptionsContext,
  BOOKMARK_SORT_OPTIONS,
  BOOKMARK_TYPE_OPTIONS,
} from '_contexts';
import { getBookmarks } from '_api';
import { renderBookmark } from '_utils/item-renderers';

const BookmarksScreen = ({ navigation }) => {
  const { auth } = useAuthContext();
  const [refreshing, setRefreshing] = useState(false);
  const { bookmarksOptions } = useBookmarksOptionsContext();

  const { isLoading, error, data, refetch } = useQuery(
    'bookmarks',
    () => getBookmarks(auth),
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
  //         optionsOnPress={() => navigation.navigate('BookmarksOptions')}
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
  if (bookmarksOptions.type.length === 1) {
    if (bookmarksOptions.type[0] === BOOKMARK_TYPE_OPTIONS.recommended) {
      renderData = renderData.filter(
        (bookmark) => bookmark.type === 'Recommended',
      );
    } else if (bookmarksOptions.type[0] === BOOKMARK_TYPE_OPTIONS.personal) {
      renderData = renderData.filter(
        (bookmark) => bookmark.type === 'Personal',
      );
    } else {
      throw `Invalid bookmark type option: ${bookmarksOptions.type[0]}`;
    }
  }
  if (bookmarksOptions.sort === BOOKMARK_SORT_OPTIONS.newest) {
    renderData = renderData
      .slice()
      .sort((bookmarkA, bookmarkB) =>
        moment(bookmarkA.created).isBefore(bookmarkB.created) ? 1 : -1,
      );
  } else if (bookmarksOptions.sort === BOOKMARK_SORT_OPTIONS.oldest) {
    renderData = renderData
      .slice()
      .sort((bookmarkA, bookmarkB) =>
        moment(bookmarkA.created).isAfter(bookmarkB.created) ? 1 : -1,
      );
  } else {
    throw `Invalid sort option: ${bookmarksOptions.sort}`;
  }

  return (
    <FlatListContainer
      data={renderData}
      renderItem={(item) => renderBookmark(item, auth)}
      keyExtractor={(bookmark) => bookmark.guid}
      getItemLayout={(_, index) => ({
        length: Item.ITEM_HEIGHT,
        offset: Item.ITEM_HEIGHT * index,
        index,
      })}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

export default BookmarksScreen;
