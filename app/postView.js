import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';

import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get} from 'firebase/database';
import Post from "./objects/postObj";
import Profile from "./objects/profileObj";

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const PostView = ({route}) => {
  const { currentUser, menu, type, label } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');
  
  const [scrollViewHeight, setScrollViewHeight] = React.useState(0);

  return (
    <SafeAreaView style={{
      flex: 1,
      display:'flex',
      backgroundColor: COLORS.dark
    }}>


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
          }}>
            <Image
            style={{ width: 60, height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-notlike-96.png')}/>
            </TouchableOpacity>
            <TouchableOpacity style={{
            width: 60,
            margin:5
          }}>
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