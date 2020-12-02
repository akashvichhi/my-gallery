import React from "react";
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Icon } from 'galio-framework';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Theme from '../constants/Theme';
import HomeScreen from './drawers/HomeSccreen';
import RecycleBinScreen from './drawers/RecycleBinScreen';
import SettingsScreen from './drawers/SettingsSccreen';
import LoadingScreen from './LoadingScreen';
import AsyncStorage from "@react-native-community/async-storage";
import Functions from "./Functions";

const style = StyleSheet.create({
    homeContainer: {
        flex: 1,
    },
    drawerIcon: {
        marginLeft: 10,
    },
});

const iconSize = 20;

const Drawer = createDrawerNavigator();

export default class Home extends React.Component {
    state = {
        showLoadingScreen: true,
        files: [],
    }
    componentDidMount = async () => {
        const files = await Functions.getFiles();
        this.setState({ showLoadingScreen: false, files: files });

        // set default gridItems if not set
        const gridItemsPerRow = await AsyncStorage.getItem('gridItemsPerRow');
        if(!gridItemsPerRow) AsyncStorage.setItem('gridItemsPerRow', '3');
    }
    render(){
        if(this.state.showLoadingScreen){
            return <LoadingScreen />
        }
        return(
        <View style={style.homeContainer}>
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
                >
                    <Drawer.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            drawerIcon: props => <Ionicons name="ios-home" color={props.color} size={iconSize} style={style.drawerIcon} />
                        }}
                        initialParams={{ files: this.state.files }}
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
                </Drawer.Navigator>
            </NavigationContainer>
        </View>
        )
    }
}