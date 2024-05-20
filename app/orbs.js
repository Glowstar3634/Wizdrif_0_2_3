import { useRouter } from "expo-router";
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions } from 'react-native'
import React from 'react'
import styles from '../styles/search';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Progress from 'react-native-progress';
import {Picker} from '@react-native-picker/picker';
import { COLORS } from '../constants';
import { auth, database, storage, firebase } from '../firebase';
import {ref, set, get} from 'firebase/database';

import EmptyOrb from "./objects/emptyOrb";

const Orbs = ({route}) => {
  const { currentUser } = route.params;
  const navigation = useNavigation();
  let currentXP = currentUser.getXp();
  let req = -1 * (Math.pow(1.04, ((-1 * currentUser.getLevel()) + 215.473))) + 5000;
  let xpProgress = currentXP/req;
  const [modalVisible, setModalVisible] = React.useState(false);
  const [modal2Visible, setModal2Visible] = React.useState(false);
  const { width, height } = Dimensions.get('window');
  const [orbsArray, setOrbsArray] = React.useState([]);
  const [orbsCounts, setOrbsCounts] = React.useState([]);
  const [orbAmt, setOrbAmt] = React.useState(0);
  

  React.useEffect(() => {
    loadOrbs();
  }, []);


  const loadOrbs = async () => {
    try {
      const orbsRef = ref(database, ('users/' + currentUser.getUsername() + '/orbs'));
      const snapshot = await get(orbsRef);
      if (snapshot.exists()){
        const orbsData = snapshot.val();
        setOrbsArray(await Promise.all(Object.keys(orbsData)));
        setOrbsCounts(await Promise.all(Object.values(orbsData)));
        console.log('initialized user orbs')
      } else{
        const emptyOrb = new EmptyOrb();
        set(orbsRef, emptyOrb)
        .then(async() => {
          console.log('initialized user orbs')
          const orbsData = snapshot.val();
        setOrbsArray(await Promise.all(Object.keys(orbsData)));
        setOrbsCounts(await Promise.all(Object.values(orbsData)));
        }).catch((error) => {
          console.error('Error initializing orb data:', error);
        });
      }
    }
    catch (error) {
      console.log('Error loading orbs:', error);
    }
  }

  const [orbType, setOrbType] = React.useState(0);
  const [orbPic, setOrbPic] = React.useState(require('../constants/images/Orbs/Wizdrif-Mystery-Orb.png'));
  const [orbCount, setOrbCount] = React.useState('none');
  const [orbName, setOrbName] = React.useState("Select an Orb");

  

  const orbOptions = (orb) => {
    if(orb != orbType && orb != null && orb != 0){
      setOrbType(orb);
      if (orb == 1){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Math-Orb.png'));
        setOrbName("Math Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("math")]);
      } else if (orb == 2){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Science-Orb.png'));
        setOrbName("Science Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("scie")]);
      } else if (orb == 3){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-English-Orb.png'));
        setOrbName("English Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("ensh")]);
      } else if (orb == 4){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Social-Studies-Orb.png'));
        setOrbName("Social Studies Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("sost")]);
      } else if (orb == 5){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-BE-Orb.png'));
        setOrbName("Business/Econ Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("buec")]);
      } else if (orb == 6){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Engineering-Orb.png'));
        setOrbName("Engineering Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("engi")]);
      } else if (orb == 7){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Programming-Orb.png'));
        setOrbName("Programming Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("prog")]);
      } else if (orb == 8){
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Special-Orb.png'));
        setOrbName("Special Orb");
        setOrbCount(orbsCounts[orbsArray.indexOf("special")]);
      }
    } else {
        setOrbType(0);
        setOrbPic(require('../constants/images/Orbs/Wizdrif-Mystery-Orb.png'));
        setOrbName("Select an Orb");
        setOrbCount('none');
    }
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
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <View style={[styles.centeredView, {backgroundColor: 'rgba(0, 0, 0, 0.5)'}]}>
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.5), justifyContent:"space-around"}]}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:35}]}>Breakdown</Text>
            <View style={{flexDirection:'row', justifyContent:'space-around', flex:2}}>
              <View style={{
                flex:2,
                alignItems:'center',
                justifyContent:'space-between'
              }}>
                <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:15, textAlign: 'center'}]}>{orbName}</Text>
                <View style={{
            aspectRatio:1,
            width:'90%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={orbPic}
        />

        </View>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:20, textAlign: 'center'}]}>{orbAmt}</Text>
              </View>
              <View style={{
                flex:1,
                alignItems:'center',
                justifyContent:'center'
              }}>
              <Image
            style={{  width: "100%", height: "30%", alignSelf:"center", opacity:1, position:'absolute'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-double-right-100.png')}
        />

              </View>
              <View style={{
                flex:2,
                alignItems:'center',
                justifyContent:'space-between'
              }}>
                <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:15, textAlign: 'center'}]}>XP Orb</Text>
                <View style={{
            aspectRatio:1,
            width:'90%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          
        <Image
            style={{  width: "400%", height: "400%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={require('../constants/images/Orbs/XP-Orb.png')}
        />

        </View>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:20, textAlign: 'center'}]}>{orbAmt*250}</Text>
              </View>
            </View>
            <Slider 
              style={{width:'80%', height: 25}}
              maximumValue={orbCount}
              minimumTrackTintColor={COLORS.green}
              maximumTrackTintColor="#222222"
              step={1}
              onValueChange={(value) => setOrbAmt(value)}
            />
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
                }}>Breakdown</Text>

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
          <View style={[styles.modalView, {width: (width*0.75), height: (height*0.5), justifyContent:"space-around"}]}>
          <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:35}]}>Convert</Text>
            <View style={{flexDirection:'row', justifyContent:'space-around', flex:2}}>
              <View style={{
                flex:2,
                alignItems:'center',
                justifyContent:'space-between'
              }}>
                <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:15, textAlign: 'center'}]}>{orbName}</Text>
                <View style={{
            aspectRatio:1,
            width:'90%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={orbPic}
        />

        </View>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:20, textAlign: 'center'}]}>{orbAmt}</Text>
              </View>
              <View style={{
                flex:1,
                alignItems:'center',
                justifyContent:'center'
              }}>
              <Image
            style={{  width: "100%", height: "30%", alignSelf:"center", opacity:1, position:'absolute'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-double-right-100.png')}
        />

              </View>
              <View style={{
                flex:2,
                alignItems:'center',
                justifyContent:'space-between'
              }}>
                <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:15, textAlign: 'center'}]}>XP Orb</Text>
                <View style={{
            aspectRatio:1,
            width:'90%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          
        <Image
            style={{  width: "400%", height: "400%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={require('../constants/images/Orbs/XP-Orb.png')}
        />

        </View>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:20, textAlign: 'center'}]}>{orbAmt*250}</Text>
              </View>
            </View>
            <Slider 
              style={{width:'80%', height: 25}}
              maximumValue={orbCount}
              minimumTrackTintColor={COLORS.green}
              maximumTrackTintColor="#222222"
              step={1}
              onValueChange={(value) => setOrbAmt(value)}
            />
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
                }}>Convert</Text>

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
      <View style={{
        flex: 10,
        margin:5,
        flexDirection: "row",
        justifyContent:'flex-start'
      }}>
        <Image
            style={{  width: 50, height: '100%', alignSelf:"flex-start"}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/icons8-person-64.png')}
        />

        <View style={{
        margin:10,
        flexDirection: "column",
        justifyContent:'space-around'
      }}>
        <Text
            style={styles.pageTopText}
        >{currentUser.getUsername()}</Text>

        <Text
            style={styles.pageTopText}
        >Level: {currentUser.getLevel()}</Text>

        <Progress.Bar style={{color:'#FFFFFF'}} progress={xpProgress} color='#FFFFFF' width={200} />

      </View>
{/* Navigation drawer add*/}
      </View>

      <View style={{ 
        flex: 1,
        flexDirection: "row",
        backgroundColor:COLORS.dark1
      }}>
        
      </View>

      <View style={{
        flex: 80,
        borderTopRightRadius: 70,
        alignItems: 'center'
      }}>
      <TouchableOpacity
          style={{alignSelf:'left', position:'absolute'}}
          onPress={() => navigation.goBack()}
        >
            <Image
            style={{ width: 40, height: 40, resizeMode:'contain'}}
            tintColor={COLORS.white}
            source={require('../constants/images/UIcons/left-arrow-6404.png')}/>
        </TouchableOpacity>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:35}]}>Orbs</Text>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          height: (width*0.95),
          marginTop: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'center'
        }]}>
          <View style={{
            width: "100%",
            height: (width*0.95),
            alignItems:'center',
            justifyContent:'center'
          }}>
          <TouchableOpacity style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center'
          }} onPress={() => orbOptions(1)}>
            <View style={{
            width:80,
            height:80,
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '45deg'}]
          }}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Math-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute',transform: [{rotate: '-45deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Math-Orb.png')}
        />
            </View>
            
          </TouchableOpacity>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.2*0.1980)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.4113)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-96.43deg'}]
          }}  onPress={() => orbOptions(2)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Science-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '96.43deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Science-Orb.png')}
        />
            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.4113)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '96.43deg'}]
          }}  onPress={() => orbOptions(3)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/English-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-96.43deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-English-Orb.png')}
        />

            </TouchableOpacity>
            
          </View>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.3*0.4450)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.5129)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-147.86deg'}]
          }} onPress={() => orbOptions(4)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Social-Studies-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '147.86deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Social-Studies-Orb.png')}
        />

            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.5129)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '147.86deg'}]
          }} onPress={() => orbOptions(7)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Programming-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-147.86deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Programming-Orb.png')}
        />

            </TouchableOpacity>
          </View>
          <View style={{
            width:'auto',
            height:'auto',
            flexDirection:'row',
            alignItems:'center',
            justifyContent:'center',
            marginTop:((width*0.3*0.3569)-40)
          }}>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginRight:((width*0.6*0.2282)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '-199.29deg'}]
          }} onPress={() => orbOptions(6)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/Engineering-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '199.29deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-Engineering-Orb.png')}
        />

            </TouchableOpacity>
            <TouchableOpacity style={{
            width:80,
            height:80,
            marginLeft:((width*0.6*0.2282)-40),
            justifyContent:'center',
            overflow:'hidden',
            transform: [{rotate: '199.29deg'}]
          }} onPress={() => orbOptions(5)}>
                <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2}}
            source={require('../constants/images/Orbs/BE-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute', transform: [{rotate: '-199.29deg'}]}}
            source={require('../constants/images/Orbs/Wizdrif-BE-Orb.png')}
        />

            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{
            width:120,
            height:120,
            position:'absolute',
            justifyContent:'center',
            overflow:'hidden'
          }} onPress={() => orbOptions(8)}>
          <Image
            style={{  width: "160%", height: "160%", alignSelf:"center", opacity:0.2, position:'absolute'}}
            source={require('../constants/images/Orbs/Special-Orb-Frame.png')}
        />
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={require('../constants/images/Orbs/Wizdrif-Special-Orb.png')}
        />

          </TouchableOpacity>
          </View>
        </View>

        <View style={[ styles.sectionShadow , {
          borderRadius: 20,
          flex: 1,
          marginTop: 20,
          marginBottom: 20,
          width: '95%',
          backgroundColor: COLORS.dark1,
          borderWidth:5,
          borderColor:COLORS.gray2,
          justifyContent:'flex-start',
          alignItems:'center',
          flexDirection:'row'
        }]}>
        <View style={{
            aspectRatio:1,
            height:'70%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
          
        <Image
            style={{  width: "600%", height: "600%", alignSelf:"center", opacity:1, position:'absolute'}}
            source={orbPic}
        />

        </View>
        <View style={{
          justifyContent:'space-around', flex:1
        }}>
        <View style={{flex:1, justifyContent:'center'}}>
        <Text style={[styles.sectionHeader, {alignSelf:'flex-start',marginStart: 0, fontSize:25}]}>{orbName}</Text>
        </View>
        <View style={{flex:1, justifyContent:'center'}}>
        <Text style={[styles.sectionHeader, {alignSelf:'center',marginStart: 0, fontSize:18}]}>You have {orbCount} of this orb</Text>
        </View>
          <View style={{
            flex:2, flexDirection:'row', alignItems:'center'
          }}>
           <TouchableOpacity style={{height:'100%', flex:1, alignItems:'center', justifyContent:'center'}} onPress={() => {setOrbAmt(0); setModalVisible(!modalVisible)}}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'60%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  height:20,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Breakdown</Text>

              </View>
           </TouchableOpacity>
           <TouchableOpacity style={{height:'100%', flex:1, margin:5, alignItems:'center', justifyContent:'center'}} onPress={() => setModal2Visible(!modal2Visible)}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'60%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  height:20,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Convert</Text>

              </View>
           </TouchableOpacity>
           <TouchableOpacity style={{height:'100%', flex:1, alignItems:'center', justifyContent:'center'}}>
           <View style={[ styles.sectionShadow , {
                borderRadius: 20,
                height:'60%',
                alignSelf: 'center',
                backgroundColor: COLORS.gray,
                flexDirection:'row',
                alignContent:'center'
              }]}>
                <Text style={{
                  color: 'white', 
                  fontSize: 13,
                  width:'100%',
                  height:20,
                  fontWeight: 'bold',
                  alignContent: 'center',
                  alignSelf:'center',
                  textAlign:'center'
                }}>Forge Relic</Text>

              </View>
           </TouchableOpacity>
          </View>
        </View>
        </View>

      </View>

    </SafeAreaView>
  )
}

export default Orbs;