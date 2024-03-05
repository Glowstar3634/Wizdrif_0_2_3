import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput} from 'react-native'
import React from 'react'
import styles from '../styles/search';
import { COLORS } from '../constants';
import Profile from './objects/profileObj';
import { auth, database } from '../firebase';
import {get, ref, set} from 'firebase/database';
import {signOut, onAuthStateChanged, signInWithEmailAndPassword, getAuth, createUserWithEmailAndPassword} from '@firebase/auth'

const Start = () => {
  const navigation = useNavigation();
  let currentUser = new Profile();

  const [usernameInput, onUsernameUpdate] = React.useState('');
  const [passwordInput, onPasswordUpdate] = React.useState('');

  const login = async() => {
    if (usernameInput.includes('@')){
      try {
        await signInWithEmailAndPassword(getAuth(), usernameInput, passwordInput);
        console.log("Log In Success!");
        const usersSnapshot = await get(ref(database, 'users'));
        usersSnapshot.forEach((userSnapshot) => {
          try {
            const userData = userSnapshot.val();
            if (userData.email === usernameInput) {
              let currentUser = new Profile(userData);
              console.log("Set currentUser with email to:", currentUser.getUsername());
              navigation.navigate("classroom", {currentUser: currentUser});
            }
          } catch (error) {
            console.error("Error in loop:", error.message); // Log any errors that occur inside the loop
          }
        });
      } catch (error) {
        console.log("Some other error occurred:", error.message);
      }

    }else{
      const email = await get(ref(database, 'users/' + usernameInput + '/email'));
      if (email.exists()){
        try {
          await signInWithEmailAndPassword(getAuth(), email, passwordInput);
          console.log("Log In Success!");
          const snapshot = await get(ref(database, 'users/' + usernameInput));
          const profileData = snapshot.val();
          if (profileData && typeof profileData === 'object') {
            let currentUser = new Profile(profileData);
            console.log("Set currentUser with username to:", currentUser.getUsername());
            navigation.navigate("classroom", {currentUser: currentUser});
          }
        } catch (error) {
          console.log("Incorrect password, or some other error occured:", error.message);
        }
      }else {
        console.log("User does not exist.");
      }
    }
  }
  
  return (
    <SafeAreaView style={{
        flex:1,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:COLORS.dark
    }}>
        <View style={{
        alignContent:'center',
        flexDirection: 'column',
        justifyContent:'center',
        flex:2,
        width: '90%', height: '100%'
        }}>
          <Image
            style={{ width: '100%', height: '50%'}}
            source={require('../constants/images/brand/wizdriflogo_png.png')}
          />
        </View>
        
        <View style={{
        alignContent:'space-around',
        flexDirection: 'column',
        justifyContent:'flex-start',
        flex:4,
        width:'100%',
        backgroundColor:COLORS.white,
        
        borderTopRightRadius: 70,
        }}>
        <View style={{flex:3}}>
        <Text style={styles.startHeaders}>Login</Text>

        <Text style={styles.startDescs}>Sign in to continue, or {"\n"}create a new account</Text>
        </View>

        <View style={{flex:3}}>
        <Text style={styles.startInputHint}>Username</Text>

        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={usernameInput => onUsernameUpdate(usernameInput)}
            defaultValue= {usernameInput}
          />
        </View>

        <Text style={styles.startInputHint}>Password</Text>

        <View style={styles.startInputArea}>
          <TextInput 
            style={styles.startInput}
            onChangeText={passwordInput => onPasswordUpdate(passwordInput)}
            secureTextEntry={true}
            defaultValue= {passwordInput}
          />
        </View>
        </View>

        <View style={{flex:3}}>
        <TouchableOpacity
          style={[styles.buttonStart, styles.loginButton]}
          onPress={login}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonStart, styles.signUpButton]}
          onPress={() => navigation.navigate("signUp1")}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        </View>
          </View>
    </SafeAreaView>
  );
};

export default Start;