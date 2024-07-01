import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Switch } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, remove, onChildChanged, onChildAdded, off} from 'firebase/database';
import Relic from "./objects/relicObj";
import Loadout from "./objects/loadoutObj";
import DuelQueue from "./objects/duelqueueObj";
import DuelState from "./objects/duelState";
import Match from "./objects/matchObj";

const Relics = ({route}) => {
    const { currentUser } = route.params;
    
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  
  const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
      <View style={{
        flex: 10,
        margin:5,
        flexDirection: "row",
        justifyContent:'flex-start'
      }}>
        <Image
            style={{  width: 50, height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
        />

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
{/* Navigation drawer add*/}
      </View>

      <View style={{ 
        flex: 1,
        flexDirection: "row",
        backgroundColor:COLORS.dark1
      }}>
        
      </View>

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
      
      </View>

    </SafeAreaView>
  )
}

export default Relics;