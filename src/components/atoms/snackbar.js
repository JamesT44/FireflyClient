import React from 'react';
import { Snackbar as PaperSnackbar } from 'react-native-paper';

import { openCustomTab } from '_utils';

const AddedTask = ({ visible, onDismiss, url }) => {
  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      action={{
        label: 'view online',
        onPress: () => {
          onDismiss();
          openCustomTab(url);
        },
      }}>
      Personal task created
    </PaperSnackbar>
  );
};

const ChangedTaskDoneState = ({ visible, onDismiss, onUndo, newDone }) => {
  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      action={{ label: 'undo', onPress: onUndo }}>
      Task marked as {newDone ? 'done' : 'to do'}
    </PaperSnackbar>
  );
};

const ChangedMessageArchivedState = ({
  visible,
  onDismiss,
  onUndo,
  newArchived,
}) => {
  return (
    <PaperSnackbar
      visible={visible}
      onDismiss={onDismiss}
      action={{ label: 'undo', onPress: onUndo }}>
      Message moved to {newArchived ? 'archive' : 'inbox'}
    </PaperSnackbar>
  );
};

const Snackbar = {
  AddedTask,
  ChangedTaskDoneState,
  ChangedMessageArchivedState,
};

export default Snackbar;
