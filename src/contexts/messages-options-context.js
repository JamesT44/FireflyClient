import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const MessagesOptionsContext = createContext();

export const MESSAGE_SORT_OPTIONS = {
  newest: 'Newest',
  oldest: 'Oldest',
};
export const MESSAGE_STATUS_OPTIONS = {
  inbox: 'Inbox',
  archive: 'Archive',
};

Object.freeze(MESSAGE_SORT_OPTIONS);

export const INITIAL_MESSAGES_OPTIONS = {
  sort: MESSAGE_SORT_OPTIONS.newest,
  status: [MESSAGE_STATUS_OPTIONS.inbox],
  sentBy: [],
  after: '',
  before: '',
};

export const useMessagesOptionsContext = () => {
  const context = useContext(MessagesOptionsContext);
  if (!context) {
    throw new Error(
      'useMessagesOptions must be used within a MessagesOptionsProvider',
    );
  }
  return context;
};

export const MessagesOptionsProvider = (props) => {
  const [messagesOptions, setMessagesOptions] = useState(
    INITIAL_MESSAGES_OPTIONS,
  );

  const clearMessagesOptions = useCallback(
    () => setMessagesOptions(INITIAL_MESSAGES_OPTIONS),
    [setMessagesOptions],
  );

  const value = useMemo(
    () => ({
      messagesOptions,
      setMessagesOptions,
      clearMessagesOptions,
    }),
    [messagesOptions, setMessagesOptions, clearMessagesOptions],
  );

  return <MessagesOptionsContext.Provider value={value} {...props} />;
};
