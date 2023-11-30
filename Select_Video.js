import React, { useState, useEffect, useContext } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import IpContext from './IpContext';

export default function pickVideoFromGallery() {

    const navigation = useNavigation();
    const context = useContext(IpContext);

    useEffect(() => {
        pickVideo();
    });

    const pickVideo = async () => {

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.cancelled) {
            let localUri = result.assets[0].uri;
            let filename = localUri.split('/').pop();

            console.log('np: ', context.numplate);
            let formData = new FormData();
            formData.append('img', {
                uri: localUri,
                name: filename,
                type: 'video/mp4',
            });
            formData.append('numplate', context.numplate);

            axios({
                method: 'post',
                url: 'https://b63f-222-118-68-94.ngrok-free.app/imgtoss',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then(function (response) {
                    console.log(response);
                    navigation.navigate('Main');
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
    };
}
