import React, { useState } from 'react';
import { Button, Dialog, TextInput } from 'react-native-paper';

const CommentDialog = ({ visible, onCancel, onSubmit }) => {
  const [text, setText] = useState('');

  return (
    <Dialog visible={visible} onDismiss={onCancel}>
      <Dialog.Title>Add a Comment</Dialog.Title>
      <Dialog.Content>
        <TextInput
          value={text}
          onChangeText={setText}
          label={'Comment'}
          dense
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={() => onCancel()}>Cancel</Button>
        <Button
          onPress={() => onSubmit(text.trim())}
          disabled={text.trim() === ''}>
          Submit
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default CommentDialog;
