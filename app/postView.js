import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal, Switch } from 'react-native'
import React from 'react'
import styles from '../styles/search';

import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get} from 'firebase/database';
import Post from "./objects/postObj";
import Profile from "./objects/profileObj";

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS } from '../constants';

const PostView = ({route}) => {
  const { currentUser, menu, type, label } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');
  const [modalVisible, setModalVisible] = React.useState(null);
  const [modal2Visible, setModal2Visible] = React.useState(null);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [newNotebook, setNewNotebook] = React.useState(("Notebook " + Date.now()));
  const [postsF, setPostsF] = React.useState(false);
  const toggleSwitch1 = () => setPostsF(previousState => !previousState);
  const [postPrivate, setPostPrivate] = React.useState(false);
  const toggleSwitch = () => setPostPrivate(previousState => !previousState);
  
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0);

  
  const [myNotebooks, setMyNotebooks] = React.useState([])
  const [selectedNb, setSelectedNb] = React.useState()

  React.useEffect(()=>{
    loadNotebooks()
  }, [])

  const loadNotebooks = async() => {
    const userBooks = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks"));
    if(userBooks.exists()){
      let books = Object.entries(userBooks.val() || {});
      books = books.filter(([id, nb]) => nb.type === "posts");
      let ids = books.map(([id, nb]) => id);
      let booknames = books.map(([id, nb]) => nb.name);
      let keyValuePairs = ids.map((id, index) => ({ key: id, value: booknames[index] }));
      
      setMyNotebooks(keyValuePairs);
    }
  }
  

  const createPress = () => {
    setModal2Visible(null);
    setModal3Visible(true);
  }

  const createNewNotebook = async() => {
    if(newNotebook.length > 45){
      alert("Notebook Name is too long! 45 characters max.")
      return null
    }
    const booksRef = await get(ref(database, "users/" + currentUser.getUsername()));
    const notebookID = "notebook" + Date.now() + "=" + currentUser.getUsername()
    if(booksRef.exists()){
      let books = Object.values(booksRef.val().notebooks || {})
      if(books.filter((n) =>{n.name == newNotebook}).length == 0){ //Notebook name is original
        let nbObj = {
          "name": newNotebook,
          "type": (postsF ? "cards" : "posts"),
          "private": postPrivate
        }
        set(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebookID), nbObj)
        .then(()=>{
          setMyNotebooks([...myNotebooks, {key: notebookID, value: newNotebook}])
          loadNotebooks()
          alert(`New Notebook \"${newNotebook}\" Created!`)
          setModal2Visible(false)
        })
      }else{
        alert("You have a notebook with this name already.")
        setModal2Visible(false)
      }
    }
  }

  const savePost = (post, notebook) =>{
    set(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebook + "/entries/" + post), post)
    .then(async ()=>{
      const userBooks = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + notebook))
      if(userBooks.exists()){
        alert(`Post saved to ${userBooks.val().name}`)
      }
    })
  }

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>
    <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible != null}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal2Visible(null);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 0}]}>Save Post</Text>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 20, fontSize: 16, fontWeight: 300}]}>{modal2Visible ? modal2Visible.getTitle() : null}</Text>
            <Text style={styles.fieldDesc}>Notebook</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <SelectList
        setSelected={(tag) => setSelectedNb(tag)} 
        data={myNotebooks}
        save="key"
        notFoundText="You don't have any notebooks for posts!"
        labelStyles={{
          color:COLORS.white
        }}
        inputStyles={{
          color:COLORS.white
        }}
        dropdownStyles={{
          backgroundColor:COLORS.white,
          elevation:10,
          zIndex:25,
        }}
    />
          </View>
          
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%', zIndex: -20
            }} onPress={()=> {
              savePost(modal2Visible.getPostID(), selectedNb)
              setModal2Visible(null);
              }}>
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
                }}>Save</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%', zIndex: -20
            }} onPress={()=> {createPress()}}>
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
                  fontSize: 16,
                  width:'100%',
                  fontWeight: 'bold',
                  alignContent: 'center',
                  height:'auto',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Create New Notebook</Text>

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
        visible={modal3Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal3Visible(!modal3Visible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75)}]}>
            <Text style={[styles.sectionHeader, {alignSelf: 'center', marginStart: 0, marginBottom: 20}]}>New Notebook</Text>
            <Text style={styles.fieldDesc}>Name</Text>
          <View style={[styles.field, {marginBottom: 10}]}>
          <TextInput 
            style={[styles.startInput,{color:COLORS.white}]}
            onChangeText={inp => setNewNotebook(inp)}
            defaultValue= {newNotebook}
          />
          </View>
          <View style={[{
          borderRadius: 20,
          height: 60,
          marginBottom: 20,
          width: '100%',
          backgroundColor: COLORS.dark2,
          flexDirection: 'row',
          alignItems:'center',
          justifyContent:'center'
        }, styles.sectionShadow]}>
          <Text style={[styles.fieldDesc,{fontSize:14,fontWeight:'600', alignSelf:'center'}]}>For Posts</Text>
        </View>
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
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch}
        value={postPrivate}
      />
          <Text style={[styles.fieldDesc,{fontSize:15,fontWeight:'600', alignSelf:'center'}]}>Private</Text>
        </View>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModal3Visible(!modal3Visible);
              createNewNotebook()}}>
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
                }}>Create</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={() => setModal3Visible(false)}>
              
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
        alignItems: 'center',
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
        <Text style={[styles.sectionHeader, {height: 30}]}>Viewing "{type}" Posts in: {label}</Text>
        <Text style={[styles.sectionSubHeader, {height: 15}]}>Bookmark or Public Filter</Text>
        
        <View style={{
          flex:1,
          borderRadius: 10
        }}>
          
        <ScrollView
        style={{flex:1}}
        pagingEnabled={true}
        scrollEventThrottle={16}
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setScrollViewHeight(height); // Update the height of the ScrollView
        }}
        >
        {menu.map((post, index) => ((
        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: (scrollViewHeight-30),
          alignSelf:'center',
          marginBottom: 15,
          marginTop: 15,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]} key={index}>
        
        <View style={{
  width:'100%',
  height:60,
  backgroundColor: COLORS.gray2,
  borderRadius: 15,
  flexDirection:'row'
}}>
<View style={{
  flex: 1,
  height: "100%",
  justifyContent:'space-evenly'
}}>
<Text style={styles.postHeader}>{post.getPoster().getUsername()}</Text>
<Text style={styles.postHeader}>Level: {post.getPoster().getLevel()}</Text>
</View>
<View style={{
  width: 60,
  height: "100%",
  borderRadius:30,
  borderWidth:2,
  justifyContent:'space-around'
}}>
<Image
  style={{ width: '100%', height: '100%', resizeMode:'contain'}}
  tintColor={COLORS.white}
  borderRadius={30}
  source={require('../constants/images/UIcons/icons8-person-64.png')}/>
</View>

<View style={{
  flex: 1,
  height: "100%",
  justifyContent:'space-evenly'
}}>
<Text style={styles.postHeaderRight}>District</Text>
<Text style={styles.postHeaderRight}>{post.getPoster().getDistrict().name}</Text>
</View>
</View>

          <ScrollView style={{
            width: '100%',
            height:1,
            flexDirection:'row',
            margin:5
          }} horizontal={true}>{/* Post Tags */}
            {post.getTags().map((tag, index2) => ((
            <View style={{
              width:'auto',
              height:'90%',
              backgroundColor: COLORS.wizBlue,
              borderRadius:15,
              alignItems:'center',
              marginRight: 10,
              padding:5,
            }} key={index2}>
              <Text style={{
                textAlign: 'center',
                fontWeight: 'bold',
                alignContent:'center', 
                margin:0,
                color:COLORS.white
              }}>{tag}</Text>
            </View>
            )))}
          </ScrollView>{/* Post Tags */}
          <View style={{
            width: '100%',
            flex:12,
            marginTop:10,
            marginBottom:10,
          }}>
            <ScrollView
    style={{ flex: 1, width:(width * 0.9), alignContent: 'center', alignSelf:"center"}}
    pagingEnabled={true}
    horizontal={true}
    scrollEventThrottle={16} >
    {post.getImages().map((image, index2) => ((
        <View style={{
          width: (width* 0.95* 0.9),
          marginLeft:(width*0.025* 0.9),
          marginRight:(width*0.025* 0.9),
        }} key={index2}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            borderRadius={30}
            source={{ uri: image }}/>
        </View>
    )))}
</ScrollView>
          </View>

          <View style={{
            width: '100%',
            flex:3,
            justifyContent:'flex-start'
          }}>
            <Text style={styles.postTitle}>{post.getTitle()}</Text>
            <ScrollView>
            <Text style={styles.postDesc}>{post.getDescription()}</Text>
            </ScrollView>
          </View>
          <View style={{
            width: '100%',
            flex:2,
            flexDirection:'row',
            justifyContent:'flex-end',
          }}>
            <TouchableOpacity style={{
            width: 60,
            margin:5
          }} onPress={()=>{}}>
            <Image
            style={{ width: 60, height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-notlike-96.png')}/>
            </TouchableOpacity>
            <TouchableOpacity style={{
            width: 60,
            margin:5
          }} onPress={()=>{setModal2Visible(post)}}>
            <Image
            style={{ width: 60, height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-bookmark-96.png')}/>
            </TouchableOpacity>
          </View>
        </View>
        )))}
        
        </ScrollView>
        </View>
      </View>

    </SafeAreaView>
  )
}

const PostHeader = ({post}) =>{

  const [posterUser, setPosterUser] = React.useState(undefined);

  React.useEffect(() => {
    const fetchPosterUser = async () => {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersArray = Object.keys(usersData).map(key => {
          const user = usersData[key];
          const userObj = new Profile(
            user.username,
            user.firstName,
            user.lastName,
            user.password,
            user.email,
            user.age,
            user.grade
          );
          userObj.setDistrict(post.district);
          return userObj;
        });

        const foundUser = usersArray.find(user => user.getUsername() === post.poster);
        if (foundUser) {
          setPosterUser(foundUser);
        }
      }
    };

    fetchPosterUser();
  }, [post]);


  if (posterUser === undefined) {
    return null; // Return null while data is being fetched
  }

  if (!posterUser) {
    return null;
  }

  return (
    <View style={{
  width:'100%',
  height:60,
  backgroundColor: COLORS.gray2,
  borderRadius: 15,
  flexDirection:'row'
}}>
<View style={{
  flex: 1,
  height: "100%",
  justifyContent:'space-evenly'
}}>
<Text style={styles.postHeader}>{
  posterUser.getUsername() ? posterUser.getUsername() : "Deleted User"
}</Text> {/* Username */}
<Text style={styles.postHeader}>Level: {posterUser.getLevel() ? posterUser.getLevel() : -3634}</Text> {/* Level */}
</View>
<View style={{
  width: 60,
  height: "100%",
  borderRadius:30,
  borderWidth:2,
  justifyContent:'space-around'
}}>
<Image
  style={{ width: '100%', height: '100%', resizeMode:'contain'}}
  tintColor={COLORS.white}
  borderRadius={30}
  source={require('../constants/images/UIcons/icons8-person-64.png')}/>
</View>

<View style={{
  flex: 1,
  height: "100%",
  justifyContent:'space-evenly'
}}>
<Text style={styles.postHeaderRight}>District</Text>
<Text style={styles.postHeaderRight}>{posterUser.getDistrict() ? posterUser.getDistrict() : "Ghosts of Deletion"}</Text>
</View>
</View>
  );
}

export default PostView;