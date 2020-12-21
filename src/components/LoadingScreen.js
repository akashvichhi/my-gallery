import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native';
import { Text } from 'galio-framework';
import Theme from '../constants/Theme';

const style = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: '#d7d7d7',
        flex: 1,
        justifyContent: 'center',
    },
    copyrights: {
        flexDirection: "row",
        position: "absolute",
        bottom: 20,
    },
    company: {
        color: "#e75967",
    },
    indicator: {
        justifyContent: "center",
        flexDirection: "row",
        marginTop: 10,
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
                    <Text p size={28}>My Gallery</Text>
                    <View style={style.indicator}>
                        <ActivityIndicator color={Theme.colors.activeDrawer} size="small" />
                        <Text p size={16} style={{ marginLeft: 5 }}>Loading</Text>
                    </View>
                    <View style={style.copyrights}>
                        <Text p size={16}>Made by </Text>
                        <Text style={style.company} p size={16}>Codespan</Text>
                    </View>
                </View>
            </Modal>            
        )
    }
}