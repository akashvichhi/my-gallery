import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import App from './src/components/App';

export default class MainApp extends React.Component {
  render(){
    return (
      <>
        <SafeAreaView style={styles.appContainer}>
          <App />
        </SafeAreaView>
      </>
    );
  }
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
});
