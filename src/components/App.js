import React from "react";
import { View, StyleSheet, StatusBar, TouchableOpacity, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text, Icon } from 'galio-framework';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Theme from '../constants/Theme';
import HomeScreen from './drawers/HomeSccreen';
import RecycleBinScreen from './drawers/RecycleBinScreen';
import SettingsScreen from './drawers/SettingsSccreen';
import LoadingScreen from './LoadingScreen';
import AboutScreen from './drawers/AboutScreen';
import AsyncStorage from "@react-native-community/async-storage";

const style = StyleSheet.create({
    homeContainer: {
        flex: 1,
    },
    drawerIcon: {
        marginLeft: 10,
    },
    sendFeedbackBtn: {
        alignItems: "center",
        elevation: 3,
        backgroundColor: Theme.colors.activeTab,
        paddingVertical: 10,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
    },
});

const iconSize = 20;

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
    const sendFeedback = () => {
        Linking.openURL("mailto:info@codespan.in?subject=Suggestions for My Gallery app");
    }
    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            <TouchableOpacity activeOpacity={0.6} onPress={sendFeedback} style={style.sendFeedbackBtn}>
                <Text p size={16}>Send Feedback</Text>
            </TouchableOpacity>
        </View>
    )
}

export default class Home extends React.Component {
    state = {
        showLoadingScreen: true,
    }
    componentDidMount = async () => {
        // set default gridItems if not set
        const gridItemsPerRow = await AsyncStorage.getItem('gridItemsPerRow');
        if(!gridItemsPerRow) AsyncStorage.setItem('gridItemsPerRow', '3');

        setTimeout(() => {
            this.setState({ showLoadingScreen: false });
        }, 2000)
    }
    render(){
        return(
            <View style={style.homeContainer}>
                {this.state.showLoadingScreen && <LoadingScreen />}
                <StatusBar barStyle="dark-content" backgroundColor={Theme.colors.activeTab} />
                <NavigationContainer>
                    <Drawer.Navigator
                        backBehavior="initialRoute"
                        drawerContentOptions={{
                            activeTintColor: Theme.colors.activeDrawer,
                            inactiveTintColor: Theme.colors.inactiveDrawer,
                            labelStyle: {
                                fontSize: 14,
                                marginLeft: -10,
                            }
                        }}
                        drawerContent={props => <DrawerContent {...props} />}
                    >
                        <Drawer.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                drawerIcon: props => <Ionicons name="ios-home" color={props.color} size={iconSize} style={style.drawerIcon} />
                            }}
                        />
                        <Drawer.Screen
                            name="Recycle Bin"
                            component={RecycleBinScreen}
                            options={{
                                drawerIcon: props => <Icon name="trash" family="Entypo" color={props.color} size={iconSize} style={style.drawerIcon} />
                            }}
                        />
                        <Drawer.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{
                                drawerIcon: props => <MaterialIcons name="settings" color={props.color} size={iconSize} style={style.drawerIcon} />
                            }}
                        />
                        <Drawer.Screen
                            name="About Us"
                            component={AboutScreen}
                            options={{
                                drawerIcon: props => <MaterialIcons name="info" color={props.color} size={iconSize} style={style.drawerIcon} />
                            }}
                        />
                    </Drawer.Navigator>
                </NavigationContainer>
            </View>
        )
    }
}