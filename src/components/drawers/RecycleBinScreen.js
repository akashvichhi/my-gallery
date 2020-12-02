import React from 'react';
import { View, StyleSheet, BackHandler, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'galio-framework';

import TabHeader from '../TabHeader';
import GridView from '../GridView';
import Functions from '../Functions';
import ViewImage from '../ViewImage';
import DeleteFile from '../DeleteFile';

const style = StyleSheet.create({
    recycleBinContainer: {
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

export default class RecycleBin extends React.Component {
    state = {
        showMoreOptions: false,
        data: [],
        allImages: [],
        viewImageIndex: -1,
        refreshing: true,
        showDeletePopup: false,
        filesToDelete: [],
        refreshing: false,
    }
    componentDidMount = () => {
        BackHandler.addEventListener("hardwareBackPress", this.backAction);
        this.loadFiles();
    }
    backAction = () => {
        if(this.state.showMoreOptions){
            this.hideMoreOptions();
            this.deselectAll();
            return true;
        }
    }
    hideMoreOptions = () => { this.setState({ showMoreOptions: false }); this.deselectAll() }
    showMoreOptions = () => this.setState({ showMoreOptions: true })
    showRefreshing = () => this.setState({ refreshing: true })
    showDeletePopup = () => this.setState({ showDeletePopup: true })
    hideDeletePopup = () => this.setState({ showDeletePopup: false })
    showRefreshing = () => this.setState({ refreshing: false })
    hideRefreshing = () => this.setState({ refreshing: false })
    onRefresh = () => {
        this.loadFiles();
    }
    loadFiles = async () => {
        this.showRefreshing();
        const files = await Functions.getRecycleFiles();
        this.saveFiles(files);
    }
    saveFiles = files => {
        files = files.sort((a, b) => a.node.timestamp < b.node.timestamp);
        let allImages = [];
        for(let i=0; i<files.length; i++){
            const image = files[i].node;
            allImages.push(image);
        }
        this.setState({ data: files, allImages: allImages });
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
    afterDelete = deletedFiles => {
        this.closeImages();
        this.hideMoreOptions();
        const files = this.state.data.filter(d => !deletedFiles.includes(d.node.image.uri));
        this.saveFiles(files);
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
    restoreRecycleFiles = () => {
        const files = this.state.data.filter(d => d.selected).map(d => d.node);
        Functions.restoreRecycle(files).then(() => {
            const recycleFiles = this.state.data.filter(d => !d.selected);
            this.saveFiles(recycleFiles);
            this.hideMoreOptions();
        }).catch(error => console.log(error));
    }
    render(){
        return(
            <View style={style.recycleBinContainer}>
                <TabHeader recycleImages
                    navigation={this.props.navigation}
                    selectAll={this.selectAll}
                    deselectAll={this.deselectAll}
                    deleteItems={this.deleteItems}
                    showMoreOptions={this.state.showMoreOptions}
                    hideMoreOptions={this.hideMoreOptions}
                    items={this.state.data}
                    restoreRecycleFiles={this.restoreRecycleFiles}
                    tabTitle="Recycle Bin"
                />
                <ViewImage recycleImages
                    images={this.state.allImages}
                    imageIndex={this.state.viewImageIndex}
                    showImages={this.state.viewImageIndex >= 0}
                    closeImages={this.closeImages}
                    afterDelete={this.afterDelete}
                />
                {this.state.data.length > 0 ?
                    <GridView
                        data={this.state.data}
                        itemsPerRow={3}
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
                <DeleteFile recycleImages
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