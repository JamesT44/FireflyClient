import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Paragraph, TextInput } from 'react-native-paper';

const LoginDialog = ({ visible, onSubmit }) => {
  const [schoolCode, setSchoolCode] = useState('');

  return (
    <Dialog visible={visible} dismissable={false}>
      <Dialog.Title>Login</Dialog.Title>
      <Dialog.Content>
        <TextInput
          value={schoolCode}
          onChangeText={setSchoolCode}
          label={'School Code'}
          dense
          autoCapitalize={'characters'}
          autoCorrect={false}
        />
        <View style={styles.spacer} />
        <Paragraph>
          After entering your school code you will be redirected to your
          school's sign-in page. Please login with the credentials provided by
          your school.
        </Paragraph>
      </Dialog.Content>
      <Dialog.Actions>
        <Button
          onPress={() => onSubmit(schoolCode.trim())}
          disabled={schoolCode.trim() === ''}>
          Next
        </Button>
      </Dialog.Actions>
    </Dialog>
  );
};

const styles = new StyleSheet.create({
  spacer: { height: 10 },
});

export default LoginDialog;
