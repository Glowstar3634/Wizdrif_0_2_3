import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Switch } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { SelectList } from "react-native-dropdown-select-list";
import { COLORS } from '../constants';
import UserHeader from "./components/userHeader";
import Reward from "./components/reward";
import Profile from "./objects/profileObj";
import Post from "./objects/postObj";
import Card from "./objects/cardObj";
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get, push, child} from 'firebase/database';
import { isSearchBarAvailableForCurrentPlatform } from "react-native-screens";


const Notebook = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;

  const [newNotebook, setNewNotebook] = React.useState(("Notebook " + Date.now()));
  const [postsF, setPostsF] = React.useState(false);
  const toggleSwitch1 = () => setPostsF(previousState => !previousState);
  const [postPrivate, setPostPrivate] = React.useState(false);
  const toggleSwitch = () => setPostPrivate(previousState => !previousState);

  const [modalVisible , setModalVisible ] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const [modal3Visible, setModal3Visible] = React.useState(false);
  const [modal4Visible, setModal4Visible] = React.useState(false);
  const [modal5Visible, setModal5Visible] = React.useState(false);
  const [modal6Visible, setModal6Visible] = React.useState(false);
  const { width, height } = Dimensions.get('window');

  const [myNotebooks, setMyNotebooks] = React.useState([])
  const [selectedNb, setSelectedNb] = React.useState()

  React.useEffect(()=>{
    loadNotebooks()
  }, [])

  const loadNotebooks = async() =>{
    const userBooks = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks"))
  if(userBooks.exists()){
    let booknames = Object.values(userBooks.val() || {}).map((nb) => nb.name)
    let ids = Object.keys(userBooks.val() || {})
    let keyValuePairs = ids.map((id, index) => ({ key: id, value: booknames[index] }));
    setMyNotebooks(keyValuePairs)
  }
  }

  const viewNotebook = async () => {
    const theNotebook = await get(ref(database, "users/" + currentUser.getUsername() + "/notebooks/" + selectedNb))
    if(theNotebook.exists()){
      const noteType = theNotebook.val().type
      if(noteType == "posts"){
        const posts = await get(ref(database, "posts"))
        if(posts.exists()){
          try {
            const postsRef = ref(database, 'posts');
            const snapshot = await get(postsRef);
            if (snapshot.exists()) {
              const postsData = snapshot.val();
              console.log(postsData)
              const postsArray = await Promise.all(Object.keys(postsData).map(async key => {
                const post = postsData[key];
                const postObj = new Post(
                  post.poster,
                  post.subjectText,
                  post.description,
                  post.title,
                  post.postType,
                  post.topic
                );
                postObj.setPostID(post.postID)
                postObj.setTags(post.tags)
                const currentTags = postObj.getTags() || [];
                postObj.setTags([...currentTags, post.subjectText]);
                postObj.setTags([...currentTags, post.topic]);
                postObj.setTags([...currentTags, post.postType]);
      
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
                userObj.setDistrict(user.district);
                userObj.setLevel(user.level);
                return userObj;
              });
      
              const ghostUser = new Profile(
                "Deleted User",
                "N",
                "A",
                "ghost123",
                "iamdeleted@gmail.com",
                1000000,
                12
              );
      
              ghostUser.setDistrict("Ghosts of Deletion");
              ghostUser.setLevel(-3634);
      
              const foundUser = usersArray.find(x => x.getUsername() === post.poster);
              if (foundUser) {
                postObj.setPoster(foundUser);
              } else{
                postObj.setPoster(ghostUser);
              }
            }
        
                postObj.setImages([])
                postObj.setPics(post.pics)
                for (let i = 0; i < postObj.getPics(); i++){
                  const ref = firebase.storage().ref('images/posts/' + postObj.getPostID()).child('pic' + (i+1));
                  postObj.addImages(await ref.getDownloadURL()
                    .then((url) => {
                      return url;
                    })
                    .catch((e) => console.log('getting downloadURL of image error => ', e)));
                }
                
                postObj.setPrivate(post.private)
                postObj.setPics(post.pics)
                postObj.setLikes(post.likes)
                return postObj;
              }));
              
              const notebookEntries = Object.values(theNotebook.val().entries || {});
              const filteredPosts = postsArray.filter(post => {return notebookEntries.includes(post.getPostID())});
              console.log(Object.values(theNotebook.val().entries || {}))
              if(filteredPosts.length == 0){
                alert("There are no entries in this notebook.")
              }else{
                navigation.navigate("postview", {currentUser: currentUser, menu: filteredPosts, type: "All", label: theNotebook.val().name});
              }
            }
          } catch (error) {
            console.log('Error loading posts:', error);
          }
          
        }
      }
      if(noteType == "cards"){
        const cards = await get(ref(database, "cards"))
        if(cards.exists()){
          try {
            const cardsRef = ref(database, 'cards');
            const snapshot = await get(cardsRef);
            if (snapshot.exists()) {
              const cardsData = snapshot.val();
              const cardsArray = await Promise.all(Object.keys(cardsData).map(async key => {
                const card = cardsData[key];
                const cardObj = new Card(
                  card.cardID,
                  card.poster,
                  card.subject,
                  card.topic,
                  card.title,
                  card.answer1,
                  card.answer2,
                  card.answer3,
                  card.answer4,
                  card.correct,
                  card.hasPic,
                  card.views
                );
                if(card.hasPic == null){
                  cardObj.setHasPic(card.hasPicture);
                }
                if(card.title == null){
                  cardObj.setTitle(card.question);
                }
                cardObj.setPrivate(card.private)
                cardObj.setTags(card.tags)
                const currentTags = cardObj.getTags() || [];
                cardObj.setTags([...currentTags, card.subject]);
                cardObj.setTags([...currentTags, card.topic]);
      
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
                userObj.setDistrict(user.district);
                userObj.setLevel(user.level);
                return userObj;
              });
      
              const ghostUser = new Profile(
                "Deleted User",
                "N",
                "A",
                "ghost123",
                "iamdeleted@gmail.com",
                1000000,
                12
              );
      
              ghostUser.setDistrict("Ghosts of Deletion");
              ghostUser.setLevel(-3634);
      
              const foundUser = usersArray.find(x => x.getUsername() === card.poster);
              if (foundUser) {
                cardObj.setPoster(foundUser);
              } else{
                cardObj.setPoster(ghostUser);
              }
            }
        
            cardObj.setImage([])
                if (cardObj.getHasPic()){
                  const ref = firebase.storage().ref('images/cards/' + cardObj.getCardID()).child('pic');
                  cardObj.setImage([await ref.getDownloadURL()
                    .then((url) => {
                      return url;
                    })
                    .catch((e) => console.log('getting downloadURL of image error => ', e))]);
                }
              
                return cardObj;
              }));
              
              const filteredCards = cardsArray.filter((card) => {return Object.values(theNotebook.val().entries || {}).includes(card.getCardID())})
              
              if(filteredCards.length == 0){
                alert("There are no entries in this notebook.")
              }else{
                navigation.navigate("cardview", {currentUser: currentUser, deck: filteredCards, type: "All", label: theNotebook.val().name});
              }
            }
          } catch (error) {
            console.log('Error loading cards:', error);
          }
        }
      }
    }else{
      alert("There are no entries in this notebook")
    }
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
          alert(`New Notebook \"${newNotebook}\" Created!`)
          setModal2Visible(false)
        })
      }else{
        alert("You have a notebook with this name already.")
        setModal2Visible(false)
      }
    }
  }

  const [rewards, setRewards] = React.useState([]);

  const handleShowReward = () => {
    const newReward = {
      title: `Reward!`,
      relic: "7-3", // Set this as needed
      quantity: 1
    };
    setRewards([...rewards, newReward]);
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark,
      justifyContent:'flex-start'
    }}>
    {rewards.map((reward, index) => (
        <Reward key={index} num={index} reward={reward} onFade={()=>{}}/>
    ))}
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
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModalVisible(!modalVisible);
              navigation.navigate("createpost", {currentUser: currentUser})}}>
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
                }}>Post</Text>

              </View>
            </TouchableOpacity>
            <TouchableOpacity style={{
              alignContent:'center',
              width:'90%'
            }} onPress={()=> {
              setModalVisible(!modalVisible);
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
                }}>Flashcard</Text>

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

      <Modal
        animationType="fade"
        transparent={true}
        visible={modal2Visible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModal2Visible(!modal2Visible);
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
          <Switch
        trackColor={{false: COLORS.dark1, true: COLORS.gray2}}
        thumbColor={COLORS.white}
        ios_backgroundColor={COLORS.dark1}
        onValueChange={toggleSwitch1}
        value={postsF}
      />
          <Text style={[styles.fieldDesc,{fontSize:14,fontWeight:'600', alignSelf:'center'}]}>For Cards</Text>
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
              setModal2Visible(!modal2Visible);
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
            }} onPress={() => setModal2Visible(false)}>
              
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

      <UserHeader currentUser={currentUser} />

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
        <Text style={styles.sectionHeader}>Notebook</Text>
        <Text style={styles.sectionSubHeader}>View notes and flashcards that you've saved.</Text>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>Notebooks</Text>
          <View style={styles.field}>
          <SelectList
        setSelected={(tag) => setSelectedNb(tag)} 
        data={myNotebooks}
        save="key"
        notFoundText="You don't have any notebooks!"
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

          <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%', margin: 20, height: 40, alignSelf:'center', zIndex: -10}}>
        <TouchableOpacity style={{
              alignContent:'center',
              width: '50%'
            }} onPress={()=> {viewNotebook()}}>
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
                }}>View Notebook</Text>

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
                }}>Delete</Text>

              </View>
            </TouchableOpacity>
        </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 'auto',
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>

          <View style={{flexDirection: 'row', justifyContent: 'center', width: '100%', margin: 20, height: 40, alignSelf:'center'}}>
        <TouchableOpacity style={{
              alignItems:'center',
              width: '100%'
            }} onPress={()=> {
              setModal2Visible(true)
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
                }}>Create New Notebook</Text>

              </View>
            </TouchableOpacity>
            
        </View>
        </View>
        

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

export default Notebook;