import { Camera, CameraType } from 'expo-camera';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const AcessCamera = () => {
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

    useEffect(() => {
        requestPermission();
        console.log(permission);
    }, [])

/*   useEffect(() => {
    const getCameraPermission = () => {
        let permission = Camera.useCameraPermissions()
        console.log(permission);
        requestPermission(permission);
    }
  }, []) */

/*   if (!permission) console.log('sla não tem permissão');
  if (!permission.granted) console.log('permissão negada sla'); */

  function toggleCameraType() {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  return (
    <View style={{
        height: '200px',
        width: '200px',
      }}>
      <Camera style={{
        height: '200px',
        width: '200px',
      }} type={type}>
        <View >
          <TouchableOpacity onPress={toggleCameraType}>
            <Text >Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}