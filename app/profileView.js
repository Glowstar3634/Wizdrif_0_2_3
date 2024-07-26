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
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({route}) => {
    const { currentUser, userView } = route.params;
    const navigation = useNavigation();
    const { width, height } = Dimensions.get('window');

    const [modalVisible , setModalVisible ] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [modal4Visible, setModal4Visible] = React.useState(false);
  const [modal5Visible, setModal5Visible] = React.useState(false);
  const [modal6Visible, setModal6Visible] = React.useState(false);

    let currentXP = userView.xp;
  let req = -1 * (Math.pow(1.04, ((-1 * userView.level) + 215.473))) + 5000;
  let xpProgress = currentXP/req;

  const myPosts = () =>{

  }

  const myCards = () =>{
    
  }

  const logout = ()=>{
    clearCredentials()
    navigation.navigate("start")
  }

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
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark,
      alignItems: 'center'
    }}>
      <View style={{flexDirection:'row', alignItems:'center', justifyContent: 'space-between', width: '100%'}}>
      <TouchableOpacity
          style={{alignSelf:'center'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.safeContain, {marginEnd: 15}]} onPress={() => logout()}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 10,
                height: 'auto',
                marginTop: 20,
                alignSelf: 'center',
                backgroundColor: COLORS.red,
                shadowColor: COLORS.red,
                shadowRadius:5,
                flexDirection:'column',
                alignItems: 'center',
                justifyContent: 'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 15,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  height:'auto',
                  alignSelf:'center',
                  margin: 10
                }}>   Logout   </Text>

              </View>
            </TouchableOpacity>

      </View>

      
      <ScrollView style={{
        width: "100%"
      }} contentContainerStyle={{
        alignItems:'center'
      }}>
      {(currentUser.getUsername() == userView.username) && (<View style={{
        width: '100%',
        alignItems: 'center'
      }}>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 280,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center',
            marginBottom: 0
          }}>
          <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', borderRadius: (width), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
          {!userView.pfp && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
            resizeMode="contain"
        />}
        {userView.pfp && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            source={{uri: userView.pfp}}
            resizeMode="contain"
        />}
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 24, color: COLORS.white, fontWeight: 700}]}>{userView.username}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {userView.level}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={xpProgress} color='#FFFFFF' width={200} />
          </View>
          </View>
          </View>

          <View style={{
            borderRadius: 20,
          height: 80,
          width: '100%',
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
                Friends
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

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={()=> {navigation.navigate("editprofile", {currentUser: currentUser})}}>
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
                Edit Profile
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
        </View>

        <View style={{
            width: '95%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{myPosts}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                shadowColor: COLORS.wizLBlue,
                shadowRadius:10,
                flexDirection:'row',
                alignContent:'center',
                justifyContent:'space-evenly'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>My Posts</Text>
                <View style={{  width: 90, height: '100%', alignSelf:"flex-start", overflow:'hidden', justifyContent:'center'}}>
        <Image
            style={{  width: '50%', height: '100%', alignSelf:"center"}}
            tintColor={COLORS.white}
            resizeMode="contain"
            source={require('../constants/images/UIcons/post-it-black-notes-22348.png')}
        />
        </View>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=> {myCards}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row',
                justifyContent:'space-evenly'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>My Cards</Text>
        <View style={{  width: 70, height: '100%', alignSelf:"flex-start", overflow:'hidden'}}>
        <Image
            style={{  width: '500%', height: '100%', alignSelf:"flex-start", marginLeft: -130}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/Cards.png')}
        />
        </View>
          
              </View>
            </TouchableOpacity>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          alignItems:'center'
        }]}>
        <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700, margin: 20}]}>My Profile</Text>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Username: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.username}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Email: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.email}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Name: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.firstName}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Bio: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{(userView.bio.trim() ? userView.bio : "This user doesn't have a bio yet!")}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Age: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.age}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Grade: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.grade}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>


        </View>
      </View>)}


      {(currentUser.getUsername() != userView.username) && (<View style={{
        width: '100%',
        alignItems: 'center'
      }}>
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 280,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <View style={{
            justifyContent:'space-between',
            alignItems: 'center',
            flex: 1,
            margin: 10,
            flexDirection: 'column',
            alignSelf: 'center',
            marginBottom: 0
          }}>
          <View style={{flex: 3, flexDirection: 'row', justifyContent: 'center'}}>
          <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', borderRadius: (width), borderWidth: 2, borderColor: COLORS.white, padding: 3}}>
          {!userView.pfp && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
            resizeMode="contain"
        />}
        {userView.pfp && <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center", borderRadius: (width)}}
            source={{uri: userView.pfp}}
            resizeMode="contain"
        />}
          </View>
          <View style={{alignItems: "center", justifyContent: "center", marginTop: 5, flex: 3}}>
            <Text style={[styles.header1, {fontSize: 24, color: COLORS.white, fontWeight: 700}]}>{userView.username}</Text>
            <Text style={[styles.header1, {fontSize: 20, color: COLORS.white, fontWeight: 400}]}>Level: {userView.level}</Text>
            <Progress.Bar style={{color:'#FFFFFF', marginTop: 10}} progress={xpProgress} color='#FFFFFF' width={200} />
          </View>
          </View>
          </View>

          <View style={{
            borderRadius: 20,
          height: 80,
          width: '100%',
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
                Friends
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

            <TouchableOpacity style={[styles.safeContain, {flex: 1, alignItems: 'center', justifyContent:'center', flexDirection:'row' }]} onPress={()=> {navigation.navigate("editprofile", {currentUser: currentUser})}}>
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
                Add Friend
                    </Text>
                    <View style={{alignItems: "flex-end", justifyContent: "center", marginTop: 20, marginBottom: 20, width:'auto', padding: 3, height: '60%'}}>
                <Image
            style={{  height: '100%', aspectRatio: 1, alignSelf:"center"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-add-friend-96.png')}
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
        </View>
        </View>

        <View style={{
            width: '95%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=>{myPosts}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                shadowColor: COLORS.wizLBlue,
                shadowRadius:10,
                flexDirection:'row',
                alignContent:'center',
                justifyContent:'space-evenly'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Posts</Text>
                <View style={{  width: 90, height: '100%', alignSelf:"flex-start", overflow:'hidden', justifyContent:'center'}}>
        <Image
            style={{  width: '50%', height: '100%', alignSelf:"center"}}
            tintColor={COLORS.white}
            resizeMode="contain"
            source={require('../constants/images/UIcons/post-it-black-notes-22348.png')}
        />
        </View>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={()=> {myCards}}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row',
                justifyContent:'space-evenly'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 20,
                  fontWeight: 'bold',
                  alignContent: 'flex-start',
                  marginTop:0,
                  height:28,
                  alignSelf:'center',
                  marginStart:20,
                }}>Cards</Text>
        <View style={{  width: 70, height: '100%', alignSelf:"flex-start", overflow:'hidden'}}>
        <Image
            style={{  width: '500%', height: '100%', alignSelf:"flex-start", marginLeft: -130}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/Cards.png')}
        />
        </View>
          
              </View>
            </TouchableOpacity>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          alignItems:'center'
        }]}>
        <Text style={[styles.header1,{fontSize: 20, color: COLORS.white, fontWeight: 700, margin: 20}]}>Profile</Text>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Username: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.username}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Email: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.email}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Name: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.firstName}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Bio: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{(userView.bio.trim() ? userView.bio : "This user doesn't have a bio yet!")}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Age: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.age}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>
        <View style={{flexDirection:'row', width: "85%", height:'auto', alignItems: 'center'}}>
          <Text style={[styles.header1,{fontSize: 15, color: COLORS.white, fontWeight: 600}]}>Grade: </Text>
          <Text style={[styles.header1,{fontSize: 14, color: COLORS.white, fontWeight: 400, marginStart: 20}]}>{userView.grade}</Text>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1, margin: 15}}/>


        </View>
      </View>)}
      </ScrollView>
    </SafeAreaView>
  )
}

export default ProfileScreen