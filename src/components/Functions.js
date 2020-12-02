import React from 'react';
import { PermissionsAndroid } from 'react-native';
import CameraRoll from '@react-native-community/cameraroll';
var MIME = require('mime');
var RNFS = require('react-native-fs');
import Share from "react-native-share";
import AsyncStorage from '@react-native-community/async-storage';

const RECYCLE_BIN_PATH = RNFS.DocumentDirectoryPath + "/Recycle-bin/";
RNFS.mkdir(RECYCLE_BIN_PATH).catch(error => console.log("Error to create recycle bin: " + error));

RNFS.readDir(RNFS.ExternalStorageDirectoryPath).then(r => console.log(r)).catch(e => console.error(e))

const getPermissions = async () => {
    console.log("Requesting permissoins");
    try{
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
        if(granted === PermissionsAndroid.RESULTS.GRANTED){
            console.log("Permission granted");
            return true;
        }
        else{
            console.log("Permission not granted");
        }
        return false;
    }
    catch(error){
        console.log("Error in permissions:");
        console.log(error);
    }
}

// return date in forrmat mm/dd/yyyy
const getFormattedDate = dateObj => {
    const date = dateObj.getDate() <= 9 ? "0" + dateObj.getDate() : dateObj.getDate();
    let month = dateObj.getMonth() + 1;
    if(month <= 9){
        month = "0" + month;
    }
    const year = dateObj.getFullYear();
    return date + "/" + month + "/" + year;
}
// return time in hh:mm:ss
const getFormattedTime = dateObj => {
    const hours = dateObj.getHours() <= 9 ? "0" + dateObj.getHours() : dateObj.getHours();
    const minutes = dateObj.getMinutes() <= 9 ? "0" + dateObj.getMinutes() : dateObj.getMinutes();
    return hours + ":" + minutes;
}
// return date and time
const getFormattedDateTime = dateObj => getFormattedDate(dateObj) + " " + getFormattedTime(dateObj)

export default class Functions extends React.Component {
    // type => images, videos
    static getFiles = (type = "") => new Promise(async (resolve, reject) =>{
        try{
            const granted = await getPermissions();
            if(granted){
                let files = [];
                let params = {
                    first: 1000000,
                    assetType: 'All',
                    groupTypes: 'All',
                    include: ['filename', 'fileSize', 'imageSize', 'playableDuration'],
                };
                if(type == 'images'){
                    params.assetType = 'Photos';
                }
                else if(type == 'videos'){
                    params.assetType = 'Videos';
                }
                const result = await CameraRoll.getPhotos(params);
                files = result.edges;
                let excludeFolders = await AsyncStorage.getItem('excludeFolders');
                if(excludeFolders){
                    excludeFolders = JSON.parse(excludeFolders);
                    files = files.filter(f => {
                        let albumPath = f.node.image.uri.replace('file://', '').split('/');
                        albumPath.splice(-1);
                        albumPath = albumPath.join("/");
                        return !excludeFolders.includes(albumPath);
                    });
                }
                // console.log(files.length)
                resolve(files);
            }
            resolve([]);
        }
        catch(error) { reject(error) }
    })
    static getFileDatetime = path => new Promise((resolve, reject) => {
        RNFS.stat(path).then(fileStats => {
            const fileDatetime = getFormattedDateTime(new Date(fileStats.mtime));
            resolve(fileDatetime);
        }).catch(error => reject(error));
    })
    
    static getFormattedDate = dateObj => getFormattedDate(dateObj)
    static getFormattedTime = dateObj => getFormattedTime(dateObj)
    static getFormattedDateTime = dateObj => getFormattedDateTime(dateObj)

    static getFormattedDuration = seconds => {
        let duration = '';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor(seconds % 3600 / 60);
        seconds = Math.floor(seconds % 3600 % 60);
        
        if(hours > 0) duration += hours + 'h ';
        if(minutes > 0) duration += minutes + 'm ';
        duration += seconds + 's';
        
        return duration;
    }
    static getFormattedSize = bytes => {
        let size = (bytes / 1024).toFixed(2) + ' KB';
        if(bytes > (1024 * 1024 * 1024)){
            size = (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
        }
        else if(bytes > (1024 * 1024)){
            size = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        }
        return size;
    }

    // items => array of filepath to share
    static shareItems = items => new Promise((resolve, reject) => {
        const options = {
            urls: items,
        };
        Share.open(options).then(() => resolve(true)).catch(error => reject(error));
    })

    // files[path] => files to remove
    // filename will be original filepath before delete => name starts with 'file__' and '/' will be replaced with '__'
    static moveToRecycle = files => new Promise(async (resolve, reject) => {
        try{
            for(let i=0; i<files.length; i++){
                const filepath = files[i].replace('file://', '');
                const destPath = RECYCLE_BIN_PATH + "file__" + filepath.replace(/[/]/g, '__');
                await RNFS.moveFile(filepath, destPath);
                await RNFS.scanFile(filepath);
            }
            resolve(true);
        }
        catch(error){ reject(error) }
    })
    static deletePermanently = files => new Promise(async (resolve, reject) => {
        try{
            for(let i=0; i<files.length; i++){
                const filepath = files[i].replace('file://', '');
                const destPath = RECYCLE_BIN_PATH + "file__" + filepath.replace(/[/]/g, '__');
                await RNFS.unlink(filepath, destPath);
                await RNFS.scanFile(filepath);
            }
            resolve(true);
        }
        catch(error){ reject(error) }
    })
    static getRecycleFiles = () => new Promise((resolve, reject) => {
        RNFS.readDir(RECYCLE_BIN_PATH).then(async results => {
            var files = [];
            for(let i=0; i<results.length; i++){
                let result = results[i];
                const fileType = await MIME.getType(result.path);
                let file = {
                    uri: 'file://' + result.path,
                    type: fileType,
                    image: {
                        uri: 'file://' + result.path,
                        filename: result.name.split("__").pop(),
                        fileSize: result.size
                    },
                    timestamp: result.mtime,
                    originalPath: result.name.split('file__')[1].replace(/__/g, '/'),
                };
                files.push({ node: file });
            }
            resolve(files);
        }).catch(error => reject(error));
    })
    static restoreRecycle = files => new Promise(async (resolve, reject) => {
        try{
            for(let i=0; i<files.length; i++){
                const file = files[i];
                await RNFS.moveFile(file.uri, file.originalPath);
                await RNFS.scanFile(file.originalPath);
            }
            resolve(true);
        }
        catch(error){ reject(error) }
    })
    static removeRecycleFiles = files => new Promise(async (resolve, reject) => {
        try{
            for(let i=0; i<files.length; i++){
                const file = files[i];
                await RNFS.unlink(file);
            }
            resolve(true);
        }
        catch(error){ reject(error) }
    })
}