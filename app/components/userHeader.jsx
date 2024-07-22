import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal , Dimensions, Alert } from 'react-native'
import React from 'react'
import styles from '../../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../../constants';

import { auth, database, storage, firebase } from '../../firebase';
import {ref, set, get, remove, onChildChanged, onChildAdded, off} from 'firebase/database';

const UserHeader = ({currentUser}) => {
    const navigation = useNavigation();
    
    const { width, height } = Dimensions.get('window');
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  return (
    <View style={[styles.sectionShadow, {
      flex: 10,
      marginTop:5,
      backgroundColor:COLORS.dark,
      shadowOffset: {
          width: 0,
          height: 5
        },
    }]}>
    <TouchableOpacity style={{
        flexDirection: "row",
        justifyContent:'flex-start'
      }} onPress={() => navigation.navigate("profileview", {currentUser: currentUser, userView: currentUser})}>
        <View style={{alignItems: "flex-end", justifyContent: "center", marginStart: 20, marginEnd: 20, width:'auto', borderRadius: (width), borderWidth: 1.5, borderColor: COLORS.white, padding: 2, marginTop: 10, marginBottom: 10}}>
          {!currentUser.getPfp() && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            tintColor={COLORS.white}
            source={require('../../constants/images/UIcons/icons8-person-64.png')}
            resizeMode="contain"
        />}
        {currentUser.getPfp() && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            source={{uri: currentUser.getPfp()}}
            resizeMode="contain"
        />}
          </View>

        <View style={{
        margin:10,
        flexDirection: "column",
        justifyContent:'space-around'
      }}>
        <Text
            style={styles.pageTopText}
        >{currentUser.getUsername()}</Text>

        <Text
            style={styles.pageTopText}
        >Level: {currentUser.getLevel()}</Text>

        <Progress.Bar style={{color:'#FFFFFF'}} progress={xpProgress} color='#FFFFFF' width={200} />

      </View>

      </TouchableOpacity>
      <View style={{ 
        height: 3,
        flexDirection: "row",
        backgroundColor:COLORS.dark1
      }}>
        
      </View>
    </View>
    
      
  )
}

export default UserHeader