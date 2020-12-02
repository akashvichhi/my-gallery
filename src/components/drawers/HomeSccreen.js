import React from "react";
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import PhotosTab from '../tabs/Photos';
import VideosTab from '../tabs/Videos';
import AlbumTab from '../tabs/Album';
import { Icon } from "galio-framework";
import Theme from "../../constants/Theme";

const style = StyleSheet.create({
    homeContainer: {
        flex: 1,
    },
});

const Tab = createMaterialTopTabNavigator();

export default class Home extends React.Component {
    render(){
        const { files } = this.props.route.params;
        return(
        <View style={style.homeContainer}>
            <Tab.Navigator
                tabBarPosition="bottom"
                backBehavior="none"
                tabBarOptions={{
                    activeTintColor: Theme.colors.activeTab,
                    inactiveTintColor: Theme.colors.inactiveTab,
                    showIcon: true,
                    pressColor: Theme.colors.activeTabBg,
                    indicatorStyle: {
                        backgroundColor: Theme.colors.activeTabBg,
                        height: '100%',
                    },
                    tabStyle: {
                        paddingTop: 5,
                        paddingBottom: 0,
                    },
                    labelStyle: {
                        textTransform: 'none',
                        marginTop: 0,
                    },
                }}
            >
                <Tab.Screen
                    name="Photos"
                    component={PhotosTab}
                    options={{
                        tabBarIcon: props => <Icon name="image-inverted" family="Entypo" size={26} color={props.color} />
                    }}
                    initialParams={{ files: files }}
                />
                <Tab.Screen
                    name="Videos"
                    component={VideosTab}
                    options={{
                        tabBarIcon: props => <Icon name="video" family="Entypo" size={26} color={props.color} />
                    }}
                    initialParams={{ files: files }}
                />
                <Tab.Screen
                    name="Album"
                    component={AlbumTab}
                    options={{
                        tabBarIcon: props => <Ionicons name="md-albums" size={26} color={props.color} />
                    }}
                    initialParams={{ files: files }}
                />
            </Tab.Navigator>
        </View>
        )
    }
}