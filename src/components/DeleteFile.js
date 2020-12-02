import React from 'react';
import { View, TouchableHighlight, Modal, StyleSheet, BackHandler } from 'react-native';
import { Text } from 'galio-framework';
import Theme from '../constants/Theme';
import Functions from './Functions';
import CameraRoll from '@react-native-community/cameraroll';

// porps => closePopup(), showPopup - bool, afterDelete(), title - string, files[]
// afterDelete => function after deletion
// title => title to show on modal
// files => array of file uri to delete

const style = StyleSheet.create({
    modalBLock: {
        flex: 1,
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 5,
        marginHorizontal: '15%',
        overflow: 'hidden',
        elevation: 15,
    },
    modalTitle: {
        borderBottomWidth: 1,
        borderColor: Theme.colors.activeTabBg,
        padding: 15,
    },
    modalBtn: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    modalBtnBorder: {
        borderBottomWidth: 1,
        borderColor: Theme.colors.tabBg,
    },
    boldText: {
        fontWeight: 'bold',
    },
});

export default class DeleteFile extends React.Component{
    componentDidMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }
    backAction = () => {
        return false;
    }
    moveToRecycle = async () => {
        try{
            this.props.closePopup();
            await Functions.moveToRecycle(this.props.files);
            this.props.afterDelete(this.props.files);
        }
        catch(error){ console.log(error) }
    }
    deletePermanently = async () => {
        try{
            this.props.closePopup();
            if(this.props.recycleImages){
                await Functions.removeRecycleFiles(this.props.files);
            }
            else{
                await Functions.deletePermanently(this.props.files);
            }
            this.props.afterDelete(this.props.files);
        }
        catch(error){ console.log(error) }
    }
    render(){
        return(
            <Modal transparent
                onRequestClose={this.props.closePopup}
                visible={this.props.showPopup}
            >
                <View style={style.modalBLock}>
                    <View style={style.modalContent}>
                        <View style={style.modalTitle}>
                            <Text p size={18} color="#000" style={style.boldText}>{this.props.title}</Text>
                        </View>
                        <View style={style.modalBody}>
                            {!this.props.recycleImages &&
                                <TouchableHighlight
                                    underlayColor={Theme.colors.tabBg}
                                    onPress={this.moveToRecycle}
                                    style={[style.modalBtn, style.modalBtnBorder]}
                                >
                                    <Text p size={16} color={Theme.colors.textColor}>Move to recycle bin</Text>
                                </TouchableHighlight>
                            }
                            <TouchableHighlight
                                underlayColor={Theme.colors.tabBg}
                                onPress={this.deletePermanently}
                                style={[style.modalBtn, style.modalBtnBorder]}
                            >
                                <Text p size={16} color={Theme.colors.textColor}>Delete permanently</Text>
                            </TouchableHighlight>
                            <TouchableHighlight
                                underlayColor={Theme.colors.tabBg}
                                onPress={this.props.closePopup}
                                style={style.modalBtn}
                            >
                                <Text p size={16} color={Theme.colors.textColor}>Cancel</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }
}