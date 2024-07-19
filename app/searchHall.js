import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch, Alert} from 'react-native';
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


const SearchHall = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  const { width, height } = Dimensions.get('window');
  const disPicRadius = width

  const [searchInput, onSearchInputUpdate] = React.useState('');
  
  const nullImage = require('../constants/images/UIcons/photos-10614.png');
  const [searchResults1, onSearchResults1Update] = React.useState([]);
  const [districtIconUrls, setDistrictIconUrls] = React.useState([]);
  const [searchResults2, onSearchResults2Update] = React.useState([]);
  const [searchResults3, onSearchResults3Update] = React.useState([]);
  const [pfpUrls, setpfpUrls] = React.useState([]);
  const [modalVisible, setModalVisible] = React.useState(null);
  const [modal2Visible, setModal2Visible] = React.useState(null);
  const [modal3Visible, setModal3Visible] = React.useState(null);
  
  const fetchDistricts = async (input) => {
    try {
      const districtsRef = ref(database, 'districts');
      const snapshot = await get(districtsRef);
      if (snapshot.exists()) {
        const districts = snapshot.val();
        const districtList = Object.values(districts).sort((b,a) => {
          return a.name.toLowerCase().includes(input.toLowerCase()) - b.name.toLowerCase().includes(input.toLowerCase()) ||
                 a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        });
        onSearchResults1Update(districtList);
        fetchDistrictIcons(districtList);
      }
    } catch (error) {
      console.error("Error fetching districts: ", error);
    }
  };

  const truncateString = (str, n) => {
    if (!str) {
      return '';
    }
    return str.length > n ? str.slice(0, n) + '...' : str;
  };

  const fetchGroups = async (input) => {
    try {
      const districtsRef = ref(database, 'groups');
      const snapshot = await get(districtsRef);
      if (snapshot.exists()) {
        const districts = snapshot.val();
        const districtList = Object.values(districts).sort((b,a) => {
          return a.name.toLowerCase().includes(input.toLowerCase()) - b.name.toLowerCase().includes(input.toLowerCase()) ||
                 a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        }).filter((group) => group.district == null);
        onSearchResults2Update(districtList);
      }
    } catch (error) {
      console.error("Error fetching groups: ", error);
    }
  };

  const joinDistrict = async (district) => {
    const my =  await get(ref(database, "users/" + currentUser.getUsername()));
    if(my.exists()){
      let d = my.val().district
      if(d == "Rogue Student" || d.name == "Rogue Student"){
        if(district.settings.inviteOnly == true){
          const districtRef = ref(database, "districts/" + district.districtID + "/inbox")
        const userRef = ref(database, "users/" + currentUser.getUsername() + "/outPending")
        const joinReqID = "djoinreq" + Date.now() + "=" + currentUser.getUsername()
        const request = {
          type: "districtJoinRequest",
          to: district.districtID,
          from: currentUser.getUsername(),
          level: currentUser.getLevel(),
          timestamp: Date.now(),
          accepted: false,
          rejected: false,
          id: joinReqID
        }
        set(child(districtRef, joinReqID), request)
        .then(()=>{
          set(child(userRef, joinReqID), request)
          .then(()=>{
            setModalVisible(null);
            Alert.alert("Sent Join Request", "Successfully sent join request to " + district.name)
          })
        })
        }else{
          set(ref(database, "users/" + currentUser.getUsername() + "/district"), district)
          .then(()=>{
            currentUser.setDistrict(district)
            set(push(ref(database, "districts/" + district.districtID + "/members")), currentUser.getUsername())
            .then(()=> {
              setModalVisible(null);
              Alert.alert("Joined District", "You are now a member of " + district.name)
            })
          })
        }
      }else{
        setModalVisible(null);
        Alert.alert("Cannot join", "You are already in a district!" + district.name)
      }
    }
  }

  const joinGroup = async (district) => {
    const my =  await get(ref(database, "users/" + currentUser.getUsername()));
    if(my.exists()){
      let d = my.val().groups
      if(Object.values(d || {}).filter((group) =>{group.name == district.name}).length == 0){
        if(district.settings.inviteOnly == true){
          const districtRef = ref(database, "groups/" + district.groupID + "/inbox")
        const userRef = ref(database, "users/" + currentUser.getUsername() + "/outPending")
        const joinReqID = "gjoinreq" + Date.now() + "=" + currentUser.getUsername()
        const request = {
          type: "groupJoinRequest",
          to: district.groupID,
          from: currentUser.getUsername(),
          level: currentUser.getLevel(),
          timestamp: Date.now(),
          accepted: false,
          rejected: false,
          id: joinReqID
        }
        set(child(districtRef, joinReqID), request)
        .then(()=>{
          set(child(userRef, joinReqID), request)
          .then(()=>{
            setModal2Visible(null);
            Alert.alert("Sent Join Request", "Successfully sent join request to " + district.name)
          })
        })
        }else{
          set(ref(database, "users/" + currentUser.getUsername() + "/groups/" + district.groupID), district)
          .then(()=>{
            set(push(ref(database, "groups/" + district.groupID + "/members")), currentUser.getUsername())
            .then(()=> {
              setModal2Visible(null);
              Alert.alert("Joined Group", "You are now a member of " + district.name)
            })
          })
        }
      }else{
        setModal2Visible(null);
        Alert.alert("Cannot join", "You are already in this group!" + district.name)
      }
    }
  }

  const fetchPeople = async (input) => {
    try {
      const districtsRef = ref(database, 'users');
      const snapshot = await get(districtsRef);
      if (snapshot.exists()) {
        const districts = snapshot.val();
        const districtList = Object.values(districts).sort((b,a) => {
          return a.username.toLowerCase().includes(input.toLowerCase()) - b.username.toLowerCase().includes(input.toLowerCase()) ||
                 a.username.toLowerCase().localeCompare(b.username.toLowerCase());
        });
        onSearchResults3Update(districtList);
        fetchPFPIcons(districtList);
      }
    } catch (error) {
      console.error("Error fetching districts: ", error);
    }
  };

  const fetchDistrictIcons = async (districtList) => {
    const iconUrls = await Promise.all(districtList.map(async (district) => {
      if (district.hasIcon) {
        const ref = firebase.storage().ref(`images/districts/${district.districtID}`).child('coverIcon');
        try {
          const url = await ref.getDownloadURL();
          return url;
        } catch (e) {
          console.log('getting downloadURL of image error => ', e);
          return null;
        }
      } else {
        return null;
      }
    }));
    setDistrictIconUrls(iconUrls);
  };

  const fetchPFPIcons = async (districtList) => {
    const iconUrls = await Promise.all(districtList.map(async (district) => {
        const ref = firebase.storage().ref(`images/users/${district.username}`).child('pfp');
        try {
          const url = await ref.getDownloadURL();
          return url;
        } catch (e) {
          console.log('User has no pfp: ', e);
          return null;
        }
    }));
    setpfpUrls(iconUrls);
  };
  
  React.useEffect(() => {
    fetchDistricts(searchInput);
    fetchGroups(searchInput);
    fetchPeople(searchInput);
  }, [searchInput]);
  
  const search = (input) => {
    onSearchInputUpdate(input);
  };

  const firstFiveResults1 = searchResults1.slice(0, 5);
  const firstFiveResults2 = searchResults2.slice(0, 5);
  const firstFiveResults3 = searchResults3.slice(0, 5);
  
  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
    <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible != null}
        onRequestClose={() => {
          setModalVisible(null);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
          <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700, marginBottom: 30}]}>{modalVisible ? modalVisible.name : ''}</Text>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModalVisible(null);
              navigation.navigate("districtview", {currentUser: currentUser, district: modalVisible})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>View</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              joinDistrict(modalVisible)}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Join</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModalVisible(null)}>
              
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
        visible={modal2Visible != null}
        onRequestClose={() => {
          setModal2Visible(null);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
          <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700, marginBottom: 30}]}>{modal2Visible ? modal2Visible.name : ''}</Text>
            
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              joinGroup(modal2Visible)}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Join</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal2Visible(null)}>
              
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
        visible={modal3Visible != null}
        onRequestClose={() => {
          setModal3Visible(null);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
          <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700, marginBottom: 30}]}>{modal3Visible ? modal3Visible.username : ''}</Text>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModal3Visible(null);
              navigation.navigate("districtview", {currentUser: currentUser})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>Add Friend</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModal3Visible(null);
              navigation.navigate("createcard", {currentUser: currentUser})}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:28,
                  alignSelf:'center',
                  textAlign:'center'
                }}>View</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal3Visible(null)}>
              
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



      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
      <TouchableOpacity
          style={{alignSelf:'flex-start'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <View style={[styles.sectionShadow, {
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
        
        <View style={{flex:6, alignItems: 'flex-start'}}>
        <TextInput style={{fontSize: 15, fontStyle: 'italic', color: COLORS.white}} onChangeText={input => search(input)} defaultValue= {searchInput} placeholder="Search new districts, groups, people..." placeholderTextColor={COLORS.gray1}/>
        </View>
        </View>
        <ScrollView contentContainerStyle={{alignItems: 'center', width: '100%'}}>

        <Text style={[styles.sectionHeader,{marginBottom:10}]}>Districts</Text>
        {firstFiveResults1.map((district, index) => {
            return (
                
              <TouchableOpacity style={[styles.sectionShadow,{
                alignItems: 'center',
                borderRadius: 20,
                height: 100,
                marginBottom: 20,
                width: '85%',
                backgroundColor: COLORS.dark2
              }]} key={index} onPress={() => {
                setModalVisible(district);
                console.log(district.name)}}>
                <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
                  <View style={{alignItems: "flex-end", justifyContent: "center", margin: 15, width:'auto', borderRadius: (disPicRadius), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
                    <Image
                      style={{ height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
                      tintColor={districtIconUrls[index] ? null : COLORS.white}
                      source={districtIconUrls[index] ? { uri: districtIconUrls[index] } : require('../constants/images/UIcons/team-5704.png')}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
                    <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district.name}</Text>
                    <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {district.level}</Text>
                    <ScrollView style={{
            width: '100%',
            height:'auto',
            flexDirection:'row',
            margin:5
          }} horizontal={true}>{/* Post Tags */}
            {Array.isArray(district.tags) ? district.tags.map((tag, index2) => (
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
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[styles.sectionShadow,{alignSelf: 'flex-end', height: 40, backgroundColor: COLORS.gray2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: 100, marginBottom: 20}]}>
            <Text style={[styles.sectionSubHeader,{fontSize: 16, marginStart: 0, textAlign: 'center', width: '100%'}]}>View All</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionHeader,{marginBottom:10}]}>Groups</Text>
        {firstFiveResults2.map((district, index) => {
            return (
              <TouchableOpacity style={[styles.sectionShadow,{
                alignItems: 'center',
                borderRadius: 20,
                height: 100,
                marginBottom: 20,
                width: '85%',
                backgroundColor: COLORS.dark2
              }]} key={index} onPress={() => {
                setModal2Visible(district);
                console.log(district.name)}}>
                <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
                  <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
                    <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district.name}</Text>
                    <Text style={[styles.header1, {fontSize: 14, color: COLORS.white, fontWeight: 400, marginBottom: 10}]}>{truncateString(district.description, 45)}</Text>
                    <ScrollView style={{
            width: '100%',
            height:'auto',
            flexDirection:'row',
            margin:5,
            marginStart: 20
          }} horizontal={true}>{/* Post Tags */}
            {Array.isArray(district.tags) ? district.tags.map((tag, index2) => (
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
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[styles.sectionShadow,{alignSelf: 'flex-end', height: 40, backgroundColor: COLORS.gray2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: 100, marginBottom: 20}]}>
            <Text style={[styles.sectionSubHeader,{fontSize: 16, marginStart: 0, textAlign: 'center', width: '100%'}]}>View All</Text>
          </TouchableOpacity>

          <Text style={[styles.sectionHeader,{marginBottom:10}]}>People</Text>
        {firstFiveResults3.map((district, index) => {
            return (
              <TouchableOpacity style={[styles.sectionShadow,{
                alignItems: 'center',
                borderRadius: 20,
                height: 100,
                marginBottom: 20,
                width: '85%',
                backgroundColor: COLORS.dark2
              }]} key={index} onPress={() => {
                setModal3Visible(district);
                console.log(district.username)}}>
                <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
                  <View style={{alignItems: "flex-end", justifyContent: "center", margin: 15, width:'auto', borderRadius: (disPicRadius), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
                    <Image
                      style={{ height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (disPicRadius+20)}}
                      tintColor={pfpUrls[index] ? null : COLORS.white}
                      source={pfpUrls[index] ? { uri: pfpUrls[index] } : require('../constants/images/UIcons/icons8-person-64.png')}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
                    <Text style={[styles.header1, {fontSize: 22, color: COLORS.white, fontWeight: 700}]}>{district.username}</Text>
                    <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {district.level}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={[styles.sectionShadow,{alignSelf: 'flex-end', height: 40, backgroundColor: COLORS.gray2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', width: 100, marginBottom: 20}]}>
            <Text style={[styles.sectionSubHeader,{fontSize: 16, marginStart: 0, textAlign: 'center', width: '100%'}]}>View All</Text>
          </TouchableOpacity>
          
        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default SearchHall;