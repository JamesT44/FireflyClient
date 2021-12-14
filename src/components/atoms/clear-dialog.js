import React from 'react';
import { Button, Dialog, Text } from 'react-native-paper';

const ClearDialog = ({ visible, onDismiss, onConfirm }) => {
  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Content>
        <Dialog.Title>Clear cache</Dialog.Title>
        <Text>Re-downloading data may take a while. Clear cache?</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onConfirm}>Clear</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default ClearDialog;
