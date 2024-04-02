import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';

import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

const PostView = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

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
        <Text style={styles.sectionHeader}>Viewing Posts From:</Text>
        <Text style={styles.sectionSubHeader}>Bookmark or Public Filter</Text>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 600,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          
          <View style={{
            width:'100%',
            height:60,
            backgroundColor: COLORS.gray2,
            borderRadius: 15,
            flexDirection:'row'
          }}>{/* Post Header */}
          <View style={{
            flex: 1,
            height: "100%",
            justifyContent:'space-evenly'
          }}>
          <Text style={styles.postHeader}>Username</Text>
          <Text style={styles.postHeader}>Level: 0</Text>
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
          <Text style={styles.postHeaderRight}>N/A</Text>
          </View>
          </View>{/* Post Header */}
          
          <View style={{
            width: '100%',
            flex:1,
            flexDirection:'row',
            margin:5
          }}>{/* Post Tags */}
            <View style={{
              width:75,
              height:'90%',
              backgroundColor: COLORS.wizBlue,
              borderRadius:15
            }}>
              <Text style={styles.fieldDesc}>

              </Text>
            </View>
          </View>{/* Post Tags */}
          <View style={{
            width: '100%',
            flex:12,
            marginTop:10,
            marginBottom:10,
          }}>
            <ScrollView
    style={{ flex: 1, width:'100%', alignContent: 'center'}}
    pagingEnabled={true}
    horizontal={true}
    scrollEventThrottle={16} >
        <View style={{
          width: (width*90/100),
          marginLeft:(width*25/1000),
          marginRight:(width*25/1000),
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            borderRadius={30}
            source={require('../constants/images/UIcons/photos-10614.png')}/>
        </View>
        <View style={{
          width: (width*90/100),
          marginLeft:(width*25/1000),
          marginRight:(width*25/1000),
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            borderRadius={30}
            source={require('../constants/images/UIcons/photos-10614.png')}/>
        </View>
</ScrollView>
          </View>

          <View style={{
            width: '100%',
            flex:3,
            justifyContent:'flex-start'
          }}>
            <Text style={styles.postTitle}>Title</Text>
            <ScrollView>
            <Text style={styles.postDesc}>Description</Text>
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

      </View>

    </SafeAreaView>
  )
}

export default PostView;