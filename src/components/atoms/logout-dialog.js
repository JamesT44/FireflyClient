import React from 'react';
import { Button, Dialog, Text } from 'react-native-paper';

const LogoutDialog = ({ visible, onDismiss, onConfirm }) => {
  return (
    <Dialog visible={visible} onDismiss={onDismiss}>
      <Dialog.Content>
        {/* <Dialog.Title>Logout</Dialog.Title> */}
        <Text>You will be returned to the login screen. Logout?</Text>
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={onDismiss}>Cancel</Button>
        <Button onPress={onConfirm}>Logout</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default LogoutDialog;
