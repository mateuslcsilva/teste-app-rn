import { useEffect, useState, useRef } from 'react';
import { Pressable, TouchableOpacity, StyleSheet, View, Text } from 'react-native';
import { Link } from 'expo-router';
import UserLocation from './userLocation';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

/* async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
        content: {
            title: "Essa notificação foi enviada com o app em segundo plano! 📬",
            body: 'Heeeey',
            data: { data: 'goes here' },
        },
        trigger: null,
    });
} */

async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!'); 
            return;
        }
        // Learn more about projectId:
        // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
        token = (await Notifications.getExpoPushTokenAsync({ projectId: Constants.expoConfig.extra.eas.projectId })).data;
        console.log(token);
    } else {
        //alert('Must use physical device for Push Notifications');
    }
}

const BACKGROUND_FETCH_TASK = 'background-fetch';

// 1. Define the task by providing a name and the function that should be executed
// Note: This needs to be called in the global scope (e.g outside of your React components)
/* TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    console.log('Ação rodando em background');
    console.log(`Rodou em background em: ${new Date(Date.now()).toLocaleString()}`);
    let location = await Location.getCurrentPositionAsync({});
    console.log(`lat: ${location.coords.latitude}, long: ${location.coords.longitude}`);
    const requestOptions = { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ texto: `lat: ${location.coords.latitude}, long: ${location.coords.longitude}` }) 
    }; 
    await fetch('https://testes.unionsystem.com.br/teste_api/v1/endpoint.php', requestOptions)
    .then(res => res.json())
    .then(res => console.log(res));
    async function schedulePushNotification() {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Essa notificação foi enviada com o app em segundo plano com sua localização! 📬",
                body: `lat: ${location.coords.latitude}, long: ${location.coords.longitude}`,
                data: { data: 'goes here' },
            },
            trigger: null,
        });
    }
    await schedulePushNotification();
    return BackgroundFetch.BackgroundFetchResult.NewData;
}); */

TaskManager.defineTask(BACKGROUND_FETCH_TASK, ({ data, error }) => {
    if (error) {
      console.log("Error bg", error)
      return;
    }
    if (data) {
      const { locations } = data;
      console.log("BGGGG->", locations[0].coords.latitude, locations[0].coords.longitude);
    }
  });

// 2. Register the task at some point in your app by providing the same name,
// and some configuration options for how the background fetch should behave
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function registerBackgroundFetchAsync() {
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60 * 0.2, // 15 minutes
        stopOnTerminate: false, // android only,
        startOnBoot: true, // android only
    });
}

// 3. (Optional) Unregister tasks by specifying the task name
// This will cancel any future background fetch calls that match the given name
// Note: This does NOT need to be in the global scope and CAN be used in your React components!
async function unregisterBackgroundFetchAsync() {
    return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}


export default function App() {
    const [location, setLocation] = useState('Não há localização para mostrar');
    const [isRegistered, setIsRegistered] = useState(false);
    const [status, setStatus] = useState(null);
    const [expoPushToken, setExpoPushToken] = useState('');
    const [notification, setNotification] = useState(false);
    const notificationListener = useRef();
    const responseListener = useRef();

    useEffect(() => {
        registerForPushNotificationsAsync().then(token => setExpoPushToken(token));

        notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
            setNotification(notification);
        });

        responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
            console.log(response);
        });
        const config = async () => {
            let resf = await Location.requestForegroundPermissionsAsync();
            if(resf.status == 'granted'){
                let resb = await Location.requestBackgroundPermissionsAsync();
                if(resb.status == 'granted'){
                    setLocation('Permissão para acesso de localização concedida')
                    await Location.startLocationUpdatesAsync(BACKGROUND_FETCH_TASK, {
                        accuracy: Location.Accuracy.Balanced,
                        timeInterval: 3000,
                        distanceInterval: 1,
                        foregroundService: {
                          notificationTitle: 'Live Tracker',
                          notificationBody: 'Live Tracker is on.'
                        }
                      });
                } else {
                    alert('sem permissão background')
                }
            } else {
                alert('sem permissão foregroud')
            }
        };
        config();
        checkStatusAsync();
        if(isRegistered) unregisterBackgroundFetchAsync();
        registerBackgroundFetchAsync();

        /* const interval = setInterval(async () => {
            let location = await Location.getCurrentPositionAsync({});
            console.log(`lat: ${location.coords.latitude}, long: ${location.coords.longitude}`);
        }, 2500); */

        return () => {
            /* clearInterval(interval); */
            unregisterBackgroundFetchAsync();
            Notifications.removeNotificationSubscription(notificationListener.current);
            Notifications.removeNotificationSubscription(responseListener.current);
        };

    }, []);
    
    const checkStatusAsync = async () => {
        const status = await BackgroundFetch.getStatusAsync();
        const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
        setStatus(status);
        setIsRegistered(isRegistered);
    };

    const toggleFetchTask = async () => {
        if (isRegistered) {
            await unregisterBackgroundFetchAsync();
        } else {
            await registerBackgroundFetchAsync();
        }

        checkStatusAsync();
    };

    return (
        <View style={styles.container}>
            {/* <UserLocation setLocation={setLocation} /> */}


{/*             <TouchableOpacity onPress={toggleFetchTask}>
                <Text style={styles.btnText}>{isRegistered ? 'des-registrar background' : 'Registrar background'}</Text>
            </TouchableOpacity> */}

            <Text>
                Background fetch status:{' '}
                <Text>
                    {status && BackgroundFetch.BackgroundFetchStatus[status]}
                </Text>
            </Text>
            <Text>
                Background fetch task name:{' '}
                <Text>
                    {isRegistered ? BACKGROUND_FETCH_TASK : 'Not registered yet!'}
                </Text>
            </Text>
            <Text>
                Localização:{' '}
                <Text>
                    {location}
                </Text>
            </Text>
            {/* <AcessCamera /> */}
            <Link href="./acessCamera">
                <Text style={styles.btnText}>Camera</Text>
            </Link>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
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