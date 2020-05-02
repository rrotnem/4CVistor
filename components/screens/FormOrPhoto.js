import React from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableHighlight,
    Text,
    View,
    Button,
    Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import AsyncStorage from '@react-native-community/async-storage';

export default class FormOrPhoto extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.route.params.id,
            imageBase64Encoded: this.props.route.params.imageBase64Encoded,
            field: this.props.route.params.field,
        };
    }

    componentDidMount = async () => {
        const url = await AsyncStorage.getItem('@api_url');
        const status = await AsyncStorage.getItem('@admin_status');
        const token = await AsyncStorage.getItem('@api_key');

        await this.setState({
            loginStatus: status,
            url: url,
            token: token,
        })
    }

    _uploadImage = () => {
        this.setState({
            showProgress: true,
        });

        let imageBytes = this.state.field === 'form' ?
            JSON.stringify({form: this.state.imageBase64Encoded}) :
            JSON.stringify({photo: this.state.imageBase64Encoded})

        fetch(this.state.url + '/v' + this.state.field + '/' + this.state.id + '/', {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Token ' + this.state.token,
            },
            body: imageBytes,
        })
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    showProgress: false,
                });
                this.props.navigation.goBack();
            })
            .catch(error => {
                console.error(error);
            });
    };

    chooseFile = text => {
        var options = {
            title: 'Select Image',
            storageOptions: {
                skipBackup: true,
                path: 'images',
            },
        };
        ImagePicker.showImagePicker(options, response => {
            if (response.didCancel) {
                console.log('User cancelled image picker');
            } else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            } else {
                this.setState({
                    imageBase64Encoded: response.data,
                });
            }
        });
    };
    render() {
        return (
            <ScrollView>
            <View style={styles.container}>
                {this.state.loginStatus === '200' && (
                    <TouchableHighlight onPress={this.chooseFile}>
                        <Text style={{fontSize: 20}}>Choose a new image for uploading</Text>
                    </TouchableHighlight>
                )}
                <ScrollView><ScrollView horizontal={true}>
                <View style={styles.image}>
                    {!this.state.imageBase64Encoded && (
                        <Image
                            source={require('../Assets/2x/imagena.jpg')}
                            style={{width: 360, height: 270}}
                        />
                    )}
                    {this.state.imageBase64Encoded != '' && (
                        <Image
                            source={{
                                uri:
                                    'data:image/jpeg;base64,' + this.state.imageBase64Encoded,
                            }}
                            style={{width: 450, height: 800}}
                            resizeMode="contain"
                        />
                    )}
                </View>
                </ScrollView></ScrollView>
                <View style={styles.button}>
                    {this.state.loginStatus === '200' && !this.state.showProgress && (
                        <Button
                            color="black"
                            title="Upload"
                            onPress={this._uploadImage}
                        />
                    )}
                </View>
                <View style={styles.button}>
                    {this.state.showProgress && (
                        <Text
                            style={{
                                fontSize: 20,
                                color: 'red',
                                textAlign: 'center',
                            }}>
                            Uploading {this.state.field} ...
                        </Text>
                     )}
                </View>
                </View>
                </ScrollView>

        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
        padding: 8,
        alignItems: 'center',
    },
    button: {
        paddingTop: 20,
        width: '88%',
    },
    image: {
        borderColor: 'black',
        borderWidth: 3,
        width: '98%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
});