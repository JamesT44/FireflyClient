import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const BookmarksOptionsContext = createContext();

export const BOOKMARK_SORT_OPTIONS = {
  newest: 'Newest',
  oldest: 'Oldest',
};
export const BOOKMARK_TYPE_OPTIONS = {
  recommended: 'Recommended',
  personal: 'Personal',
};

Object.freeze(BOOKMARK_SORT_OPTIONS);

export const INITIAL_BOOKMARKS_OPTIONS = {
  sort: BOOKMARK_SORT_OPTIONS.newest,
  type: [],
};

export const useBookmarksOptionsContext = () => {
  const context = useContext(BookmarksOptionsContext);
  if (!context) {
    throw new Error(
      'useBookmarksOptions must be used within a BookmarksOptionsProvider',
    );
  }
  return context;
};

export const BookmarksOptionsProvider = (props) => {
  const [bookmarksOptions, setBookmarksOptions] = useState(
    INITIAL_BOOKMARKS_OPTIONS,
  );

  const clearBookmarksOptions = useCallback(
    () => setBookmarksOptions(INITIAL_BOOKMARKS_OPTIONS),
    [setBookmarksOptions],
  );

  const value = useMemo(
    () => ({
      bookmarksOptions,
      setBookmarksOptions,
      clearBookmarksOptions,
    }),
    [bookmarksOptions, setBookmarksOptions, clearBookmarksOptions],
  );

  return <BookmarksOptionsContext.Provider value={value} {...props} />;
};
