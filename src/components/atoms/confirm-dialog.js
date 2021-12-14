import React, { useState } from 'react';
import { Button, Dialog, List, Portal, RadioButton } from 'react-native-paper';

const ConfirmDialog = ({
  visible,
  value,
  title,
  options,
  onDismiss,
  onValueChange,
}) => {
  const [curr, setCurr] = useState(value);
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <RadioButton.Group onValueChange={setCurr} value={curr}>
            <List.Section>
              {options.map((option) => (
                <List.Item
                  key={option}
                  title={option}
                  left={() => <RadioButton.Android value={option} />}
                  onPress={() => {
                    setCurr(option);
                  }}
                />
              ))}
            </List.Section>
          </RadioButton.Group>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button
            onPress={() => {
              onDismiss();
              onValueChange(curr);
            }}>
            Ok
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default ConfirmDialog;
