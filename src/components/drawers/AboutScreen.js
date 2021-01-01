import React from 'react';
import { View, Image, StyleSheet, TouchableWithoutFeedback, Linking, TouchableOpacity } from 'react-native';
import { Text } from 'galio-framework';
import TabHeader from '../TabHeader';
import Theme from '../../constants/Theme';

const style = StyleSheet.create({
    container: {
        padding: 15,
    },
    logoWrap: {
        alignItems: "center",
    },
    logo: {
        backgroundColor: "#fff",
        borderRadius: 50,
        elevation: 5,
    },
    title: {
        marginTop: 15,
        textAlign: "center",
    },
    version: {
        color: "#888",
        textAlign: "center",
    },
    description: {
        marginTop: 10,
    },
    dev: {
        flexDirection: "row",
    },
    company: {
        color: "#e75967",
    },
    contactUs: {
        alignItems: "center",
        backgroundColor: Theme.colors.activeTab,
        borderRadius: 3,
        marginTop: 15,
        paddingVertical: 6,
        width: 150,
    },
});

export default class About extends React.Component {
    openLink = () => {
        Linking.openURL("https://codespan.in");
    }
    contactUs = () => {
        Linking.openURL("mailto:info@codespan.in?subject=Suggestions for My Gallery app");
    }
    render () {
        return (
            <>
                <TabHeader settingScreen
                    navigation={this.props.navigation}
                    items={[]}
                    tabTitle="About Us"
                />
                <View style={style.container}>
                    <View style={style.logoWrap}>
                        <View style={style.logo}>
                            <Image
                                source={require("../../images/icon.png")}
                                style={{ height: 72, width: 72 }}
                            />
                        </View>
                    </View>
                    <Text p size={28} style={style.title}>My Gallery</Text>
                    <Text p size={14} style={style.version}>Version: 20.6.0</Text>
                    <Text p size={16} style={style.description}>
                        My Gallery is an to view your local storage images and videos. See your saved images and videos using this app as per your settings. We do not use your personal data for our use.
                    </Text>
                    <View style={[style.description, style.dev]}>
                        <Text p size={16}>Developed by</Text>
                        <TouchableWithoutFeedback onPress={this.openLink}>
                            <Text p size={16} style={style.company}> Codespan</Text>
                        </TouchableWithoutFeedback>
                    </View>
                    <View>
                        <TouchableOpacity onPress={this.contactUs} activeOpacity={0.6} style={style.contactUs}>
                            <Text p size={18} style={{ color: "#fff" }}>Send feedback</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </>
        )
    }
} 
