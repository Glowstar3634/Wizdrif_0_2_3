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

const NavigationBar = (currentUser) => {
    const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;

  return (
    <View style={[{
        height:60,
        alignSelf: 'center',
        borderRadius: 30,
        margin: 10,
        width: '98%',
        flexDirection:'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.dark2
      }, styles.sectionShadow]}>
      <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("classroom", {currentUser: currentUser})}>
      <Image
          style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
          tintColor={COLORS.white}
          source={require('../../constants/images/UIcons/home-6133.png')}
          resizeMode="contain"
      />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("studyhall", {currentUser: currentUser})}>
      <Image
          style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
          tintColor={COLORS.white}
          source={require('../../constants/images/UIcons/team-5704.png')}
          resizeMode="contain"
      />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:-2}]} onPress={() => setModalVisible(true)}>
      <Image
          style={{  width: '100%', height: '100%', alignSelf:"center",padding:10}}
          tintColor={COLORS.white}
          source={require('../../constants/images/UIcons/icons8-plus-60.png')}
          resizeMode="contain"
      />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("wizwar", {currentUser: currentUser})}>
      <Image
          style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
          tintColor={COLORS.white}
          source={require('../../constants/images/UIcons/lightning-bolt-4124.png')}
          resizeMode="contain"
      />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("notebook", {currentUser: currentUser})}>
      <Image
          style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
          tintColor={COLORS.white}
          source={require('../../constants/images/UIcons/book-13427.png')}
          resizeMode="contain"
      />
      </TouchableOpacity>
    </View>
  )
}

export default NavigationBar