import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Text, Icon } from 'galio-framework';
import Theme from '../constants/Theme';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Menu, { MenuItem  } from 'react-native-material-menu';
import Functions from './Functions';

// props:
// navigation
// selectAll()
// showMoreOptions => bool
// hideMoreOptions => bool
// items[] => items to display item count
// deleteItems()
// shareItems()
// tabTitle => string => display header title
// recycleImages? - bool
// settingScreen? - bool

const iconSize = 22;

const style = StyleSheet.create({
    headerContainer: {
        backgroundColor: Theme.colors.activeTab,
        justifyContent: 'center',
        height: 50,
        // paddingVertical: 10,
        paddingHorizontal: 15,
    },
    headerRight: {
        position: 'absolute',
        right: -5,
        flexDirection: 'row',
    },
    headerLeft: {
        flexDirection: 'row',
    },
    menuIconWrapper: {
        position: 'absolute',
        justifyContent: 'center',
        height: '100%',
    },
    menuIcon: {
        width: iconSize,
    },
    selectedItemsCount: {
        justifyContent: 'center',
        marginLeft: 10,
    },
    moreOptionsMenu: {
        marginTop: 40,
    },
    rightIcon: {
        marginRight: 15,
    },
    tabInfo: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    itemsCount: {
        marginLeft: 10,
    },
    cancelBtn: {
        alignItems: 'center',
        borderWidth: 1,
        marginTop: 20,
        paddingVertical: 5,
        width: '100%',
    },
});

export default class TabHeader extends React.Component {
    state = {}
    _menu = null;
    setMenuRef = ref => this._menu = ref;
    showMenu = () => this._menu.show();
    hideMenu = () => this._menu.hide();
    openDrawer = () => this.props.navigation.openDrawer()
    selectAllItems = () => {
        this.hideMenu();
        this.props.selectAll();
    }
    deselectAllItems = () => {
        this.hideMenu();
        this.props.deselectAll();
    }
    restoreRecycleFiles = () => {
        this.hideMenu();
        this.props.restoreRecycleFiles();
    }
    render(){
        const selectedItems = this.props.items.filter(i => i.selected);
        let selectedFileSize = "0 B";
        if(selectedItems.length){
            let fileSize = selectedItems.filter(i => i.selected).map(i => i.node.image.fileSize).reduce((pi, ci) => pi + ci);
            selectedFileSize = Functions.getFormattedSize(fileSize);
        }
        return(
            <View style={style.headerContainer}>
                <View>
                    {this.props.showMoreOptions ? 
                        <>
                            <View style={style.headerLeft}>
                                <TouchableWithoutFeedback onPress={this.props.hideMoreOptions}>
                                    <Icon name="close" family="AntDesign" size={iconSize} color={Theme.colors.textColor} />
                                </TouchableWithoutFeedback>
                                <View style={style.selectedItemsCount}>
                                    <Text p size={14}>
                                        ({selectedItems.length}) selected ({selectedFileSize})
                                    </Text>
                                </View>
                            </View>
                            <View style={style.headerRight}>
                                <View style={style.rightIcon}>
                                    <TouchableWithoutFeedback onPress={this.props.deleteItems}>
                                        <Icon name="delete" family="AntDesign" size={iconSize} color={Theme.colors.textColor} />
                                    </TouchableWithoutFeedback>
                                </View>
                                {!this.props.recycleImages && 
                                    <View style={style.rightIcon}>
                                        <TouchableWithoutFeedback onPress={this.props.shareItems}>
                                            <Icon name="sharealt" family="AntDesign" size={iconSize} color={Theme.colors.textColor} />
                                        </TouchableWithoutFeedback>
                                    </View>
                                }
                                <Menu
                                    ref={this.setMenuRef}
                                    style={style.moreOptionsMenu}
                                    button={<Icon name="dots-three-vertical" onPress={this.showMenu} family="Entypo" size={iconSize} color={Theme.colors.textColor} />}
                                >
                                    <MenuItem onPress={this.selectAllItems}>
                                        <Text p size={16} color={Theme.colors.textColor}>Select All</Text>
                                    </MenuItem>
                                    <MenuItem onPress={this.deselectAllItems}>
                                        <Text p size={16} color={Theme.colors.textColor}>Deselect All</Text>
                                    </MenuItem>
                                    {this.props.recycleImages && 
                                        <MenuItem onPress={this.restoreRecycleFiles}>
                                            <Text p size={16} color={Theme.colors.textColor}>Restore files</Text>
                                        </MenuItem>
                                    }
                                </Menu>
                            </View>
                        </>
                    :
                        <View>
                            <View style={style.menuIconWrapper}>
                                <View style={style.menuIcon}>
                                    <TouchableWithoutFeedback onPress={this.openDrawer}>
                                        <FontAwesome name="bars" size={iconSize} color={Theme.colors.textColor} />
                                    </TouchableWithoutFeedback>
                                </View>
                            </View>
                            <View style={style.tabInfo}>
                                <Text p size={22}>{ this.props.tabTitle }</Text>
                                {!this.props.settingScreen &&
                                    <Text p size={16} style={style.itemsCount}>({this.props.items.length})</Text>
                                }
                            </View>
                        </View>
                    }
                </View>
            </View>
        )
    }
}