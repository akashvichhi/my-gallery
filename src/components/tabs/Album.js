import React from 'react';
import { View, StyleSheet, BackHandler, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'galio-framework';

import Functions from '../Functions';
import TabHeader from '../TabHeader';
import GridView from '../GridView';
import ViewImage from '../ViewImage';
import DeleteFile from '../DeleteFile';

const style = StyleSheet.create({
    albumContainer: {
        flex: 1,
    },
    contentWrapper: {
        flex: 1,
    },
    emptyList: {
        width: '100%',
    },
    content: {
        alignItems: 'center',
        flex: 1,
        marginTop: 20,
        justifyContent: 'center',
    },
});

export default class Album extends React.Component {
    state = {
        allData: [],
        data: [],
        album: [],
        albumImages: [],
        viewImageIndex: -1,
        showAlbum: false,
        showMoreOptions: false,
        renderTab: false,
        refreshing: true,
        showDeletePopup: false,
        filesToDelete: [],
    }
    componentDidMount = () => {
        this.backHandler = BackHandler.addEventListener("hardwareBackPress", this.backAction);
        this.props.navigation.addListener('focus', e => {
            this.setState({ renderTab: true });
        });
        this.props.navigation.addListener('blur', e => {
            this.setState({ renderTab: false });
        });
        this.loadFiles();
    }
    showRefreshing = () => this.setState({ refreshing: true })
    hideRefreshing = () => this.setState({ refreshing: false })
    showDeletePopup = () => this.setState({ showDeletePopup: true })
    hideDeletePopup = () => this.setState({ showDeletePopup: false })
    backAction = () => {
        if(this.state.renderTab && this.state.showMoreOptions){
            this.hideMoreOptions();
            return true;
        }
        if(this.state.renderTab && this.state.showAlbum){
            this.hideAlbum();
            return true;
        }
        return false;
    }
    onRefresh = () => {
        this.loadFiles();
    }
    hideMoreOptions = () => { this.setState({ showMoreOptions: false }); this.deselectAll() }
    showMoreOptions = index => {
        this.setState({ showMoreOptions: true })
        this.showAlbumImage(index);
    }
    hideAlbum = () => {
        this.setState({ showAlbum: false, album: [], albumImages: [], viewImageIndex: -1 });
    }
    loadFiles = async () => {
        this.showRefreshing();
        const files = await Functions.getFiles();
        this.saveFiles(files);
    }
    saveFiles = files => {
        let albumNames = [];
        files.forEach(file => {
            if(albumNames.indexOf(file.node.group_name) < 0){
                albumNames.push(file.node.group_name);
            }
        });
        let data = [];
        albumNames.forEach(albumName => {
            const albumLength = files.filter(file => file.node.group_name == albumName).length
            const album = files.find(file => file.node.group_name == albumName);
            let albumPath = album.node.image.uri.replace('file://', '').split('/');
            albumPath.splice(-1);
            albumPath = albumPath.join("/");
            
            album.node.albumLength = albumLength;
            album.node.albumPath = albumPath;
            data.push(album);
        });
        data = data.sort((a, b) => a.node.group_name.toLowerCase() > b.node.group_name.toLowerCase());
        this.setState({ data: data, allData: files });
        this.hideAlbum();
        this.hideRefreshing();
    }
    selectAll = () => {
        let data = this.state.album;
        data = data.map(d => { d.selected = true; return d; });
        this.setState({ data: data });
    }
    deselectAll = () => {
        let data = this.state.album;
        data = data.map(d => { d.selected = false; return d; });
        this.setState({ data: data });
    }
    deleteItems = () => {
        const selectedFiles = this.state.album.filter(d => d.selected).map(d => d.node.image.uri);
        this.setState({ filesToDelete: selectedFiles, showDeletePopup: true });
    }
    afterDelete = deletedFiles => {
        this.closeAlbumImages();
        this.hideDeletePopup();
        this.hideMoreOptions();
        const files = this.state.allData.filter(d => !deletedFiles.includes(d.node.image.uri));
        this.saveFiles(files);
    }
    afterExcludeFolders = folder => {
        const files = this.state.allData.filter(d => d.node.image.uri.indexOf(folder) < 0);
        this.saveFiles(files);
    }
    showItem = index => {
        const albumName = this.state.data[index].node.group_name;
        const album = this.state.allData.filter(file => file.node.group_name == albumName);
        let albumImages = [];
        for(let i=0; i<album.length; i++){
            let images = album[i].node;
            images.uri = album[i].node.image.uri;
            albumImages.push(images);
        }
        this.setState({ album: album, showAlbum: true, albumImages: albumImages });
    }
    showAlbumImage = index => {
        // if multi select items is on
        if(this.state.showMoreOptions){
            let items = this.state.album;
            items[index]['selected'] = !items[index]['selected'];
            this.setState({ album: items });
        }
        else{
            this.setState({ viewImageIndex: index });
        }
    }
    closeAlbumImages = () => {
        this.setState({ viewImageIndex: -1 });
    }
    shareItems = () => {
        const selectedItems = this.state.album.filter(d => d.selected).map(d => d.node.image.uri);
        Functions.shareItems(selectedItems).catch(error => console.log(error));
    }
    render(){
        return(
            <View style={style.albumContainer}>
                <TabHeader
                    navigation={this.props.navigation}
                    selectAll={this.selectAll}
                    deselectAll={this.deselectAll}
                    deleteItems={this.deleteItems}
                    showMoreOptions={this.state.showMoreOptions}
                    hideMoreOptions={this.hideMoreOptions}
                    shareItems={this.shareItems}
                    items={this.state.showAlbum ? this.state.album : this.state.data}
                    tabTitle={this.state.showAlbum ? this.state.album[0].node.group_name : "Albums"}
                />
                {this.state.showAlbum ? 
                    <>
                        <ViewImage
                            images={this.state.albumImages}
                            imageIndex={this.state.viewImageIndex}
                            showImages={this.state.viewImageIndex >= 0}
                            closeImages={this.closeAlbumImages}
                            afterDelete={this.afterDelete}
                        />
                        <GridView
                            data={this.state.album}
                            showMoreOptions={this.state.showMoreOptions}
                            hideMoreOptions={this.hideMoreOptions}
                            onPress={this.showAlbumImage}
                            onLongPress={this.showMoreOptions}
                            onRefresh={this.onRefresh}
                            refreshing={this.state.refreshing}
                        />
                    </>
                :   <>
                        {this.state.data.length > 0 ?
                            <GridView albums
                                data={this.state.data}
                                onPress={this.showItem}
                                onRefresh={this.onRefresh}
                                refreshing={this.state.refreshing}
                                afterExcludeFolders={this.afterExcludeFolders}
                            />
                        :
                            <View style={style.contentWrapper}>
                                <ScrollView
                                    refreshControl={
                                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                                    }
                                    style={style.emptyList}
                                >
                                    <View style={style.content}>
                                        <Text p size={16}>No items here</Text>
                                    </View>
                                </ScrollView>
                            </View>
                        }
                    </>
                }
                <DeleteFile 
                    showPopup={this.state.showDeletePopup}
                    closePopup={this.hideDeletePopup}
                    afterDelete={this.afterDelete}
                    files={this.state.filesToDelete}
                    title="Delete selected files"
                />
            </View>
        )
    }
}