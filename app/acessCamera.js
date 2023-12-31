import { Camera, CameraType } from 'expo-camera';
import { Link } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View, Modal, Image } from 'react-native';

const AcessCamera = () => {
  const camRef = useRef(null);
  const [image, setImage] = useState(null);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  useEffect(() => {
    requestPermission();
  }, [])

  const toggleCameraType = () => {
    setType(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  }

  const takePicture = async () => {
    if (camRef) {
      const data = await camRef.current.takePictureAsync();
      setImage(data.uri);
    }
  }

  return (

    <View style={styles.container}>
      <Camera style={styles.camera} type={type} ref={camRef}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraType}>
            <Text style={styles.text}>Mudar câmera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={takePicture}>
            <Text style={styles.text}>Tirar foto</Text>
          </TouchableOpacity>
        </View>
      </Camera>
      {image != null && 
        <Modal
        animationType='slide'
        transparent={false}
        visible={image != null}
        >
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20}}>
            <Image 
            source={{uri: image}}
            style={{width: '100%', height: 300, borderRadius: 20}}>

            </Image>
            {<TouchableOpacity style={{margin: 10}} onPress={() => setImage(null)}>
              <Text>Tirar outra</Text>
            </TouchableOpacity>}
          </View>
        </Modal>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AcessCamera;