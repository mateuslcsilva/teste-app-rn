import {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TRACKING = 'location-tracking';

var l1;
var l2;
var location = 'Não há localização para mostrar';

function UserLocation(props) {

    const [locationStarted, setLocationStarted] = useState(false);
    const [permission, setPermission] = useState('');

    const startLocationTracking = async () => {
        await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
            accuracy: Location.Accuracy.Highest,
            timeInterval: 5000,
            distanceInterval: 0,
        });
        const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TRACKING
        );
        setLocationStarted(hasStarted);
        console.log('tracking started?', hasStarted);
        //setPermission(hasStarted);
    };

    useEffect(() => {
        const config = async () => {
            setPermission('Entrou na config aqui hein')
            let resf = await Location.requestForegroundPermissionsAsync();
            let resb = await Location.requestBackgroundPermissionsAsync();
            if (resf.status != 'granted' && resb.status !== 'granted') {
                alert('sem permissão')
            } else {
                console.log('Permission to access location granted');
                setPermission('Permissão para acesso de localização concedida')
            }
        };
        config();
        const timer = setInterval(() => {
            props.setLocation(location)
        }, 5000);

        return () => clearTimeout(timer);
    }, []);
    const startLocation = () => {
        startLocationTracking();
    }

    const stopLocation = () => {
        setLocationStarted(false);
        TaskManager.isTaskRegisteredAsync(LOCATION_TRACKING)
            .then((tracking) => {
                if (tracking) {
                    Location.stopLocationUpdatesAsync(LOCATION_TRACKING);
                }
            })
    }

    return (
        <View>
          {locationStarted ?
              <TouchableOpacity onPress={stopLocation}>
                  <Text style={styles.btnText}>Stop Tracking</Text>
              </TouchableOpacity>
              :
              <TouchableOpacity onPress={startLocation}>
                  <Text style={styles.btnText}>Start Tracking</Text>
              </TouchableOpacity>
          }
        </View>
    );
}

const styles = StyleSheet.create({
    btnText: {
        fontSize: 20,
        backgroundColor: 'green',
        color: 'white',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 5,
        marginTop: 10,
    },
});

TaskManager.defineTask(LOCATION_TRACKING, async ({ data, error }) => {
    if (error) {
        alert('LOCATION_TRACKING task ERROR:', error);
        return;
    }
    if (data) {
        const { locations } = data;
        let lat = locations[0].coords.latitude;
        let long = locations[0].coords.longitude;

        l1 = lat;
        l2 = long;
        location = `${new Date(Date.now()).toLocaleString()}: ${lat},${long}`;
    }
});
  

export default UserLocation;