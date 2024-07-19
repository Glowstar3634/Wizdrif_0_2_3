import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch} from 'react-native';
import { SelectList, MultipleSelectList  } from 'react-native-dropdown-select-list';
import * as ImagePicker from 'expo-image-picker';
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, push, child} from 'firebase/database';

const DistrictView = ({route}) => {
    var { currentUser, district } = route.params;
    const navigation = useNavigation();
    const { width, height } = Dimensions.get('window');
    const disPicRadius = width

  const [loaded, setLoaded] = React.useState(false);
  const [loadedDistrict, setLoadedDistrict] = React.useState(district)
  const [districtIconUrl, setDistrictIconUrl] = React.useState('');
  const [memberIconUrls, setMemberIconUrls] = React.useState([]);

  const [districtXP, setDistrictXP] = React.useState(0);

  const [modalVisible , setModalVisible ] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [modal4Visible, setModal4Visible] = React.useState(false);
  const [modal5Visible, setModal5Visible] = React.useState(false);
  const [modal6Visible, setModal6Visible] = React.useState(false);

  const truncateString = (str, n) => {
    if (!str) {
      return '';
    }
    return str.length > n ? str.slice(0, n) + '...' : str;
  };

  const acceptJoin = async (request, key) => {
    if(Object.values(loadedDistrict.admins || {}).includes(currentUser.getUsername())){
      console.log(key)
    const currentreq = await get(ref(database, "districts/" + district.districtID + "/inbox/" + key))
    const userDis = await get(ref(database, "users/" + request.from + "/district"))
    if(currentreq.exists() && userDis.exists() && (userDis.val() == "Rogue Student" || userDis.val().name == "Rogue Student")){
      if(request.accepted == false && request.rejected == false) {
        set(ref(database, "districts/" + district.districtID + "/inbox/" + key + "/accepted"), true)
    .then(()=>{
      set(ref(database, "users/" + request.from + "/outPending/" + key + "/accepted"), true)
      .then(()=>{
        set(ref(database, "users/" + request.from + "/district"), district)
          .then(()=>{
            set(push(ref(database, "districts/" + district.districtID + "/members")), request.from)
            .then(()=> {
              alert(("New Member: " + request.from))
            })
          })
      })
    })
      }
    }else{
      alert(("Outdated request"))
      console.log(key)
    }
    }else{
      alert(("You do not have permission to complete this action!"))
    }
    
  }

  const declineJoin = async (request, key) => {
    if(Object.values(loadedDistrict.admins || {}).includes(currentUser.getUsername())){
      const currentreq = await get(ref(database, "districts/" + district.districtID + "/inbox/" + key))
    if(currentreq.exists()){
      if(request.accepted == false && request.rejected == false) {
        set(ref(database, "districts/" + district.districtID + "/inbox/" + key + "/rejected"), true)
    .then(()=>{
      set(ref(database, "users/" + request.from + "/outPending/" + key + "/rejected"), true)
      alert(("Rejected " + request.from))
    })
      }
    }else{
      alert(("Outdated request"))
    }
    }else{
      alert(("You do not have permission to complete this action!"))
    }
  }

  React.useEffect(() => { async function fetchData()  {
    console.log("loading district")
    
      const theD = await get(ref(database, "districts/" + district.districtID));
    if(theD.exists()){
      district = (theD.val())
      setLoadedDistrict(district)
      setLoaded(true)
      console.log("district loaded")
      console.log(Object.values(district.inbox || {})[0].type == "districtJoinRequest" && (Object.values(district.inbox || {})[0].accepted == false && Object.values(district.inbox || {})[0].rejected == false))
      
      dcXP = theD.val().xp;
      console.log("DCXP:" , dcXP)
      dreq = -1 * (Math.pow(1.04, ((-1 * theD.val().level) + 215.473))) + 5000;
      console.log("DREQ:" , dreq)
      dXPP = dcXP/dreq;
      setDistrictXP(dXPP)
    } else{
      console.log("district doesn't exist")
      setLoaded(true)
    }
    
  } fetchData()
  }, []);

  React.useEffect(() => {
    if (district.hasIcon && district.districtID) {
      districtIcon(district.districtID);
    }
  }, [district]);

  const districtIcon = async (id) => {
    const ref = firebase.storage().ref('images/districts/' + id).child('coverIcon');
    try {
      const url = await ref.getDownloadURL();
      console.log('getting downloadURL of image success');
      setDistrictIconUrl(url);
      console.log(districtIconUrl)
    } catch (e) {
      console.log('getting downloadURL of image error => ', e);
    }
  };

  return (
    <SafeAreaView style={{
        flex: 1,
        display:'flex',
        backgroundColor: COLORS.dark,
        alignItems: 'center'
      }}>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.7), padding: 20}]}>
            <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700}]}>Members of {loadedDistrict.name}:</Text>
            <ScrollView style={{width: "100%", marginBottom: 20,marginTop: 20}}>
            {Array.isArray(Object.values(loadedDistrict.members || {})) && Object.values(loadedDistrict.members || {}).map((member, index) => (
              <View style={{width: '100%', height: 50, flexDirection: 'row', alignItems:'center'}} key={index}>
              <Text style={[styles.header1,{fontSize: 16, color: 'gray', marginEnd: 20}]}>{index+1}</Text>
              <Image
                                    style={{ width: 35, aspectRatio: 1, alignSelf: "center", borderRadius: width, borderColor: COLORS.white, borderWidth: 1, marginEnd: 10}}
                                    tintColor={COLORS.white}
                                    source={require('../constants/images/UIcons/icons8-person-64.png')}
                                    resizeMode="contain"
                                />
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>{member}</Text>
              </View>
            ))}
            </ScrollView>
            
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModalVisible(false)}>
              
                <Text style={{
                  color: 'gray', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center',
                  marginTop:20
                }}>Cancel</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modal6Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal6Visible(!modal6Visible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.7), padding: 10}]}>
            <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700}]}>Inbox:</Text>
            <ScrollView style={{width: "100%", marginBottom: 20,marginTop: 20}}>
            {Array.isArray(Object.values(loadedDistrict.inbox || {})) && Object.values(loadedDistrict.inbox || {}).map((mail, index) => (
              (mail.type == "districtJoinRequest" && (mail.accepted == false && mail.rejected == false) && <View style={{width: '100%', height: 120, alignItems:'space-evenly', justifyContent:'space-evenly', backgroundColor: "#4D4C4CAA", paddingStart: 10, paddingEnd: 10, borderRadius: 15}} key={index}>
                <View style={{width: '100%', height: 50, flexDirection: 'row', alignItems:'center'}}>
              <Text style={[styles.header1,{fontSize: 16, color: 'gray', marginEnd: 20}]}>{index+1}</Text>
              <Image
                                    style={{ width: 35, aspectRatio: 1, alignSelf: "center", borderRadius: width, borderColor: COLORS.white, borderWidth: 1, marginEnd: 10}}
                                    tintColor={COLORS.white}
                                    source={require('../constants/images/UIcons/icons8-person-64.png')}
                                    resizeMode="contain"
                                />
              <View style={{height: "100%", justifyContent: 'space-evenly'}}>
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>{mail.from}</Text>
              <Text style={[styles.header1,{fontSize: 16, color: COLORS.white}]}>Level: {mail.level}</Text>
              <Text style={[styles.header1,{fontSize: 12, color: COLORS.white}]}>would like to join this district</Text>
              </View>
              </View>
              <View style={{width: '100%', height: 30, flexDirection: 'row', alignItems:'center', justifyContent:'space-evenly'}}>
              <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>View Profile</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{acceptJoin(mail, Object.keys(loadedDistrict.inbox || {})[index])}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.green,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>Accept</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{declineJoin(mail, Object.keys(loadedDistrict.inbox || {})[index])}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: "100%",
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.red,
                flexDirection:'row',
                alignContent:'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 12,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>Decline</Text>

              </View>
            </TouchableOpacity>
              </View>
              </View>)
            ))}
            </ScrollView>
            
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal6Visible(false)}>
              
                <Text style={{
                  color: 'gray', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center',
                  marginTop:20
                }}>Cancel</Text>

            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <TouchableOpacity
          style={{alignSelf:'flex-start'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
      <ScrollView style={{
        width: "100%"
      }} contentContainerStyle={{
        alignItems:'center'
      }}>
      {(Array.isArray(Object.values(loadedDistrict.members || {})) && Object.values(loadedDistrict.members || {}).includes(currentUser.getUsername())) && (<View style={{
        width: '100%',
        alignItems: 'center'
      }}>
      <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
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

          {(loaded) && (<View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', borderRadius: (disPicRadius), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
          {!loadedDistrict.hasIcon || districtIconUrl == '' && (<Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />)}
        {loadedDistrict.hasIcon && districtIconUrl != '' && (<Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
            source={{uri: districtIconUrl }}
            resizeMode="contain"
        />)}
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 24, color: COLORS.white, fontWeight: 700}]}>{loadedDistrict.name}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {loadedDistrict.level}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={districtXP} color='#FFFFFF' width={200} />
          </View>
          </View>
          </View>)}
        </View>
        <View style={{
            borderRadius: 20,
          height: 80,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={() => setModalVisible(true)}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Members
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Options
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-list-96.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Settings
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/settings-5666.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>
        </View>
        <View style={{
          borderRadius: 20,
          height: 150,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          justifyContent: 'center'
        }}>
        <TouchableOpacity style={[styles.safeContain, {flex: 2, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 40,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'center'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Announcements
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-loudspeaker-64.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

          <View style={{
            borderRadius: 20,
          height: '100%',
          flex:1,
          backgroundColor: COLORS.dark2,
          justifyContent: 'space-around'
          }}>
          <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Tasks
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-task-100.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={()=>{setModal6Visible(true)}}>
                <View style={{
                    borderRadius: 20,
                    height: 60,
                    width: '90%',
                    alignSelf: 'center',
                    backgroundColor: COLORS.gray2,
                    flexDirection:'row',
                    alignItems:'center',
                    justifyContent:'space-evenly'
                }}>
                
                    <Text style={{
                  color: 'white', 
                  fontSize: 14,
                  fontWeight: 'bold',
                  alignItems: 'center',
                  marginTop:0,
                  height:'auto',
                  alignSelf:'center'
                }}>
                Inbox
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-mail-96.png')}
            resizeMode="contain"
        />
                </View>
                </View>
            </TouchableOpacity>

          </View>

        </View>

        <TouchableOpacity style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 180,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]} onPress={() => {navigation.navigate("groupview", {currentUser: currentUser, group: loadedDistrict.group})}}>

          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center'
          }}>
          <View style={{flex: 3, flexDirection: 'row'}}>
          <View style={{alignItems: "center", justifyContent: "center", flex: 1, height: 'auto', flexDirection:'row'}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 5}}>
            <Text style={[styles.header1, {fontSize: 28, color: COLORS.white, fontWeight: 700, marginBottom: 5}]}>{loadedDistrict.group.name}</Text>
            <Text style={[styles.header1, {fontSize: 14, color: COLORS.white, fontWeight: 400, marginBottom: 20}]}>{truncateString(loadedDistrict.group.description, 50)}</Text>
          </View>
          <View style={{alignItems: "center", justifyContent: "center", flex: 1, flexDirection:'row'}}>
          <Image
            style={{  width: '90%', aspectRatio: 1, alignSelf:"center",padding:10}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/team-5704.png')}
            resizeMode="contain"
        />
          </View>
          </View>
          </View>
        </TouchableOpacity>
      </View>)}
      </ScrollView>
    </SafeAreaView>
  )
}

export default DistrictView