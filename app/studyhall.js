import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal , Dimensions, Alert } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

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
  const [district, setDistrict] = React.useState("Rogue Student");
  const [districtJSON, setDistrictJSON] = React.useState({
    "name": "District Name",
    "members": {
    },
    "level": 0
  });
  const [districtXP, setDistrictXP] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => { async function fetchData()  {
    console.log("loading district")
    const userDistrict = currentUser.getDistrict().name;
    setDistrict(userDistrict);
    
    console.log("awaiting...")
    const theD = await get(ref(database, "districts/" + currentUser.getDistrict().districtID));
    if(theD.exists()){
      setDistrictJSON(theD.val())
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
    }
  } fetchData()
  }, []);

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
        <Text style={{fontSize: 15, fontStyle: 'italic', color: COLORS.gray1}}>Search districts, groups, people...
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
              navigation.navigate("createpost", {currentUser: currentUser})}}>
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
          <View style={{flex: 3, flexDirection: 'row'}}>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 1}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {districtJSON.level}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={districtXP} color='#FFFFFF' width={200} />
          </View>
          </View>
          <View style={{flex:1, flexDirection:'row', justifyContent: 'center'}}>
          <TouchableOpacity style={{
              alignContent:'center',
              width: '90%'
            }} onPress={()=> {
              navigation.navigate("createpost", {currentUser: currentUser})}}>
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
              navigation.navigate("creategroup", {currentUser: currentUser})}}>
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
            <Text style={[styles.sectionHeader, {fontSize: 22, color: COLORS.white, marginStart: 25, fontWeight: 500}]}>Groups</Text>
          </View>
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