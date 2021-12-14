import React from 'react';

import { Item } from '_components';
import { isTaskDone, getTaskGrades } from './index';

export const renderTask = (
  { item: task, index },
  setATSnackbarVisible,
  setTDSnackbarVisible,
  setTDState,
  onPress,
  onSwipe,
  backgroundColor = null,
) => {
  const done = isTaskDone(task);
  const numAttachments =
    task.recipientsResponses[0].responses.filter(
      (event) => event.eventType === 'add-file',
    ).length + (task.fileAttachments?.length || 0);

  return (
    <Item.Task
      key={task.id.toString()}
      title={task.title}
      addressees={task.addressees.map((addressee) => addressee.principal.name)}
      setter={task.setter.name}
      due={task.dueDate}
      done={done}
      numAttachments={numAttachments}
      grades={getTaskGrades(task)}
      onPress={() => onPress(task)}
      onSwipe={() => {
        setATSnackbarVisible(false);
        setTDSnackbarVisible(true);
        setTDState({ id: task.id, done: !done });
        onSwipe({ id: task.id, done });
      }}
      backgroundColor={backgroundColor}
      divider={index > 0}
    />
  );
};

export const renderMessage = (
  { item: message, index },
  setMASnackbarVisible,
  setMAState,
  onSwipe,
  backgroundColor = null,
) => {
  return (
    <Item.Message
      key={message.id.toString()}
      archived={message.archived}
      description={message.body}
      recipients={message.all_recipients}
      setter={message.from.name}
      sent={message.sent}
      onSwipe={() => {
        setMASnackbarVisible(true);
        setMAState({ id: message.id, archived: !message.archived });
        onSwipe({ id: message.id, archived: message.archived });
      }}
      backgroundColor={backgroundColor}
      divider={index > 0}
    />
  );
};

export const renderBookmark = ({ item: bookmark, index }, auth) => {
  return (
    <Item.Bookmark
      key={bookmark.guid}
      title={bookmark.title}
      breadcrumb={bookmark.breadcrumb}
      creator={bookmark.from.name}
      created={bookmark.created}
      url={`https://${auth.hostname}${bookmark.simple_url}`}
      divider={index > 0}
    />
  );
};
