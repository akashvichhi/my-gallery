import React from 'react';
import { View, StyleSheet, TouchableHighlight, Modal, ScrollView, RefreshControl, Dimensions } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, Icon } from 'galio-framework';
import TabHeader from '../TabHeader';
import Theme from '../../constants/Theme';
import AsyncStorage from '@react-native-community/async-storage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const deviceWidth = Dimensions.get('window').width;
const deviceHeight = Dimensions.get('window').height;

const style = StyleSheet.create({
    excludedFolders: {
        flex: 1,
    },
    settingsContainer: {
        flex: 1,
        marginBottom: 15,
        marginTop: 5,
    },
    settingWrapper: {
        backgroundColor: '#fff',
        elevation: 3,
        marginTop: 15,
        marginHorizontal: 15,
        overflow: 'visible',
    },
    setting: {
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    marginTopSetting: {
        marginTop: 15,
    },
    gridModal: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    gridModalContent: {
        backgroundColor: '#FFF',
        padding: 20,
        elevation: 3,
        width: 240,
    },
    gridOptions: {
        borderWidth: 1,
        borderColor: '#000',
        flexDirection: 'row',
        overflow: 'hidden',
        marginTop: 15,
    },
    gridOption: {
        alignItems: 'center',
        borderLeftWidth: 1,
        flex: 1,
        padding: 5,
    },
    removeLeftBorder: {
        borderLeftWidth: 0,
    },
    activeGridOption: {
        backgroundColor: Theme.colors.activeTab,
    },
    hideGridModal: {
        alignItems: 'center',
        borderWidth: 1,
        marginTop: 15,
        padding: 5,
    },
    folder: {
        flexDirection: 'row',
    },
    folderName: {
        marginLeft: 15,
        marginRight: 60,
    },
    removeFolder: {
        borderRadius: 40,
        padding: 5,
        position: 'absolute',
        right: -5,
        top: -5,
    },
    contentWrapper: {
        flex: 1,
        height: '100%',
    },
    content: {
        alignItems: 'center',
        flex: 1,
        marginTop: 20,
        justifyContent: 'center',
    },
    title: {
        marginTop: 15,
        marginLeft: 15,
    },
});

const textSize = 16;

const Stack = createStackNavigator();

export default class Settings extends React.Component {
    render() {
        return(
            <>
                <TabHeader settingScreen
                    navigation={this.props.navigation}
                    items={[]}
                    tabTitle="Settings"
                />
                <Stack.Navigator initialRouteName="Settings_Home" headerMode="none" screenOptions={{
                    gestureEnabled: true,
                    gestureResponseDistance: {
                        horizontal: deviceWidth / 2,
                        vertical: deviceHeight / 2,
                    },
                    cardStyleInterpolator:({ current, next, layouts, closing }) => {
                        return {
                            cardStyle: {
                                backgroundColor: '#FFF',
                                elevation: 50,
                                opacity: current.progress,
                                transform: [{
                                    translateX: current.progress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [layouts.screen.width, 0],
                                    }),
                                },
                                {
                                    scale: next
                                    ? next.progress.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 0.9],
                                        })
                                    : 1,
                                }],
                            },
                            overlayStyle: {
                                backgroundColor: '#FFF',
                                opacity: current.progress,
                            },
                        };
                    },
                }}>
                    <Stack.Screen
                        name="Settings_Home"
                        component={SettingsHome}
                        options={{
                            gestureDirection: 'horizontal',
                        }}
                    />
                    <Stack.Screen
                        name="Settings_Excluded_Folder"
                        component={SettingsExcludedFolders}
                        options={{
                            gestureDirection: 'horizontal',
                        }}
                    />
                </Stack.Navigator>
            </>
        )
    }
}

class SettingsHome extends React.Component {
    state = {
        showGridModal: false,
        gridOptions: [1,2,3,4],
        gridValue: 3,
    }
    componentDidMount = () => {
        AsyncStorage.getItem('gridItemsPerRow').then(gridItemsPerRow => {
            if(gridItemsPerRow) this.setState({ gridValue: gridItemsPerRow });
        })
    }
    openGridModal = () => this.setState({ showGridModal: true })
    closeGridModal = () => this.setState({ showGridModal: false })
    setGridValue = grid => {
        AsyncStorage.setItem('gridItemsPerRow', grid.toString(), result => this.setState({ gridValue: grid })).catch(error => console.log(error));
    }
    render(){
        return(
            <View style={style.settingsContainer}>
                <ScrollView style={style.settingsList}>
                    <View style={style.settingsContainer}>
                        <View style={style.settingWrapper}>
                            <TouchableHighlight
                                onPress={this.openGridModal}
                                underlayColor={Theme.colors.activeTabBg}
                                style={style.setting}
                            >
                                <Text p size={textSize}>Media Grid</Text>
                            </TouchableHighlight>
                        </View>
                        <View style={style.settingWrapper}>
                            <TouchableHighlight
                                onPress={() => this.props.navigation.navigate('Settings_Excluded_Folder')}
                                underlayColor={Theme.colors.activeTabBg}
                                style={style.setting}
                            >
                                <Text p size={textSize}>Excluded Folders</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </ScrollView>
                <Modal
                    visible={this.state.showGridModal}
                    transparent
                    animationType="fade"
                    onRequestClose={this.closeGridModal}
                >
                    <View style={style.gridModal}>
                        <View style={style.gridModalContent}>
                            <Text p size={18} color={Theme.colors.textColor}>Grid items per row</Text>
                            <View style={style.gridOptions}>
                                {this.state.gridOptions.map(grid => {
                                    let gridStyle = [style.gridOption];
                                    if(grid == 1) gridStyle.push(style.removeLeftBorder);
                                    if(grid == this.state.gridValue) gridStyle.push(style.activeGridOption);

                                    return (
                                        <TouchableHighlight
                                            key={grid}
                                            underlayColor={Theme.colors.inactiveTab}
                                            onPress={this.setGridValue.bind(this, grid)}
                                            style={gridStyle}
                                        >
                                            <Text p size={16}>{grid}</Text>
                                        </TouchableHighlight>
                                    )
                                })}
                            </View>
                            <TouchableHighlight
                                onPress={this.closeGridModal}
                                underlayColor={Theme.colors.inactiveTab}
                                style={style.hideGridModal}
                            >
                                <Text p size={16}>OK</Text>
                            </TouchableHighlight>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}

class SettingsExcludedFolders extends React.Component {
    state = {
        folders: [],
        refreshing: false,
    }
    componentDidMount = async () => {
        this.loadFolders();
    }
    onRefresh = () => {
        this.loadFolders();
    }
    loadFolders = async () => {
        let excludeFolders = await AsyncStorage.getItem('excludeFolders');
        if(excludeFolders){
            excludeFolders = JSON.parse(excludeFolders);
            let folders = [];
            excludeFolders.forEach(folder => {
                folders.push({
                    name: folder.split('/').pop(),
                    path: folder,
                });
            });
            folders = folders.sort((a, b) => a.name > b.name);
            this.setState({ folders: folders, refreshing: false });
        }
    }
    removeFolder = async folder => {
        let excludeFolders = await AsyncStorage.getItem('excludeFolders');
        excludeFolders = JSON.parse(excludeFolders);
        let index = excludeFolders.findIndex(f => f == folder );
        excludeFolders.splice(index, 1);
        await AsyncStorage.setItem('excludeFolders', JSON.stringify(excludeFolders));
        this.loadFolders();
    }
    render() {
        return (
            <View style={style.excludedFolders}>
                <ScrollView style={style.settingsList}
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                    }
                >
                    <Text p size={20} style={style.title}>Excluded folders</Text>
                    <View style={style.settingsContainer}>
                        {this.state.folders.length > 0 ? this.state.folders.map(folder => {
                            return(
                                <View key={folder.path} style={style.settingWrapper}>
                                    <View style={style.setting}>
                                        <View style={style.folder}>
                                            <FontAwesome name="folder" size={26} color={Theme.colors.activeTab} />
                                            <View style={style.folderName}>
                                                <Text p size={textSize}>{folder.name}</Text>
                                                <Text p size={14}>{folder.path}</Text>
                                            </View>
                                            <TouchableHighlight
                                                onPress={this.removeFolder.bind(this, folder.path)}
                                                underlayColor="rgba(0,0,0,0.1)"
                                                style={style.removeFolder}
                                            >
                                                <Icon name="close" family="AntDesign" color={Theme.colors.activeTabBg} size={26} />
                                            </TouchableHighlight>
                                        </View>
                                    </View>
                                </View>
                            )
                        })
                        :
                            <View style={style.contentWrapper}>
                                <View style={style.content}>
                                    <Text p size={16}>No items here</Text>
                                </View>
                            </View>
                        }
                    </View>
                </ScrollView>
            </View>
        )
    }
}