import React from 'react';
import { View, StyleSheet, BackHandler, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'galio-framework';

import Functions from '../Functions';
import TabHeader from '../TabHeader';
import GridView from '../GridView';
import ViewImage from '../ViewImage';
import DeleteFile from '../DeleteFile';

const style = StyleSheet.create({
    videosContainer: {
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

export default class Videos extends React.Component {
    state = {
        showMoreOptions: false,
        data: [],
        allVideos: [],
        viewImageIndex: -1,
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
    backAction = () => {
        if(this.state.renderTab && this.state.showMoreOptions){
            this.hideMoreOptions();
            this.deselectAll();
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
        this.showItem(index);
    }
    showRefreshing = () => this.setState({ refreshing: true })
    showDeletePopup = () => this.setState({ showDeletePopup: true })
    hideDeletePopup = () => this.setState({ showDeletePopup: false })
    hideRefreshing = () => this.setState({ refreshing: false })
    loadFiles = async () => {
        this.showRefreshing();
        let files = await Functions.getFiles('videos');
        this.saveFiles(files);
    }
    saveFiles = files => {
        let allVideos = [];
        for(let i=0; i<files.length; i++){
            const video = files[i].node;
            video.uri = video.image.uri;
            allVideos.push(video);
        }
        this.setState({ data: files, allVideos: allVideos });
        this.hideRefreshing();
    }
    selectAll = () => {
        let data = this.state.data;
        data = data.map(d => { d.selected = true; return d; });
        this.setState({ data: data });
    }
    deselectAll = () => {
        let data = this.state.data;
        data = data.map(d => { d.selected = false; return d; });
        this.setState({ data: data });
    }
    deleteItems = () => {
        const selectedFiles = this.state.data.filter(d => d.selected).map(d => d.node.image.uri);
        this.setState({ filesToDelete: selectedFiles, showDeletePopup: true });
    }
    showItem = index => {
        // if multi select items is on
        if(this.state.showMoreOptions){
            let items = this.state.data;
            items[index]['selected'] = !items[index]['selected'];
            this.setState({ data: items });
        }
        else{
            this.setState({ viewImageIndex: index });
        }
    }
    closeImages = () => {
        this.setState({ viewImageIndex: -1 });
    }
    afterDelete = deletedFiles => {
        this.closeImages();
        this.hideDeletePopup();
        this.hideMoreOptions();
        const files = this.state.data.filter(d => !deletedFiles.includes(d.node.image.uri));
        this.saveFiles(files);
    }
    shareItems = () => {
        const selectedItems = this.state.data.filter(d => d.selected).map(d => d.node.image.uri);
        Functions.shareItems(selectedItems).catch(error => console.log(error));
    }
    render(){
        return(
            <View style={style.videosContainer}>
                <TabHeader
                    navigation={this.props.navigation}
                    selectAll={this.selectAll}
                    deselectAll={this.deselectAll}
                    deleteItems={this.deleteItems}
                    showMoreOptions={this.state.showMoreOptions}
                    hideMoreOptions={this.hideMoreOptions}
                    shareItems={this.shareItems}
                    items={this.state.data}
                    tabTitle="Videos"
                />
                <ViewImage
                    images={this.state.allVideos}
                    imageIndex={this.state.viewImageIndex}
                    showImages={this.state.viewImageIndex >= 0}
                    closeImages={this.closeImages}
                    afterDelete={this.afterDelete}
                />
                {this.state.data.length > 0 ?
                    <GridView
                        data={this.state.data}
                        showMoreOptions={this.state.showMoreOptions}
                        hideMoreOptions={this.hideMoreOptions}
                        onLongPress={this.showMoreOptions}
                        onPress={this.showItem}
                        onRefresh={this.onRefresh}
                        refreshing={this.state.refreshing}
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
                <DeleteFile 
                    showPopup={this.state.showDeletePopup}
                    closePopup={this.hideDeletePopup}
                    afterDelete={this.afterDelete}
                    files={this.state.filesToDelete}
                    title="Delete selected videos"
                />
            </View>
        )
    }
}