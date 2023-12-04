import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import IpContext from './IpContext';

export const pickVideoFromGallery = async () => {
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

        let formData = new FormData();
        formData.append('img', {
            uri: localUri,
            name: filename,
            type: 'video/mp4',
        });

        axios({
            method: 'post',
            url: 'https://5763-222-118-68-94.ngrok-free.app/imgtoss',
            data: formData,
            headers: { 'Content-Type': 'multipart/form-data' },
        })
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    }
};
