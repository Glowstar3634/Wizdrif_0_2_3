import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal , Dimensions, Alert, Platform, StatusBar } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import UserHeader from "./components/userHeader";
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, remove, onChildChanged, onChildAdded, off} from 'firebase/database';

const Studyhall = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  let dcXP = 0;
  let dreq = 0;
  let dXPP = 0;
  
  const [modalVisible, setModalVisible] = React.useState(false);
  const { width, height } = Dimensions.get('window');
  const disPicRadius = ((width - 20) * 0.225 / 2)+10
  const [myGroups, setMyGroups] = React.useState([]);
  const [district, setDistrict] = React.useState("Rogue Student");
  const [districtJSON, setDistrictJSON] = React.useState({
    "name": "Rogue Student",
    "description": "This user has not joined a district",
    "tags": [],
    "owner": "",
    "settings": {
        "private": false,
        "maxMembers": -1,
        "allowedAccounts": [],
        "levelReq": 0,
        "official": false,
        "verified": false,
        "inviteOnly": false
    },
    "members": [],
    "admins": [],
    "districtID": "",
    "hasIcon": false,
    "level": 0,
    "xp": 0
  });
  const [districtXP, setDistrictXP] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const [districtIconUrl, setDistrictIconUrl] = React.useState('');

const districtIcon = async (id) => {
  const ref = firebase.storage().ref('images/districts/' + id).child('coverIcon');
  try {
    const url = await ref.getDownloadURL();
    console.log('getting downloadURL of image success');
    setDistrictIconUrl(url);
  } catch (e) {
    console.log('getting downloadURL of image error => ', e);
  }
};

React.useEffect(() => {
  if (districtJSON.hasIcon && districtJSON.districtID) {
    districtIcon(districtJSON.districtID);
  }
}, [districtJSON]);

  const truncateString = (str, n) => {
    if (!str) {
      return '';
    }
    return str.length > n ? str.slice(0, n) + '...' : str;
  };

  React.useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsRef = ref(database, `users/${currentUser.getUsername()}/groups`);
        const snapshot = await get(groupsRef);

        if (snapshot.exists()) {
          const groups = snapshot.val();
          const groupsArray = Object.keys(groups).map(key => groups[key]);
          setMyGroups(groupsArray);
        } else {
          console.log("No groups found");
        }
      } catch (error) {
        console.error("Error fetching groups: ", error);
      }
    };

    fetchGroups();
  }, []);

  React.useEffect(() => { async function fetchData()  {
    console.log("loading district")
    if (currentUser.getDistrict() != "Rogue Student"){
      const theD = await get(ref(database, "districts/" + currentUser.getDistrict().districtID));
    if(theD.exists()){
      setDistrictJSON(theD.val())
      
    const userDistrict = currentUser.getDistrict().name;
    setDistrict(userDistrict);
      setLoaded(true)
      console.log("district loaded")
    
      dcXP = theD.val().xp;
      console.log("DCXP:" , dcXP)
      dreq = -1 * (Math.pow(1.04, ((-1 * theD.val().level) + 215.473))) + 5000;
      console.log("DREQ:" , dreq)
      dXPP = dcXP/dreq;
      setDistrictXP(dXPP)
    } else{
      console.log("district doesn't exist")
      currentUser.setDistrict({
        "name": "Rogue Student",
        "description": "This user has not joined a district",
        "tags": [],
        "owner": "",
        "settings": {
            "private": false,
            "maxMembers": -1,
            "allowedAccounts": [],
            "levelReq": 0,
            "official": false,
            "verified": false,
            "inviteOnly": false
        },
        "members": [],
        "admins": [],
        "districtID": "",
        "hasIcon": false,
        "level": 0,
        "xp": 0
      })
      setDistrict("Rogue Student")
      setLoaded(true)
    }
    }else{
      console.log("district doesn't exist")
      currentUser.setDistrict({
        "name": "Rogue Student",
        "description": "This user has not joined a district",
        "tags": [],
        "owner": "",
        "settings": {
            "private": false,
            "maxMembers": -1,
            "allowedAccounts": [],
            "levelReq": 0,
            "official": false,
            "verified": false,
            "inviteOnly": false
        },
        "members": [],
        "admins": [],
        "districtID": "",
        "hasIcon": false,
        "level": 0,
        "xp": 0
      })
      setDistrict("Rogue Student")
      setLoaded(true)
    }
    
  } fetchData()
  }, []);

  

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
      
      <UserHeader currentUser={currentUser} />

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
        <ScrollView style={{
          width: "100%"
        }} contentContainerStyle={{ alignItems: 'center'}}>
        <Text style={styles.sectionHeader}>Study Hall</Text>
        <Text style={styles.sectionSubHeader}>Talk to other students from your district or around the globe.</Text>

        <TouchableOpacity style={[styles.sectionShadow, {
          height: 60,
          width: '95%',
          backgroundColor: "#2e2e2e44",
          borderRadius:20,
          borderWidth: 1,
          borderColor: COLORS.gray1,
          marginTop: 10,
          flexDirection: 'row',
          alignItems:'center'
        }]} onPress={() => {navigation.navigate("searchhall", {currentUser: currentUser})}}>
        <Image
            style={{width: 30, alignSelf:"center", opacity:1, margin: 20, aspectRatio: 1}}
            source={require('../constants/images/UIcons/icons8-search-150.png')}
            tintColor={COLORS.white}
            />
        
        <View style={{flex:6, alignItems: 'center'}}>
        <Text style={{fontSize: 15, fontStyle: 'italic', color: COLORS.gray1}}>Search new districts, groups, people...
        </Text>
        </View>
        </TouchableOpacity>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5}}>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white}]}>My District</Text>
          </View>
          {(!loaded) && (<View style={{
            justifyContent:'center',
            margin: 20,
            flex: 1
          }}>
            <Image
            style={{ flex:1 , aspectRatio: 1, alignSelf:"center", opacity:1, margin: 10}}
            source={require('../constants/images/UIcons/gradient-5812.gif')}
            />
          </View>)}

          {(loaded && district == "Rogue Student") && (<View style={{
            justifyContent:'space-around',
            alignItems: 'center',
            flex: 1,
            margin: 20
          }}>
          <View style={{flex: 3, flexDirection: 'row'}}>
          
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>You are not in a district!</Text>
          </View>
          </View>
          <View style={{flex:1, flexDirection:'row', justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity style={{
              alignContent:'center',
              width: '90%'
            }} onPress={()=> {
              navigation.navigate("searchhall", {currentUser: currentUser})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                width: '80%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                flex: 1,
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 18,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Join a District</Text>

              </View>
            </TouchableOpacity>
            
          </View>

          </View>)}

          {(loaded && district != "Rogue Student") && (<View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 5, width:'auto', borderRadius: (disPicRadius), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
          {!districtJSON.hasIcon || districtIconUrl == '' && (<Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />)}
        {districtJSON.hasIcon && districtIconUrl != '' && (<Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
            source={{uri: districtIconUrl }}
            resizeMode="contain"
        />)}
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {districtJSON.level}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={districtXP} color='#FFFFFF' width={200} />
          </View>
          </View>
          <View style={{flex:1, flexDirection:'row', justifyContent: 'center', marginTop: 10}}>
          <TouchableOpacity style={{
              alignContent:'center',
              width: '90%'
            }} onPress={()=> {
              navigation.navigate("districtview", {currentUser: currentUser, district: districtJSON})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                width: '80%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                flex: 1,
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 18,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>View District</Text>

              </View>
            </TouchableOpacity>
            
          </View>
          
          </View>)}
        </View>

        <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '95%', marginTop: 20, height: 40}}>
        <TouchableOpacity style={{
              alignContent:'center',
              width: '50%'
            }} onPress={()=> {
              if(currentUser.getDistrict() == "Rogue Student" || currentUser.getDistrict().name == "Rogue Student"){
                navigation.navigate("createdistrict", {currentUser: currentUser})
              }else{
                alert('You are already in a district!');
              }
            }}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                width: '80%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                flex: 1,
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 18,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Create District</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width: '50%'
            }} onPress={()=> {
              navigation.navigate("creategroup", {currentUser: currentUser, district: null})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                width: '80%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                flex: 1,
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 18,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Create Group</Text>

              </View>
            </TouchableOpacity>
        </View>

          <View style={{alignItems: "flex-start", justifyContent: "center", marginTop: 5, width: '100%'}}>
            <Text style={[styles.sectionHeader, {fontSize: 22, color: COLORS.white, marginStart: 25, fontWeight: 500}]}>My Groups</Text>
          </View>

          {myGroups.map((group, index) => ((
            <TouchableOpacity style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]} key={index} onPress={() => {navigation.navigate("groupview", {currentUser: currentUser, group: group})}}>

          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row'}}>
          <View style={{alignItems: "center", justifyContent: "center", marginRight: 15, flex: 1}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          <View style={{alignItems: "flex-start", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700, marginBottom: 5}]}>{group.name}</Text>
            <Text style={[styles.header1, {fontSize: 14, color: COLORS.white, fontWeight: 400, marginBottom: 20}]}>{truncateString(group.description, 45)}</Text>
            <Text style={[styles.header1, {fontSize: 15, color: COLORS.white, fontWeight: 400, marginBottom: 10}]}>Members: {Array.isArray(group.members) ? group.members.length : 0}</Text>
            <ScrollView style={{
            width: '100%',
            height:'auto',
            flexDirection:'row',
            margin:5
          }} horizontal={true}>{/* Post Tags */}
            {Array.isArray(group.tags) ? group.tags.map((tag, index2) => (
                    <View 
                      style={{
                        width: 'auto',
                        height: '100%',
                        backgroundColor: COLORS.wizBlue,
                        borderRadius: 15,
                        alignItems: 'center',
                        marginRight: 10,
                        padding: 5,
                      }} 
                      key={index2}
                    >
                      <Text 
                        style={{
                          textAlign: 'center',
                          fontWeight: 'bold',
                          alignContent: 'center',
                          margin: 0,
                          color: COLORS.white
                        }}
                      >
                        {tag}
                      </Text>
                    </View>
                  )) : null}
          </ScrollView>{/* Post Tags */}
          </View>
          </View>
          
          </View>
        </TouchableOpacity>
          )))}
        </ScrollView>

      </View>

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
            source={require('../constants/images/UIcons/home-6133.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("studyhall", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:-2}]} onPress={() => setModalVisible(true)}>
        <Image
            style={{  width: '100%', height: '100%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-plus-60.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("wizwar", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/lightning-bolt-4124.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {width:'15%',justifyContent: 'center', margin:6}]} onPress={()=> navigation.navigate("notebook", {currentUser: currentUser})}>
        <Image
            style={{  width: '60%', height: '60%', alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/book-13427.png')}
            resizeMode="contain"
        />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default Studyhall;