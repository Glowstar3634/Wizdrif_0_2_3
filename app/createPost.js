import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Dimensions, Modal} from 'react-native'
import React from 'react'
import styles from '../styles/search';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';

import postTypes from "./lists/postTypes";
import subjects from "./lists/subjects";

const CreatePost = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const { width, height } = Dimensions.get('window');

  const [titleInput, onTitleUpdate] = React.useState('');
  const [descInput, onDescUpdate] = React.useState('');
  var images = [];
  const [modalVisible, setModalVisible] = React.useState(false);

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
            }} onPress={() => setModalVisible(true)}>
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
            }} onPress={() => setModalVisible(true)}>
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
          backgroundColor: COLORS.dark2
        }, styles.sectionShadow]}>
        {/* Content filter control */}
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>Post Filter</Text>
          <View style={styles.field}>
          {/* type dropdown */}
          </View>

          <View style={{
            width: '100%',
            flexDirection: 'row',
            justifyContent:'space-around'
          }}>
            <View style={[styles.safeContain, {flex:1}]}>
              <Text style={styles.fieldDesc}>Subject</Text>
              <View style={[styles.field, {width:'90%'}]}>
              {/* Subject dropdown */}
              </View>
            </View>

            <View style={[styles.safeContain, {flex:1}]}>
              <Text style={styles.fieldDesc}>Topic</Text>
              <View style={[styles.field, {width:'90%'}]}>
              {/* Topic dropdown */}
              </View>
            </View>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: 200,
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark2
        }]}>
          <Text style={styles.fieldDesc}>Post Title</Text>
          <View style={styles.field}>
          <TextInput 
            style={styles.startInput}
            onChangeText={titleInput => onTitleUpdate(titleInput)}
            defaultValue= {titleInput}
          />
          </View>

          <Text style={styles.fieldDesc}>Add Description</Text>
          <View style={styles.field}>
          <TextInput 
            style={styles.startInput}
            onChangeText={descInput => onDescUpdate(descInput)}
            defaultValue= {descInput}
          />
          </View>
        </View>

        <View style={{ 
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1
        }}/>

        <Text style={styles.subSectionHeader}>Add Photos</Text>
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
                }}>Posts</Text>

              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.safeContain, {flex:1}]} onPress={() => navigation.navigate("cardview", {currentUser: currentUser})}>
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
                }}>Cards</Text>
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
        <View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            borderRadius={30}
            source={require('../constants/images/UIcons/photos-10614.png')}/>
        </View>
        <View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
        }}>
            <Image
            style={{ width: '100%', height: '100%', resizeMode:'contain'}}
            tintColor={COLORS.white}
            borderRadius={30}
            source={require('../constants/images/UIcons/photos-10614.png')}/>
        </View>
        <View style={{
          width: (width*81/100),
          marginLeft:(width*225/10000),
          marginRight:(width*225/10000)
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
        height: 10,
        marginTop: 20,
        width:'100%',
        flexDirection: "row",
        backgroundColor:COLORS.dark1
        }}/>

<TouchableOpacity style={{
  width: 'auto'
}}>
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