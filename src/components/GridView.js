import React from 'react';
import { StyleSheet, View, Image, Dimensions, RefreshControl, TouchableHighlight, AppState} from 'react-native';
import { Text, Icon } from 'galio-framework';
import Grid from 'react-native-grid-component';
import Menu, { MenuItem } from 'react-native-material-menu';
import AsyncStorage from '@react-native-community/async-storage';
import Theme from '../constants/Theme';

// props => 
// onRefresh()
// data[] => array of data to show in grid
// albums? - bool => whether grid is album or just images or videos
// showMoreOptions - bool => select multiple grid items
// onPress() => onPress of grid item
// onLongPress() => onLongPress of grid item
// refreshing - bool => whether to show refresh control
// afterExclude() => function for after exclude folders action

const style = StyleSheet.create({
    gridContainer: {
        flex: 1,
        paddingHorizontal: 3,
        paddingTop: 3,
    },
    item: {
        flex: 1,
        padding: 2,
        overflow: "hidden",
    },
    list: {
        flex: 1,
    },
    emptyGridItem: {
        display: "none",
    },
    gridItem: {
        flex: 1,
    },
    imageBlock: {
        height: '100%',
    },
    selectIcon: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    image: {
        backgroundColor: "#fff",
        elevation: 2,
        height: '100%',
        width: '100%',
    },
    selectedGrid: {
        borderColor: Theme.colors.activeTab,
        borderWidth: 3,
    },
    albums: {
        paddingBottom: 55,
    },
    albumName: {
        paddingRight: 20,
        marginVertical: 5,
    },
    albumOptions: {
        position: 'absolute',
        right: 0,
        top: 8,
    },
    menu: {
        marginTop: 30,
    },
    videoIcon: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
    },
});

export default class Simple extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            itemsPerRow: 0,
        }
    }
    componentDidMount = () => {
        AppState.addEventListener('focus', () => {
            this.setGridValue();
        });
        this.setGridValue();
    }
    setGridValue = async () => {
        let itemsPerRow = await AsyncStorage.getItem('gridItemsPerRow');
        itemsPerRow = parseInt(itemsPerRow);
        if(itemsPerRow){
            this.setState({ itemsPerRow: itemsPerRow });
        }
    }
    onRefresh = () => {
        this.props.onRefresh();
    }
    excludeFolder = async index => {
        try{
            const folder = this.props.data[index].node.albumPath;
            let excludeFolders = await AsyncStorage.getItem('excludeFolders');
            if(excludeFolders){
                // some folders are already added
                excludeFolders = JSON.parse(excludeFolders);
                if(excludeFolders.indexOf(folder) < 0) excludeFolders.push(folder);
            }
            else{
                // create a new array for exclude folders
                excludeFolders = [folder];
            }
            excludeFolders = JSON.stringify(excludeFolders);

            await AsyncStorage.setItem('excludeFolders', excludeFolders);
            this.props.afterExcludeFolders(folder);
        }
        catch(error){
            console.log(error);
        }
    }
    renderItem = (data, index) => {
        const item = data.node;
        const albums = this.props.albums;
        let itemStyle = [style.item];
        if(albums){
            itemStyle.push(style.albums)
        }

        let gridStyle = [style.gridItem];
        if(this.props.showMoreOptions && data.selected){
            gridStyle.push(style.selectedGrid);
        }

        const windowWidth = Dimensions.get('window').width;
        let itemHeight = windowWidth / this.state.itemsPerRow;
        
        return(
            <View style={itemStyle}>
                <View style={{ height: itemHeight }} key={index}>
                    <View style={gridStyle}>
                        <TouchableHighlight
                            underlayColor="transparent"
                            onPress={this.props.onPress.bind(this.props.this, index)}
                            onLongPress={() => this.props.onLongPress(index)}
                            style={style.image}
                        >
                            <>
                                <Image style={style.imageBlock} source={{ uri: item.image.uri}} />
                                {!albums && item.type.indexOf('video') >= 0 &&
                                    <View style={style.videoIcon}>
                                        <Icon name="playcircleo" family="AntDesign" size={28} color={Theme.colors.activeTab} />
                                    </View>
                                }
                            </>
                        </TouchableHighlight>
                        {this.props.showMoreOptions && data.selected &&
                            <Icon name="checkcircle" family="AntDesign" size={20} color={Theme.colors.activeTab} style={style.selectIcon} />
                        }
                        {albums && 
                            <View style={style.albumName}>
                                <Text p size={14}  numberOfLines={1} color={Theme.colors.textColor}>{item.group_name}</Text>
                                <Text p size={14}  numberOfLines={1} color={Theme.colors.inactiveDrawer}>{item.albumLength} items</Text>
                                <View style={style.albumOptions}>
                                    <AlbumOptions index={index} excludeFolder={this.excludeFolder} />
                                </View>
                            </View>
                        }
                    </View>
                </View>
            </View>
        )
    }
    renderSectionHeader = (data, name) => <Text key={name} style={style.sectionHeader} p size={22}>{data.section.title}</Text>    
    renderPlaceholder = i => <View style={style.item} key={i} />

    render() {
        return (
            <View style={style.gridContainer}>
                {this.state.itemsPerRow > 0 ? 
                    <Grid
                        key={this.state.itemsPerRow}
                        style={style.list}
                        renderItem={this.renderItem}
                        renderPlaceholder={this.renderPlaceholder}
                        data={this.props.data}
                        keyExtractor={(item, index) => item + index}
                        itemsPerRow={this.state.itemsPerRow}
                        itemHasChanged={(d1, d2) => d1 !== d2}
                        refreshControl={
                            <RefreshControl refreshing={this.props.refreshing} onRefresh={this.onRefresh} />
                        }
                    /> : null
                }
            </View>
        );
    }
}

class AlbumOptions extends React.Component {
    _menu = null;
    setMenuRef = ref => this._menu = ref
    hideMenu = () => this._menu.hide()
    showMenu = () => this._menu.show()
    excludeFolder = () => {
        this.hideMenu();
        this.props.excludeFolder(this.props.index);
    }
    render(){
        return(
            <Menu
                style={style.menu}
                ref={this.setMenuRef}
                button={<Icon name="dots-three-vertical" onPress={this.showMenu} family="Entypo" size={22} color={Theme.colors.textColor} />}
            >
                <MenuItem onPress={this.excludeFolder}>Exclude Folder</MenuItem>
            </Menu>
        )
    }
}
