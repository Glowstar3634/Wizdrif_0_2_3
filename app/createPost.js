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

import badWordChecker from "./functions/badWordChecker";
import scanContent from "./functions/scanContent";
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';

import Post from "./objects/postObj";
import {Profile} from './objects/profileObj';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set} from 'firebase/database';


const CreatePost = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const [titleInput, onTitleUpdate] = React.useState('');
  const [descInput, onDescUpdate] = React.useState('');
  
  const nullImage = require('../constants/images/UIcons/photos-10614.png');
  const [images, onImagesUpdate] = React.useState([nullImage]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [postType, setPostType] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [topicData, setTopicData] = React.useState(noTopics);
  const [topic, setTopic] = React.useState("");
  const [postPrivate, setPostPrivate] = React.useState(false);
  const [tags1, setTags1] = React.useState("");
  const [tags2, setTags2] = React.useState("");
  const postTags = [];
  const toggleSwitch = () => setPostPrivate(previousState => !previousState);
  

  const create = async () => {
    console.log('Checking...');
    if (!titleInput.trim()) {
      alert('Please enter a title for your post');
      return;
    }
    if (titleInput.length > 50) {
      alert('Maximum title length of 50 characters');
      return;
    }
    if (!descInput.trim()) {
      alert('Please enter a description for your post');
      return;
    }
    if (descInput.length > 400) {
      alert('Maximum description length of 400 characters');
      return;
    }
    if (!badWordChecker(titleInput) || !badWordChecker(descInput)) {
      alert('Your post contains inappropriate language');
      return;
    }
    
    if (!postType) {
      alert('Please select a post type');
      return;
    }
    if (!subject) {
      alert('Please select a subject');
      return;
    }
    if (!topic) {
      alert('Please select a topic');
      return;
    }
  
    // Perform content scanning
    if (images[0] != nullImage){
      for(let i = 0; i < images.length; i++) {
        const uri = images[i].uri;
        console.log('Localizing...');
        const fileInfo = await FileSystem.getInfoAsync(uri);
        const { uri: localUri } = fileInfo;
        console.log('Encoding...');
        const imageBase64 = await FileSystem.readAsStringAsync(localUri, { encoding: FileSystem.EncodingType.Base64 });
        const octetStream = base64ToOctetStream(imageBase64);
        console.log('Calling...');
        const isContentSafe = await scanContent(octetStream);
    if (!isContentSafe) {
      alert('Your post contains inappropriate photos or content. Attempting to upload this content will disable your account.');
      return;
    } 
      }
    }
    console.log('Proceeding...');
    
    if(tags1){
      postTags.push(tags1);
    }
    if(tags2 && tags1 != tags2){
      postTags.push(tags2);
    }
    console.log('Post Type:', postType);
    console.log('Title:', titleInput);
    console.log('Subject:', subject);
    console.log('Topic:', topic);
    console.log('Post Body:', descInput);
    console.log('Private:', postPrivate);
    console.log('Images:', (images[0] != nullImage));
    console.log('Tags:', postTags.length);

    uploadPost();
  
    // confirmPostCreation
  };

  const uploadPost = async () =>{
    let d = new Date();
    let postID = "post" + d.getTime() + "=" + currentUser.getUsername();
    let newPost = new Post(currentUser.getUsername(), subject, descInput, titleInput, postType, topic);
    newPost.setPostID(postID);
    newPost.setPics(images.length);
    if (images[0] == nullImage){
      newPost.setPics(0);
    }
    newPost.setPrivate(postPrivate);
    newPost.setTags(postTags);


    const userPostRef = ref(database, 'users/' +currentUser.getUsername()+ "/posts/" + postID);
    const pubPostRef = ref(database, 'posts/' + postID);
    set(userPostRef, newPost) //Publishing to user post reference
    .then(async() => {
      console.log('Post data successfully saved to user reference');
      if (images[0] != nullImage){ //Uploading images
        for(let i = 0; i < images.length; i++) {
          const { uri } = await FileSystem.getInfoAsync(images[i].uri);
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

          const ref = firebase.storage().ref('images/posts/' + postID).child('pic' + (i+1));

          await ref.put(blob);
        }
      }
      if(!newPost.getPrivate()){ 
        set(pubPostRef, newPost) //Publishing to public posts reference
        .then(async() => {
          console.log('Post data published successfully to posts reference');
          alert('Post data published successfully to Wizdrif server');
        })
        .catch((error) => {
          console.error('Error making post data public:', error);
        });
      }
    })
    .catch((error) => {
      console.error('Error uploading post data:', error);
    });
  }

  const base64ToOctetStream = (base64String) => {
    const octetStream = new Uint8Array(Buffer.from(base64String, 'base64'));
    return octetStream;
  };

  const topicSelector = (subject) => {
    setSubject(subject);
    if (subject == 'Math'){
      setTopicData(topicMathSpinner);
    } else if (subject == 'Science'){
      setTopicData(topicScienceSpinner);
    } else if (subject == 'Social Studies'){
      setTopicData(topicSocialStudiesSpinner);
    } else if (subject == 'English'){
      setTopicData(topicEnglishSpinner);
    } else if (subject == 'Business and Economics'){
      setTopicData(topicBaESpinner);
    } else if (subject == 'Engineering'){
      setTopicData(topicEngineeringSpinner);
    } else if (subject == 'Programming'){
      setTopicData(topicProgrammingSpinner);
    } else if (subject == 'Other'){
      setTopicData(topicOtherSpinner);
    } else {
      setTopicData(noTopics);
    }
  }

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
      imagesUpdate(result.assets[0]);
    }
  }

  const imagesUpdate = (imageUri) => {
    if (images[0] == nullImage && imageUri != null){
      images.pop();
      images.push(imageUri);
      console.log("switcharoo");
    } else if (images.length != 6 && imageUri != null){
      images.push(imageUri);
    } else if (imageUri == null){
      images.pop();
      if (images.length == 0){
        images.push(nullImage)
      }
      console.log("gone");
    }
    onImagesUpdate([...images]);
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
          style={{alignSelf:'left'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <Text style={styles.sectionHeader}>Create a Post</Text>
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

        <View style={[{
          borderRadius: 20,
          height: 60,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Public</Text>
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={postPrivate ? COLORS.white : COLORS.gray2}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch}
        value={postPrivate}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Private</Text>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>What type of post is this?</Text>
          <View style={[styles.field]}>
          <SelectList 
        setSelected={(postType) => setPostType(postType)} 
        data={postTypes} 
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
          </View>

          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent:'space-around', zIndex:-5
          }}>
            <View style={[styles.safeContain, {flex:1, zIndex:-5}]}>
              <Text style={styles.fieldDesc}>Subject</Text>
              <View style={[styles.field, {width:'90%'}]}>
              <SelectList 
        setSelected={(subject) => topicSelector(subject)} 
        data={subjects} 
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
              </View>
            </View>

            <View style={[styles.safeContain, {flex:1, zIndex:-5}]}>
              <Text style={styles.fieldDesc}>Topic</Text>
              <View style={[styles.field, {width:'90%'}]}>
              <SelectList 
        setSelected={(topic) => setTopic(topic)} 
        data={topicData}
        save="value"
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:5
        }}
    />
              </View>
            </View>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2, zIndex:-5
        }]}>
          <Text style={styles.fieldDesc}>Post Title</Text>
          <View style={styles.field}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={titleInput => onTitleUpdate(titleInput)}
            defaultValue= {titleInput}
          />
          </View>

          <Text style={styles.fieldDesc}>Add Description</Text>
          <View style={[styles.field, {height:90}]}>
          <TextInput 
            style={[styles.startInput,{width: (width*0.95*0.95), height:'auto', color:COLORS.white}]}
            onChangeText={descInput => onDescUpdate(descInput)}
            defaultValue= {descInput}
            multiline={true}
          />
          </View>

          <Text style={styles.fieldDesc}>Tag #1</Text>
          <View style={[styles.field]}>
          <SelectList
        setSelected={(tag) => setTags1(tag)} 
        data={tags} 
        save="value"
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

          <Text style={styles.fieldDesc}>Tag #2</Text>
          <View style={[styles.field, {zIndex:-3,marginBottom:20}]}>
          <SelectList
        setSelected={(tag) => setTags2(tag)} 
        data={tags} 
        save="value"
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

        <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1,
        zIndex: -10
        }}/>

        <Text style={[styles.subSectionHeader,{zIndex: -10}]}>Add Photos ({(images.length)}/6)</Text>
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
                }}>Remove Last</Text>
              </View>
            </TouchableOpacity>
        </View>

        

<View style={{
            width: '90%',
            height: 200,
            marginTop:10,
            marginBottom:10,
            borderRadius: 10,
            borderWidth:5,
            borderColor: COLORS.wizLBlue,
            overflow:"hidden"
          }}>
            <ScrollView
    style={{ flex: 1, width: (width * 0.855), alignContent: 'center'}}
    pagingEnabled={true}
    horizontal={true}
    scrollEventThrottle={16} >
        {(images[0] == nullImage) && (<View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            resizeMode="contain"
            tintColor={COLORS.white}
            borderRadius={30}
            source={nullImage}/>
        </View>)}
        
        {images.map((image, index) => ((images[0] != nullImage) && (
        <View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }} key={index}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            resizeMode="contain"
            borderRadius={30}
            source={{ uri: image.uri }}/>
        </View>
        )))}
</ScrollView>
          </View>

          <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1
        }}/>

<TouchableOpacity style={{
  width: 'auto'
}} onPress={create}>
              <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height: 60,
                marginTop: 20,
                marginBottom: 20,
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
                  alignContent: 'center',
                  height:28,
                  width:100,
                  alignSelf:'center',
                  textAlign:'center',
                  margin:20,
                }}>Post</Text>
              </View>
            </TouchableOpacity>

        </ScrollView>

      </View>

    </SafeAreaView>
  )
}

export default CreatePost;