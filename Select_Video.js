import React, { useState, useEffect, useContext } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import IpContext from './IpContext';

export default function PickVideoFromGallery() {

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
            
            let formData = new FormData();
            formData.append('img', {
                uri: localUri,
                name: filename,
                type: 'video/mp4',
            });
            formData.append('numplate', context.numplate);

            axios({
                method: 'post',
                url: 'https://bdc8-222-118-68-94.ngrok-free.app/imgtoss',
                data: formData,
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then(function (response) {

                    console.log(response);

                    //신고횟수+1
                    let report = context.reportCnt + 1;
        
                    //임의 신고 정보
                    const data = { 
                        my_np: context.numplate, 
                        other_np: '11부1111', 
                        date: '234r3', 
                        img_path: 'C:\\Users\\enqn\\Pictures\\aa.jpg',
                        record: context.totRecord, 
                    }
        
                    //신고횟수요청
                    axios.post(`http://${context.ipLap}:3003/updateCnt`, data)
                        .then(response => {
                            if (response.data.success) {
                                context.setTotRecord(response.data.newTotRecord);
                                navigation.navigate('Main');
                            }
                            else {
                                alert(response.data.message); // 실패 메시지 표시
                            }
                        })
                        .catch(error => {
                            console.error('There was an error!', error);
                        });
                    context.setReportCnt(report);
                })
                .catch(function (error) {
                    console.log(error);
                });
        }
        else {
        }
    };
}
