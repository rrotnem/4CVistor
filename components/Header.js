'use strict';

import type {Node} from 'react';
import React from 'react';
import {Text, StyleSheet, ImageBackground} from 'react-native';


const Header = (): Node => (
    <ImageBackground
        accessibilityRole={'image'}
        style={styles.background}
        imageStyle={styles.logo}>
        <Text style={styles.text}>Columbus Chinese Christian Church</Text>
    </ImageBackground>
);

const styles = StyleSheet.create({
    background: {
        paddingBottom: 30,
        paddingTop: 30,
        paddingHorizontal: 32,
        backgroundColor: '#000000',
    },
    logo: {
        opacity: 0.2,
        overflow: 'visible',
        resizeMode: 'cover',
    },
    text: {
        fontFamily: 'Arial',
        fontSize: 48,
        fontWeight: 'bold',
        textAlign: 'right',
        color: 'white',
    },
});

export default Header;
