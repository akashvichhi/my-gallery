import React from 'react';
import { View, TouchableHighlight, Modal, Dimensions, BackHandler, Image } from 'react-native';
import { Text, Icon } from 'galio-framework';
import ImageViewer from "react-native-image-zoom-viewer";
import Menu, { MenuItem } from 'react-native-material-menu';
import FileViewer from 'react-native-file-viewer';

import { StyleSheet } from 'react-native';
import Theme from '../constants/Theme';
import Functions from './Functions';
import DeleteFile from './DeleteFile';

// props => images[], closeImages(), imageIndex - number, showImages -bool, afterDelete(), recycleImages? -bool
// images => list of all images to show
// afterDelete => function after deletion of image

const windowWidth = Dimensions.get('window').width;
const closeHeaderWidth = 35;
const headerOptionsWidth = 30;
const headerTitleWidth = windowWidth - (closeHeaderWidth + headerOptionsWidth + 10);

const style = StyleSheet.create({
    headerContainer: {
        backgroundColor: "#000",
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 15,
        position: "absolute",
        zIndex: 999,
    },
    closeBtn: {
        width: closeHeaderWidth,
    },
    options: {
        top: 1,
        width: headerOptionsWidth,
    },
    imageName: {
        width: headerTitleWidth,
    },
    menu: {
        marginTop: 40,
    },
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    infoContent: {
        backgroundColor: '#fff',
        borderRadius: 5,
        marginHorizontal: '10%',
        elevation: 10,
    },
    infoTitle: {
        borderBottomWidth: 1,
        borderColor: Theme.colors.tabBg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    info: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    infoBody: {
        paddingVertical: 5,
    },
    boldText: {
        fontWeight: 'bold',
    },
    infoText: {
        maxWidth: '100%',
    },
    videoContainer: {
        alignItems: 'center',
        justifyContent: "center",
        position: "absolute",
        bottom: 0,
        top: 0,
        width: '100%',
    },
    playBtn: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#fff',
        padding: 5,
        width: '75%',
    },
});

let imageInfo = {};
let imageViewIndex = -1;

export default class ViewImage extends React.Component {
    state = {
        showInfo: false,
        modalCloseColor: Theme.colors.activeDrawer,
        showDeletePopup: false,
    }
    _menu = null;
    setMenuRef = ref => this._menu = ref
    hideMenu = () => this._menu.hide()
    showMenu = () => this._menu.show()
    showInfo = () => this.setState({ showInfo: true })
    hideInfo = () => this.setState({ showInfo: false })
    showDeletePopup = () => this.setState({ showDeletePopup: true })
    hideDeletePopup = () => this.setState({ showDeletePopup: false })
    setModalCloseColor = () => this.setState({ modalCloseColor: Theme.colors.tabBg })
    removeModalCloseColor = () => this.setState({ modalCloseColor: Theme.colors.activeDrawer })
    componentDidMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
    }
    backAction = () => {
        if(this.state.showInfo){
            this.hideInfo();
            return true;
        }
        return false;
    }
    shareImage = () => {
        this.hideMenu();
        try{
            Functions.shareItems([this.props.images[imageViewIndex].uri]);
        }
        catch(error) { console.log(error) }
    }
    showDetails = () => {
        this.hideMenu();
        this.showInfo();       
    }
    deleteImage = () => {
        this.hideMenu();
        this.showDeletePopup();
    }
    afterDelete = deletedFiles => {
        this.hideDeletePopup();
        this.props.afterDelete(deletedFiles)
    }
    playVideo = path => {
        path = path.replace('file://', '');
        FileViewer.open(path, { showOpenWithDialog: true, showAppsSuggestions: true }).catch(error => console.log(error));
    }
    ImageHeader = imageIndex => {
        if(this.props.images[imageIndex]){
            return(
                <View style={style.headerContainer}>
                    <TouchableHighlight style={style.closeBtn} onPress={this.props.closeImages}>
                        <Icon name="arrowleft" family="AntDesign" size={26} color={Theme.colors.tabBg} />
                    </TouchableHighlight>
                    <Text p size={18} color={Theme.colors.tabBg} numberOfLines={1} style={style.imageName}>
                        {this.props.images[imageIndex].image.filename}
                    </Text>
                    <View style={style.options}>
                        <Menu
                            style={style.menu}
                            ref={this.setMenuRef}
                            button={<Icon name="dots-three-vertical" onPress={this.showMenu} family="Entypo" size={24} color={Theme.colors.tabBg} />}
                        >
                            <MenuItem onPress={this.shareImage}>Share</MenuItem>
                            <MenuItem onPress={this.showDetails}>Details</MenuItem>
                            <MenuItem onPress={this.deleteImage}>Delete</MenuItem>
                        </Menu>
                    </View>
                </View>
            )
        }
    }
    ImageRender = props => {
        const image = this.props.images[imageViewIndex];
        if(!this.props.recycleImages && image.type.indexOf('video') >= 0) {
            return (
                <View style={style.imageRender}>
                    <Image {...props} />
                    <View style={style.videoContainer}>
                        <Icon name="playcircleo" family="AntDesign" size={56} color={Theme.colors.activeTab} />
                    </View>
                </View>
            )
        }
        return <Image {...props} />
    }
    handleClick = () => {
        if(imageViewIndex >= 0) {
            const image = this.props.images[imageViewIndex];
            if(!this.props.recycleImages && image.type.indexOf('video') >= 0) {
                this.playVideo(this.props.images[imageViewIndex].uri);
            }
        }
    }
    setImageInfo = async () => {
        try{
            if(this.props.images && imageViewIndex >= 0 && this.props.images[imageViewIndex]){
                const currentImage = this.props.images[imageViewIndex];
                const date = await Functions.getFileDatetime(currentImage.uri);
                const size = Functions.getFormattedSize(currentImage.image.fileSize);
                const duration = Functions.getFormattedDuration(currentImage.image.playableDuration);

                imageInfo = {
                    name: currentImage.image.filename,
                    size: size,
                    modified: date,
                    type: currentImage.type,
                }

                if(!this.props.recycleImages){
                    imageInfo.path = currentImage.uri.replace('file://', '');
                    imageInfo.resolution = currentImage.image.width + ' x ' + currentImage.image.height;
                    if(currentImage.image.playableDuration){
                        imageInfo.duration = duration;
                    }
                }
                else{
                    imageInfo.path = currentImage.originalPath;
                }
            }
        }
        catch(error){ console.log(error) }
    }
    indexChange = index => {
        imageViewIndex = index;
        this.setImageInfo();
    }
    onCancel = () => {
        imageViewIndex = -1;
        this.props.closeImages();
    }
    render(){
        const imageUrls = this.props.images.map(i => { return { url: i.uri } });
        const color = Theme.colors.textColor;
        const size = 16;
        const titleSize = 18;
        if(imageViewIndex == -1 && this.props.imageIndex >= 0) {
            this.indexChange(this.props.imageIndex);
        }
        return(
            <View>
                <Modal transparent
                    visible={this.props.showImages}
                    onRequestClose={this.onCancel}
                >
                    <ImageViewer
                        imageUrls={imageUrls}
                        index={this.props.imageIndex}
                        onChange={this.indexChange}
                        onClick={this.handleClick}
                        renderHeader={this.ImageHeader}
                        renderImage={this.ImageRender}
                        useNativeDriver={true}
                        onCancel={this.onCancel}
                        saveToLocalByLongPress={false}
                    />
                </Modal>
                <DeleteFile
                    showPopup={this.state.showDeletePopup}
                    closePopup={this.hideDeletePopup}
                    title="Delete file"
                    afterDelete={this.afterDelete}
                    files={imageViewIndex >= 0 ? [this.props.images[imageViewIndex].uri] : []}
                />
                <Modal transparent
                    animationType="slide"
                    onRequestClose={this.hideInfo}
                    visible={this.state.showInfo}
                >
                    <View style={style.infoContainer}>
                        <View style={style.infoContent}>
                            <View style={style.infoTitle}>
                                <Text p size={titleSize} color={color} style={style.boldText}>File Info</Text>
                                <TouchableHighlight
                                    underlayColor="transparent"
                                    onPressIn={this.setModalCloseColor}
                                    onPressOut={this.removeModalCloseColor}
                                    onPress={this.hideInfo}
                                >
                                    <Icon name="closecircleo" family="AntDesign" size={24} color={this.state.modalCloseColor} />
                                </TouchableHighlight>
                            </View>
                            <View style={style.infoBody}>
                                <View style={style.info}>
                                    <Text p size={size} color={color} style={style.boldText}>File name: </Text>
                                    <Text p size={size} color={color} style={style.infoText}>{imageInfo.name}</Text>
                                </View>
                                <View style={style.info}>
                                    <Text p size={size} color={color} style={style.boldText}>
                                        {this.props.recycleImages ? 'Original path: ' : 'Path: '} 
                                    </Text>
                                    <Text p size={size} color={color}>{imageInfo.path}</Text>
                                </View>
                                <View style={style.info}>
                                    <Text p size={size} color={color} style={style.boldText}>Size: </Text>
                                    <Text p size={size} color={color}>{imageInfo.size}</Text>
                                </View>
                                <View style={style.info}>
                                    <Text p size={size} color={color} style={style.boldText}>File type: </Text>
                                    <Text p size={size} color={color}>{imageInfo.type}</Text>
                                </View>
                                {imageInfo.duration && 
                                    <View style={style.info}>
                                        <Text p size={size} color={color} style={style.boldText}>Duration: </Text>
                                        <Text p size={size} color={color}>{imageInfo.duration}</Text>
                                    </View>
                                }
                                <View style={style.info}>
                                    <Text p size={size} color={color} style={style.boldText}>Last modified: </Text>
                                    <Text p size={size} color={color}>{imageInfo.modified}</Text>
                                </View>
                                {!this.props.recycleImages &&
                                    <View style={style.info}>
                                        <Text p size={size} color={color} style={style.boldText}>Resolution: </Text>
                                        <Text p size={size} color={color}>{imageInfo.resolution}</Text>
                                    </View>
                                }
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        )
    }
}
