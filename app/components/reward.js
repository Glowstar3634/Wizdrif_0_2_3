import { SafeAreaView, StyleSheet, Text, View, Image, TouchableOpacity, TextInput, ScrollView, Modal, Dimensions, Alert, Animated, Easing } from 'react-native';
import React, { useState, useEffect } from 'react';
import styles from '../../styles/search';
import { COLORS } from '../../constants';

const Reward = ({ reward }) => {
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
  const opacity = React.useState(new Animated.Value(0))[0];
  const [topPosition, setTopPosition] = React.useState(20);

  React.useEffect(() => {
    const randomColor = colorWheel[Math.floor(Math.random() * colorWheel.length)];
    setBgColor(randomColor);
    setTopPosition(Math.random() * 50);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
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
      })
    ]).start();
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
      left: Math.random() * (width - (width * 0.7)),
      opacity: opacity,
      transform: [{ translateY: position }],
    }]}>
      <Text style={[styles.header1, { color: COLORS.white, fontSize: 20, fontWeight: '700' }]}>
        {reward.title ? reward.title : ""}
      </Text>
      <View>
        {reward.orb && <Image 
          style={{}} 
          source={require('../../constants/images/UIcons/icons8-person-64.png')}
          resizeMode="contain"
        />}
        {reward.relic && <Image 
          style={{}} 
          source={require('../../constants/images/UIcons/icons8-person-64.png')}
          resizeMode="contain"
        />}
        {reward.xp && <Image 
          style={{}} 
          source={require('../../constants/images/UIcons/icons8-person-64.png')}
          resizeMode="contain"
        />}
      </View>
    </Animated.View>
  );
};

export default Reward;
