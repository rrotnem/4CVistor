import React from 'react';
import {
    ScrollView,
    View,
    Button,
    Text,
    TextInput,
    Image,
    TouchableHighlight,
    StyleSheet,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format, parse} from 'date-fns';
import ImagePicker from 'react-native-image-picker';
import Picker from 'react-native-picker-select';
import AsyncStorage from '@react-native-community/async-storage';

export default class ViewOrUpdate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.route.params.visitor.id,
            name: this.props.route.params.visitor.name,
            ini_date: this.props.route.params.visitor.ini_date,
            notes: this.props.route.params.visitor.notes,
            group: this.props.route.params.visitor.group,
            showDatePicker: false,
            showProgress: false,
            showUpdateProgress: false,
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

    _show = () => {
        this.setState({
            showDatePicker: true,
        });
    };

    _onChangeName = text => {
        this.setState({
            name: text,
        });
    };
    _onChangeNotes = text => {
        this.setState({
            notes: text,
        });
    };

    _handleDateChange = e => {
        if (e.type === 'dismissed') {
            this.setState({
                showDatePicker: false,
            });
            return;
        }

        let date = e.nativeEvent.timestamp;

        this.setState({
            ini_date: format(date, 'yyyy-MM-dd'),
            showDatePicker: false,
        });
    };

    _postData = () => {
        this.setState({
            showUpdateProgress: true,
        });

        let id = this.state.id;

        let url = this.state.url + '/visitor/' + id + '/'
        fetch(url, {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Token ' + this.state.token,
            },
            body: JSON.stringify({
                name: this.state.name,
                ini_date: this.state.ini_date,
                notes: this.state.notes,
                group: this.state.group,
            }),
        })
            .then(response => {
                if (response.ok) {
                    alert('Visitor record updated');
                    this.props.navigation.goBack();
                } else {
                    alert('Bad ' + response);
                }
            })
            .catch(error => {
                console.error(error);
            });

        this.state.showUpdateProgress = false;
    };

    _getImage = forp => {
        this.setState({
            showProgress: true,
        });
        let url = this.state.url + '/v' + forp + '/';
        fetch(url + this.state.id + '/', {headers: {Authorization: 'Token ' + this.state.token}})
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    showProgress: false
                });
                this.props.navigation.navigate(forp === 'form' ? 'Form' : 'Photo', {
                    id: this.state.id,
                    imageBase64Encoded: responseJson[forp],
                    field: forp,
                });
            })
            .catch(error => {
                console.error(error);
            });
    };

    _getForm = () => {
        this._getImage('form');
    };
    _getPhoto = () => {
        this._getImage('photo');
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.info}>
                    <View style={{color: 'white'}}>
                        <Text style={{fontSize: 20, fontWeight: 'bold'}}>
                            Basic Visitor Information:
                        </Text>
                        <Text>Name:</Text>
                        <TextInput
                            style={{
                                height: 40,
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            value={this.state.name}
                            onChangeText={this._onChangeName}
                        />
                        <Text>Notes:</Text>
                        <TextInput
                            style={{
                                height: 120,
                                textAlignVertical: 'top',
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            multiline={true}
                            value={this.state.notes}
                            onChangeText={this._onChangeNotes}
                        />
                        <Text>Initial Visiting Date:</Text>
                        <TouchableHighlight onPress={this._show}>
                            <Text style={{color: 'blue'}}>
                                {this.state.ini_date}
                            </Text>
                        </TouchableHighlight>

                        {this.state.showDatePicker && (
                            <DateTimePicker
                                value={parse(
                                    this.state.ini_date,
                                    'yyyy-MM-dd',
                                    new Date(),
                                )}
                                locale="es-ES"
                                display="calendar"
                                onChange={this._handleDateChange}
                            />
                        )}
                        <Text>Group:</Text>
                        <View>
                            {
                                <Picker
                                    placeholder={{
                                        label: 'No group assigned yet',
                                    }}
                                    onValueChange={value => {
                                        this.setState({
                                            group: value,
                                        });
                                    }}
                                    items={this.props.route.params.groups}
                                    value={this.state.group}
                                />
                            }
                        </View>
                    </View>
                    <View>
                        {this.state.loginStatus === '200' && (
                            <Button
                                color="black"
                                title="Update"
                                onPress={this._postData}
                            />
                        )}
                    </View>
                </View>
                <View style={{padding: 10}}>
                    <TouchableHighlight onPress={this._getForm}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 20,
                                color: 'blue',
                            }}>
                            Click here for visitor form
                        </Text>
                    </TouchableHighlight>
                </View>
                <View style={{padding: 10}}>
                    <TouchableHighlight onPress={this._getPhoto}>
                        <Text
                            style={{
                                fontWeight: 'bold',
                                fontSize: 20,
                                color: 'blue',
                            }}>
                            Click here for visitor photo
                        </Text>
                    </TouchableHighlight>
                </View>
                <View style={{padding: 10}}>
                    {this.state.showProgress && (
                        <Text
                            style={{
                                fontSize: 20,
                                color: 'red',
                                textAlign: 'center',
                            }}>
                            Loading image ...
                        </Text>
                     )}
                </View>
                <View style={{padding: 10}}>
                    {this.state.showUpdateProgress && (
                        <Text
                            style={{
                                fontSize: 20,
                                color: 'red',
                                textAlign: 'center',
                            }}>
                            Updating visitor information ...
                        </Text>
                     )}
                </View>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'flex-start',
        backgroundColor: 'white',
    },
    info: {
        flexDirection: 'column',
        borderWidth: 2,
        padding: 10,
        margin: 10,
        borderWidth: 10,
    },
});
