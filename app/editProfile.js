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

import postTypes from "./lists/postTypes";
import subjects from "./lists/subjects";
import topicMathSpinner from "./lists/mathTopics";
import topicScienceSpinner from "./lists/scienceTopics";
import topicSocialStudiesSpinner from "./lists/ssTopics";
import topicEnglishSpinner from "./lists/englishTopics";
import topicBaESpinner from "./lists/baeTopics";
import topicEngineeringSpinner from "./lists/engineeringTopics";
import topicProgrammingSpinner from "./lists/programmingTopics";
import topicOtherSpinner from "./lists/otherTopics";
import noTopics from "./lists/noTopics";
import tags from "./lists/tags";
import dtags from "./lists/districtTags";
import grades from "./lists/grades";
import ages from "./lists/ages";

import badWordChecker from "./functions/badWordChecker";
import scanContent from "./functions/scanContent";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

import Post from "./objects/postObj";
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get} from 'firebase/database';


const EditProfile = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const [first, setFirst] = React.useState(currentUser.getFirstName());
  const [last, setLast] = React.useState(currentUser.getLastName());
  const [bio, setBio] = React.useState(currentUser.getBio());
  
  const nullImage = require('../constants/images/UIcons/icons8-person-64.png')
  const [image, onImagesUpdate] = React.useState([(currentUser.getPfp() ? currentUser.getPfp() : nullImage)]);
  const [imageUpdated, setImageUpdated] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);

  const [postPrivate, setPostPrivate] = React.useState(false);
  const [official, setOfficial] = React.useState(false);
  const [invite, setInvite] = React.useState(false);
  const [max, setMax] = React.useState(-1);
  const [badInput, setBadInput] = React.useState(false);
  const [badInput2, setBadInput2] = React.useState(false);

  const [tags1, setTags1] = React.useState(currentUser.getAge());
  const [tags2, setTags2] = React.useState(currentUser.getGrade());


  function isNumeric(str) {
    if (typeof str != "string") return false // we only process strings!  
    return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
           !isNaN(parseInt(str)) // ...and ensure strings of whitespace fail
  }

  const save = async() => {
    if(!badWordChecker(first) || !badWordChecker(last) || !badWordChecker(bio)){
        alert("Your profile contains innapropriate language")
        return null
    }
    console.log("starting")
    if (image[0] != nullImage && imageUpdated){ //Uploading images
        const urii = image[0];
        
        const isContentSafe = await scanContent(urii);
        if(!isContentSafe){
            alert('Your profile picture contains inappropriate photos or content. Attempting to upload this content will disable your account.');
            return null
        }
        const { uri } = await FileSystem.getInfoAsync(image[0]);
        const blob = await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
            resolve(xhr.response);
            };
            xhr.onerror = (e) => {
            reject(new TypeError('Network request failed.'))
            };
            xhr.responseType = 'blob';
            xhr.open('GET', uri, true);
            xhr.send(null);
        });

        const reft = firebase.storage().ref('images/users/' + currentUser.getUsername() + '/pfp');
        await reft.put(blob);
        const url = await reft.getDownloadURL();
        if(url){
            currentUser.setPfp(url)
            set(ref(database, ("users/" + currentUser.getUsername() + "/pfp")), url)
            .then(()=>{
                create()
            })
        }
    }else{
        create()
    }
  }
  

  const create = () => {
    currentUser.setFirstName(first)
    set(ref(database, "users/" + currentUser.getUsername() + "/firstName"), first)
    .then(()=>{
        currentUser.setLastName(last)
        set(ref(database, "users/" + currentUser.getUsername() + "/lastName"), last)
        .then(()=>{
            currentUser.setBio(bio)
            set(ref(database, "users/" + currentUser.getUsername() + "/bio"), bio)
            .then(()=>{
                currentUser.setAge(tags1)
                set(ref(database, "users/" + currentUser.getUsername() + "/age"), tags1)
                .then(()=>{
                    currentUser.setGrade(tags2)
                    set(ref(database, "users/" + currentUser.getUsername() + "/grade"), tags2)
                    .then(()=>{
                        alert("Profile Updated Successfully!")
                        navigation.goBack()
                    })
                })
            })
        })
    })
  };


  const base64ToOctetStream = (base64String) => {
    const octetStream = new Uint8Array(Buffer.from(base64String, 'base64'));
    return octetStream;
  };

  const takePhoto = async() => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);
    
    if (!result.canceled) {
      imagesUpdate(result.assets[0].uri);
    }
  }

  const choosePhotos = async() => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    console.log(result);
    
    if (!result.canceled) {
      imagesUpdate(result.assets[0].uri);
    }
  }

  const imagesUpdate = (imageUri) => {
    if (imageUri != null){
      image.pop();
      image.push(imageUri);
      setImageUpdated(true)
    } else if (imageUri == null){
      image.pop();
      if (image.length == 0){
        image.push(nullImage)
      }
      setImageUpdated(false)
    }
    onImagesUpdate([...image]);
  }
  
  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
    
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
        <View style={{flexDirection: 'row', justifyContent: 'space-between', height: 80, alignItems: 'center', width: '100%'}}>
        <Text style={[styles.sectionHeader, { alignSelf: 'center'}]}>Edit Profile</Text>
        <TouchableOpacity style={[styles.safeContain, {marginEnd: 15}]} onPress={() => save()}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 10,
                height: 'auto',
                marginTop: 20,
                alignSelf: 'center',
                backgroundColor: COLORS.wizLBlue,
                shadowColor: COLORS.wizLBlue,
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
                }}>SAVE CHANGES</Text>

              </View>
            </TouchableOpacity>
        </View>
        <View style={{alignSelf: 'center', width: "90%", height: 1, backgroundColor: COLORS.dark1}}/>
        <ScrollView contentContainerStyle={{alignItems: 'center'}}>
        
        <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={{
              color: 'white', 
        fontSize: 25, 
        fontWeight: 'bold',
        alignContent: 'center',
        marginTop:10,
        alignSelf: 'center',
        textAlign:'center'
            }}>Add Photos</Text>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={takePhoto}>
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
                }}>Take Photo</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={choosePhotos}>
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
                }}>Use Gallery</Text>

              </View>
            </TouchableOpacity>
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

      <Text style={[styles.subSectionHeader,{zIndex: -10, alignSelf: 'center', marginStart: 0}]}>Change Profile Photo</Text>

<View style={{
            width: 150,
            height: 150,
            marginTop:10,
            marginBottom:10,
            borderRadius: width,
            borderWidth:5,
            borderColor: COLORS.wizLBlue,
            overflow:"hidden",
            alignItems:'center',
            padding:5, justifyContent: 'center'
          }}>
        {(image[0] == nullImage) && (<Image
            style={{ width: '120%', height: '120%', resizeMode:'contain', borderRadius: width}}
            resizeMode="contain"
            tintColor={COLORS.white}
            source={nullImage}/>)}
        
        {image.map((img, index) => ((image[0] != nullImage) && (<Image
            style={{ width: '100%', height: '100%', resizeMode:'contain', borderRadius: width}}
            resizeMode="contain"
            source={{ uri: img }}
                key={index}
            />
        )))}
          </View>

          <View style={{
            width: '100%',
            alignSelf:'center',
            flexDirection: 'row',
            alignContent:'center',
            justifyContent:'flex-end'
          }}>
            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => setModalVisible(true)}>
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
                alignContent:'center'
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
                }}>Attach Image</Text>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => imagesUpdate(null)}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                width: '90%',
                alignSelf: 'center',
                backgroundColor: COLORS.wizPurp,
                shadowColor: COLORS.wizPurp,
                shadowRadius:10,
                flexDirection:'row'
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
                }}>Remove</Text>
              </View>
            </TouchableOpacity>
        </View>

          
          <View style={{ 
        height: 2,
        marginTop: 20,
        width:'95%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1,
        zIndex: -10,
        }}/>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2, zIndex:-5
        }]}>
          <Text style={styles.fieldDesc}>First Name</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={inp => setFirst(inp)}
            defaultValue= {first}
          />
          </View>

          <Text style={styles.fieldDesc}>Last Name</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={inp => setLast(inp)}
            defaultValue= {last}
          />
          </View>
        </View>

        

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2, zIndex:-5, marginBottom: 100
        }]}>

          <Text style={styles.fieldDesc}>Edit Bio</Text>
          <View style={[styles.field, {height:90}]}>
          <TextInput 
            style={[styles.startInput,{width: (width*0.95*0.95), height:'auto', color:COLORS.white}]}
            onChangeText={descInput => setBio(descInput)}
            defaultValue= {bio}
            multiline={true}
          />
          </View>

          <Text style={styles.fieldDesc}>Age</Text>
          <View style={[styles.field]}>
          <SelectList
        setSelected={(tag) => setTags1(tag)} 
        data={ages}
        placeholder={ages.filter((age) => age.key == currentUser.getAge())[0].key}
        save="key"
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:6,
        }}
    />
          </View>

          <Text style={styles.fieldDesc}>Grade</Text>
          <View style={[styles.field, {zIndex:-3,marginBottom:20}]}>
          <SelectList
        setSelected={(tag) => setTags2(tag)} 
        data={grades} 
        save="key"
        placeholder={grades.filter((grade) => grade.key == currentUser.getGrade())[0].key}
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:6,
        }}
    />
          </View>
        </View>

        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default EditProfile;