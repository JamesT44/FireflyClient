import React from 'react';
import { Button, Dialog, Portal, Paragraph } from 'react-native-paper';

const DisclaimerDialog = ({ visible, onAccept }) => {
  return (
    <Portal>
      <Dialog visible={visible} dismissable={false}>
        <Dialog.Title>Disclaimer</Dialog.Title>
        <Dialog.Content>
          <Paragraph>
            This app is for educational purposes only. This app is in no way
            affiliated with or endorsed by Firefly Learning Ltd. Use of this app
            is at the user's own risk.
          </Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onAccept}>Accept</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default DisclaimerDialog;
