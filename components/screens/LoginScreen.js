import React from 'react';
import { KeyboardAvoidingView, Button, StyleSheet, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Header from '../Header.js';

export default class HomeScreen extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user: '',
            password: '',
            url: '',
        };
    }

    storeData = async (url, key, status) => {
        try {
            await AsyncStorage.setItem('@api_url', url);
            await AsyncStorage.setItem('@api_key', key);
            await AsyncStorage.setItem('@admin_status', status);
        } catch (e) {
            alert('Failed to save data: ' + e);
        }
    };

    onChangeUser = text => {
        this.setState({
            user: text,
        });
    };

    onChangePassword = text => {
        this.setState({
            password: text,
        });
    };

    onChangeUrl = text => {
        this.setState({
            url: text,
        });
    };

    onPress = async () => {
        if (this.state.user === 'Clear') {
            await AsyncStorage.clear();
            alert("cleared!")
        } else {
            const key = await AsyncStorage.getItem('@api_key');

            if (!key) {
                const url = this.state.url + '/api-token-auth/';
                console.log(url);
                try {
                    let response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: this.state.user,
                            password: this.state.password,
                        }),
                    });

                    let responseJson = await response.json();
                    if (response.ok) {
                        const avUrl = this.state.url + '/av/';
                        let response2 = await fetch(avUrl, {
                            headers: {
                                Authorization: 'Token ' + responseJson.token,
                            },
                        });
                        console.log(avUrl + ' : ' + response2.status);
                        await this.storeData(
                            this.state.url,
                            responseJson.token,
                            String(response2.status),
                        );
                    } else {
                        alert('Failed to authenticate: ' + JSON.stringify(responseJson));
                        return;
                    }
                } catch (e) {
                    alert('Failed to authenticate: ' + e);
                    return;
                }
            }

            // at this point, we know both api_url, api_key and admin_status are all stored
            const status = await AsyncStorage.getItem('@admin_status');

            if (status === '200') {
                this.props.navigation.navigate('Add');
            } else {
                this.props.navigation.navigate('Search');
            }
        }
    };

    render() {
        return (
            <KeyboardAvoidingView style={styles.container}>
                <Header />

                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        backgroundColor: 'white',
                    }}
                    onChangeText={this.onChangeUser}
                    placeholder="Enter user!"
                />
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        backgroundColor: 'white',
                    }}
                    onChangeText={this.onChangePassword}
                    placeholder="Enter password!"
                />
                <TextInput
                    style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1,
                        backgroundColor: 'white',
                    }}
                    onChangeText={this.onChangeUrl}
                    placeholder="Enter service URL!"
                />
                <Button
                    color='black'
                    title="Log In" onPress={this.onPress} />
            </KeyboardAvoidingView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'flex-start',
        backgroundColor: 'white',
        padding: 8,
    },
    paragraph: {
        margin: 24,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});
