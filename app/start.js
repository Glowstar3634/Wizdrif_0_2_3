import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Switch, Animated, Easing, Dimensions } from 'react-native'
import React from 'react';
import styles from '../styles/search';
import { COLORS } from '../constants';
import Profile from './objects/profileObj';
import { auth, database } from '../firebase';
import { Video } from 'expo-av';
import { get, ref } from 'firebase/database';
import { signOut, onAuthStateChanged, signInWithEmailAndPassword, getAuth } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Start = () => {
  
  const navigation = useNavigation();
  let currentUser = new Profile();
  const { width, height } = Dimensions.get('window');

  const [usernameInput, onUsernameUpdate] = React.useState('');
  const [passwordInput, onPasswordUpdate] = React.useState('');
  const [remember, setRemember] = React.useState(false);
  const toggleSwitch = () => setRemember(previousState => !previousState);
  const logoPosition = React.useRef(new Animated.Value(0)).current;
  const opacity = React.useState(new Animated.Value(1))[0];
  const opacityR = React.useState(new Animated.Value(0))[0];
  const opacityL = React.useState(new Animated.Value(0))[0];
  const ww = React.useState(new Animated.Value(1.1))[0];
  const [done, setDone] = React.useState(false)
  const animation = Animated.sequence([
    Animated.parallel([
      Animated.timing(opacityL, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(ww, {
        toValue: 1,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ]),
    Animated.parallel([
      Animated.timing(logoPosition, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.circle),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1500, // Match the duration of the move-up animation
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease)
      }),
      Animated.timing(opacityR, {
        toValue: 1,
        duration: 1500, // Match the duration of the move-up animation
        useNativeDriver: true,
        easing: Easing.inOut(Easing.ease)
      })
    ])
  ])


  React.useEffect(() => {
    const loadStoredCredentials = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem('username');
        const storedPassword = await AsyncStorage.getItem('password');
        if (storedUsername && storedPassword) {
          onUsernameUpdate(storedUsername);
          onPasswordUpdate(storedPassword);
          login(storedUsername, storedPassword, true); // Attempt to login with stored credentials
        }
      } catch (error) {
        console.log('Error loading stored credentials:', error);
      }
    };

    loadStoredCredentials();
    animation.start(() =>{
      setDone(true)
    });

  }, []);

  const logoTranslateY = logoPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [height/4, 0], // Adjust this value as needed
  });

  const login = async (username = usernameInput, password = passwordInput, fromStorage = false) => {
    if (username.includes('@')) {
      try {
        await signInWithEmailAndPassword(getAuth(), username, password);
        console.log("Log In Success!");
        const usersSnapshot = await get(ref(database, 'users'));
        usersSnapshot.forEach((userSnapshot) => {
          try {
            const userData = userSnapshot.val();
            if (userData.email === username) {
              let currentUser = new Profile(userData);
              console.log("Set currentUser with email to:", currentUser.getUsername());
              if (remember && !fromStorage) {
                storeCredentials(username, password);
              }
              if(!remember && !fromStorage){
                clearCredentials()
              }
              onUsernameUpdate("");
              onPasswordUpdate("");
              navigation.navigate("classroom", { currentUser: currentUser });
            }
          } catch (error) {
            console.error("Error in loop:", error.message);
          }
        });
      } catch (error) {
        console.log("Some other error occurred:", error.message);
      }
    } else {
      const emailSnapshot = await get(ref(database, 'users/' + username + '/email'));
      if (emailSnapshot.exists()) {
        try {
          await signInWithEmailAndPassword(getAuth(), emailSnapshot.val(), password);
          console.log("Log In Success!");
          const userSnapshot = await get(ref(database, 'users/' + username));
          const profileData = userSnapshot.val();
          if (profileData && typeof profileData === 'object') {
            let currentUser = new Profile(profileData);
            console.log("Set currentUser with username to:", currentUser.getUsername());
            if (remember && !fromStorage) {
              storeCredentials(username, password);
            }
            if(!remember && !fromStorage){
              clearCredentials()
            }
            onUsernameUpdate("");
            onPasswordUpdate("");
            navigation.navigate("classroom", { currentUser: currentUser });
          }
        } catch (error) {
          console.log("Incorrect password, or some other error occurred:", error.message);
        }
      } else {
        console.log("User does not exist.");
      }
    }
  };

  const storeCredentials = async (username, password) => {
    try {
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      console.log('Credentials stored successfully.');
    } catch (error) {
      console.log('Error storing credentials:', error);
    }
  };

  const clearCredentials = async () => {
    try {
      await AsyncStorage.removeItem('username');
      await AsyncStorage.removeItem('password');
      console.log('Credentials cleared successfully.');
    } catch (error) {
      console.log('Error clearing credentials:', error);
    }
  };

  return (
    <KeyboardAvoidingView style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.superDark,
      width: "100%"
    }} behavior={(Platform.OS == "ios" ? "position" : null)} contentContainerStyle={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.superDark,
      width: "100%"
    }}>
    <Video
        source={require('../constants/videos/copy_5CA685BD-EF84-422B-A87D-C06248BA2986.mov')}   // Change this to the path of your video file
        style={{
          position: 'absolute',
          top: -75,
          left: 0,
          bottom: 0,
          right: 0,
          flex: 1,
          zIndex: -99,
          width: width
        }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        shouldPlay = {true}
        isLooping = {true}
        resizeMode="cover"
      />
    {(!done) && (<Animated.View style={{position:'absolute', width: width, height: height, backgroundColor: "#050008FF", opacity: opacity}}>

    </Animated.View>)}
      <View style={{
        alignContent: 'center',
        flexDirection: 'column',
        justifyContent: 'center',
        flex: 2,
        width: '100%', height: '100%'
      }}>
        <Animated.View style={{ transform: [{ translateY: logoTranslateY }, { scale: ww}], width: "90%", height: '50%', zIndex: 100, opacity: opacityL, alignSelf: 'center'}}>
          <Image
            style={{ width: '100%', height: '100%', zIndex: 100 }}
            resizeMode="contain"
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </Animated.View>
        <Animated.View style={{opacity: opacityR}}>
        <Text style={[styles.startDescs, { color: COLORS.white, fontWeight: 900, fontSize: 20, opacity: 1 }]}>Learn to love to learn.</Text>
        </Animated.View>
      </View>

      <View style={[styles.sectionShadow, {
        alignContent: 'space-around',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        flex: 2,
        width: '100%',
        backgroundColor: COLORS.superDark,
        shadowColor: COLORS.superDark,
        shadowOffset: {
          width: 0,
          height: -10
        },
        shadowRadius: 30,
        borderTopRightRadius: 70,
        zIndex: -10
      }]}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={[styles.startDescs, { color: COLORS.white, alignSelf: 'center', textAlign: 'left', width: '70%', fontWeight: 300 }]}>Sign in to continue, or {"\n"}create a new account</Text>
        </View>

        <View style={{ flex: 3, justifyContent: 'center' }}>
          <Text style={[styles.startInputHint, { color: COLORS.white }]}>Username</Text>

          <View style={styles.startInputArea}>
            <TextInput
              style={styles.startInput}
              onChangeText={username => onUsernameUpdate(username)}
              value={usernameInput}
            />
          </View>

          <Text style={[styles.startInputHint, { color: COLORS.white }]}>Password</Text>

          <View style={styles.startInputArea}>
            <TextInput
              style={styles.startInput}
              onChangeText={password => onPasswordUpdate(password)}
              secureTextEntry={true}
              value={passwordInput}
            />
          </View>

          <View style={{ flexDirection: 'row', width: '70%', alignSelf: 'center', justifyContent: 'flex-start', marginTop: 15 }}>
            <Text style={[styles.startInputHint, { color: COLORS.white, width: 'auto', marginEnd: 10 }]}>Remember Me</Text>
            <Switch
              trackColor={{ false: COLORS.dark1, true: COLORS.gray2 }}
              thumbColor={remember ? COLORS.white : COLORS.gray2}
              ios_backgroundColor={COLORS.dark1}
              onValueChange={toggleSwitch}
              value={remember}
            />
          </View>
        </View>

        <View style={{ flex: 2, justifyContent: 'space-evenly' }}>
          <TouchableOpacity
            style={[styles.buttonStart, { backgroundColor: COLORS.wizLBlue }]}
            onPress={() => login()}
          >
            <Text style={[styles.buttonText, { textShadowColor: 'black', textShadowRadius: 2 }]}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.buttonStart, { backgroundColor: "transparent" }]}
            onPress={() => navigation.navigate("signUp1")}
          >
            <Text style={[styles.buttonText, { textShadowColor: 'black', textShadowRadius: 2 }]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Start;
