import React from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    TextInput,
    Text,
    View,
    Button,
    TouchableHighlight,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-community/async-storage';
import {format} from 'date-fns';

export default class AddVisitor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            ini_date: new Date(
                new Date().getTime() - new Date().getDay() * 24 * 3600 * 1000,
            ),
            notes: '',
            showDatePicker: false,
            showProgress: false,
            error: '',
        };
    }

    componentDidMount = () => {
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.setState({
                name: '',
                notes: '',
            });
        });
    }

    componentWillUnmount() {
        this.props.navigation.removeListener(this._unsubscribe);
    }

    _show = () => {
        this.setState({
            showDatePicker: true,
        });
    };

    _onChangeName = text => {
        this.setState({
            name: text,
            error: '',
        });
    };
    _onChangeNotes = text => {
        this.setState({
            notes: text,
        });
    };

    _handleDateChange = e => {
        if (e.type === 'dismissed') {
            return;
        }

        let date = e.nativeEvent.timestamp;

        console.log('new ' + date);
        this.setState({
            ini_date: date,
            showDatePicker: false,
        });
    };

    _postData = async () => {
        if (this.state.name === '') {
            this.setState({
                error: 'Fields with * are required',
            });
            return;
        }

        this.setState({
            showProgress: true,
        });

        const api_url = await AsyncStorage.getItem('@api_url');
        const token = await AsyncStorage.getItem('@api_key');
        fetch(api_url + '/visitors/', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Token ' + token,
            },
            body: JSON.stringify({
                name: this.state.name,
                ini_date: format(this.state.ini_date, 'yyyy-MM-dd'),
                notes: this.state.notes,
            }),
        })
            .then(response => response.json())
            .then(responseJson => {
                let groups = [];
                fetch(api_url + '/groups/', {headers: {Authorization: 'Token ' + token}})
                    .then(response => response.json())
                    .then(responseJson => {
                        responseJson.map(group => {
                            let temp = {
                                label: group.name,
                                value: group.name,
                            };
                            groups.push(temp);
                        });
                    })
                    .then(() =>
                        this.props.navigation.navigate('Update', {
                            visitor: responseJson,
                            groups: groups,
                        }),
                    );
                alert('New visitor record added');
                this.setState({
                    showProgress: false,
                });
            })
            .catch(error => {
                console.error(error);
            });
    };

    render() {
        return (
            <View style={styles.container}>
            <ScrollView>
                <View style={styles.info}>
                    <View style={{color: 'white'}}>
                        <Text>Name*:</Text>
                        <TextInput
                            style={{
                                height: 40,
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            placeholder="required"
                            onChangeText={this._onChangeName}
                            value={this.state.name}
                        />
                        <Text>Notes:</Text>
                        <TextInput
                            style={{
                                height: 120,
                                textAlignVertical: 'top',
                                borderColor: 'gray',
                                borderWidth: 1,
                            }}
                            placeholder="For example: student"
                            multiline={true}
                            onChangeText={this._onChangeNotes}
                            value={this.state.notes}
                        />
                        <Text>Initial Visiting Date*:</Text>
                        <TouchableHighlight onPress={this._show}>
                            <Text style={{color: 'blue'}}>
                                {' '}
                                {format(this.state.ini_date, 'yyyy-MM-dd')}
                            </Text>
                        </TouchableHighlight>

                        {this.state.showDatePicker && (
                            <DateTimePicker
                                value={this.state.ini_date}
                                mode={this.state.mode}
                                locale="es-ES"
                                display="calendar"
                                onChange={this._handleDateChange}
                            />
                        )}
                        <Text style={{color: 'red'}}>{this.state.error}</Text>
                    </View>
                    <View>
                        <Button
                            color="black"
                            title="Add Visitor"
                            onPress={this._postData}
                        />
                    </View>
                </View>
                <View style={{padding: 10}}>
                    {this.state.showProgress && (
                        <Text
                            style={{
                                fontSize: 20,
                                color: 'red',
                                textAlign: 'center',
                            }}>
                            Adding new visitor ...
                        </Text>
                     )}
                </View>
                <View style={styles.search}>
                    <Text style={{padding: 10, backgroundColor: '#696969', color: 'white' }}> View or Update Visitor Information </Text>
                    <Text style={{padding: 10, backgroundColor: '#f0f8ff' }}>
                        If you want to view or update existing visitor information, or to assign a visitor a caring group,
                        please click the button below to go to the search screen.
                    </Text>
                    <Button color='black' title='Go to Search Screen' onPress={() => this.props.navigation.navigate('Search')} />
                </View>
            </ScrollView>
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
        padding: 10,
        margin: 10,
        borderWidth: 10,
    },
    search: {
        flexDirection: 'column',
        justifyContent: 'space-around',
        padding: 10,
        margin: 10,
        borderWidth: 10,
        height: 200
    },
});
