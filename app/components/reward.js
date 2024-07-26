import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Alert, Animated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/search';
import { COLORS } from '../../constants';
import Orb from '../objects/orbObj';
import Relic from '../objects/relicObj';

const Reward = ({num, reward, onFade }) => {
  const { width, height } = Dimensions.get('window');
  const colorWheel = [
    "#5a87ff",
    "#3d97ff",
    "#62b0f0",
    "#a2b1f1",
    "#22aeef",
    "#7776ff",
    "#b0c3ff",
    "#ccb5ff"
  ];

  const [bgColor, setBgColor] = React.useState("#AA9FFFCC");
  const position = React.useState(new Animated.Value(0))[0];
  const opacity = React.useState(new Animated.Value(1))[0];
  const [topPosition, setTopPosition] = React.useState(20);
  const [leftPosition, setLeftPosition] = React.useState(0);

  React.useEffect(() => {
    const randomColor = colorWheel[Math.floor(Math.random() * colorWheel.length)];
    setBgColor(randomColor);
    setTopPosition(Math.random() * 50 + 50);
    setLeftPosition(Math.random() * (width - (width * 0.7)));

    Animated.parallel([
      Animated.timing(position, {
        toValue: -50, // Move up by 50 units
        duration: 3000,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 3000, // Match the duration of the move-up animation
        useNativeDriver: true,
        easing: Easing.ease
      })
    ]).start(() => {
        if (onFade) {
          onFade();
        }
      });
  }, []);

  return (
    <Animated.View style={[styles.sectionShadow, {
      width: (width * 0.7),
      height: 100,
      alignItems: 'center',
      justifyContent: 'space-evenly',
      backgroundColor: bgColor,
      borderRadius: 20,
      position: 'absolute',
      zIndex: 20,
      top: topPosition,
      left: leftPosition,
      opacity: opacity,
      transform: [{ translateY: position }],
    }]}>
      <Text style={[styles.header1, { color: COLORS.white, fontSize: 20, fontWeight: '700',marginTop: 10}]}>
        {reward.title ? reward.title : "Reward!"}
      </Text>
      {reward.orb && <View style={{flexDirection:'row', width: '100%', justifyContent: 'space-evenly'}}>
        <View style={{
            aspectRatio:1,
            height:'85%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
        <Image 
          style={{width: "700%", height: "700%", alignSelf:"center", opacity:1, position:'absolute'}} 
          source={Orb.icon(reward.orb)}
          resizeMode="contain"
        />
        </View>
        <View style={{justifyContent: 'center'}}>
        <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        {Orb.name(reward.orb)}
      </Text>
      <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        +{reward.quantity} Orbs
      </Text>
        </View>
      </View>}
      {reward.relic && <View style={{flexDirection:'row', width: '100%', justifyContent: 'space-evenly'}}>
        <View style={{
            aspectRatio:1,
            height:'85%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
        <Image 
          style={{width: "700%", height: "700%", alignSelf:"center", opacity:1, position:'absolute'}} 
          source={Relic.icon(reward.relic)}
          resizeMode="contain"
        />
        </View>
        <View style={{justifyContent: 'center'}}>
        <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        {Relic.name(reward.relic)}
      </Text>
      <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        +{reward.quantity} Relic
      </Text>
        </View>
      </View>}
      {reward.xp && <View style={{flexDirection:'row', width: '100%', justifyContent: 'space-evenly'}}>
        <View style={{
            aspectRatio:1,
            height:'85%',
            justifyContent:'center',
            overflow:'hidden'
          }}>
        <Image 
          style={{width: "700%", height: "700%", alignSelf:"center", opacity:1, position:'absolute'}} 
          source={require("../../constants/images/Orbs/XP-Orb.png")}
          resizeMode="contain"
        />
        </View>
        <View style={{justifyContent: 'center'}}>
        <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        Experience Points
      </Text>
      <Text style={[styles.header1, { color: COLORS.white, fontSize: 18, fontWeight: '500' }]}>
        +{reward.quantity} XP
      </Text>
        </View>
      </View>}
    </Animated.View>
  );
};

export default Reward;
