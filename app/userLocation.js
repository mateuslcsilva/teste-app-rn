import {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

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
        /* console.log(`${new Date(Date.now()).toLocaleString()}: ${lat},${long}`); */
        location = `${new Date(Date.now()).toLocaleString()}: ${lat},${long}`;
    }
});

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
/* TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async () => {
    console.log('Ação rodando em background-location');
    console.log(`Rodou em background em: ${new Date(Date.now()).toLocaleString()}`);
    // Be sure to return the successful result type!
    return BackgroundFetch.BackgroundFetchResult.NewData;
}); */

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
/* async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_LOCATION_TASK, {
        minimumInterval: 60 * 0.2, // 15 minutes
        stopOnTerminate: true, // android only,
        startOnBoot: true, // android only
    });
} */

/* async function registerBackgroundLocationAsync() {
    return BackgroundFetch.registerTaskAsync(LOCATION_TRACKING, {
        minimumInterval: 15, // 15 segundos
        stopOnTerminate: true, // android only,
        startOnBoot: true, // android only
    });
} */

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
/* async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_LOCATION_TASK);
} */

/* async function unregisterBackgroundLocationAsync() {
    return BackgroundFetch.unregisterTaskAsync(LOCATION_TRACKING);
} */

  

export default UserLocation;