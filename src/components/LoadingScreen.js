import React from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { Text } from 'galio-framework';

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'center',
    },
});

export default class extends React.Component {
    render() {
        return(
            <Modal
                visible={true}
                animationType="fade"
                onRequestClose={() => {}}
            >
                <View style={style.container}>
                    <Text p size={28}>MyGallery</Text>
                </View>
            </Modal>            
        )
    }
}