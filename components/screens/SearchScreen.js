import React from 'react';
import {
    Image,
    StyleSheet,
    TextInput,
    Text,
    View,
    ScrollView,
    Button,
    TouchableHighlight,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {format} from 'date-fns';
import AsyncStorage from '@react-native-community/async-storage';

export default class SearchScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mode: 'date',
            name: '',
            notes: '',
            end_date: null,
            start_date: null,
            date_shown: null,
            results: [],
            showDatePicker: false,
            sore: '',
            resultsSize: -1,
            showProgress: false,
        };
    }

    componentDidMount = async () => {
        const status = await AsyncStorage.getItem('@admin_status');
        this.setState({
            loginStatus: status,
        })

        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            if (this.state.resultsSize > 0 && this.state.loginStatus === '200')
                this._search();
        });

        const url = await AsyncStorage.getItem('@api_url');
        const token = await AsyncStorage.getItem('@api_key');

        let groups = [];
        fetch(url + '/groups/', {headers: {Authorization: 'Token ' + token}})
            .then(response => response.json())
            .then(responseJson => {
                responseJson.map(group => {
                    let item = {
                        label: group.name,
                        value: group.name,
                    };
                    groups.push(item);
                });
                this.setState({
                    groups: groups,
                })
            })
            .catch(error => {
                console.error(error);
            });
    }

    componentWillUnmount() {
        this.props.navigation.removeListener(this._unsubscribe);
    }

    _showStart = () => {
        this.setState({
            sore: 'startD',
            date_shown: this.state.start_date
                ? this.state.start_date
                : new Date(new Date().getTime() - 14 * 24 * 3600 * 1000),
            showDatePicker: true,
        });
    };
    _showEnd = () => {
        this.setState({
            sore: 'endD',
            date_shown: this.state.end_date ? this.state.end_date : new Date(),
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
            return;
        }

        let date = e.nativeEvent.timestamp;

        if (this.state.sore === 'startD') {
            this.setState({
                start_date: date,
                showDatePicker: false,
                sore: '',
            });
        }
        if (this.state.sore === 'endD') {
            this.setState({
                end_date: date,
                showDatePicker: false,
                sore: '',
            });
        }
    };

    _search = async () => {
        const api_url = await AsyncStorage.getItem('@api_url');
        console.log('api_url stored before is ' + api_url);
        let url = api_url + '/visitors?';
        let count = 0;
        if (this.state.name !== '') {
            url = url + 'name=' + this.state.name.trim();
            count += 1;
        }
        if (this.state.notes !== '') {
            url = url + '&note=' + this.state.notes.trim();
            count += 1;
        }
        if (this.state.start_date != null) {
            url = url + '&start=' + format(this.state.start_date, 'yyyy-MM-dd');
            count += 1;
        }
        if (this.state.end_date != null) {
            url = url + '&end=' + format(this.state.end_date, 'yyyy-MM-dd');
            count += 1;
        }
        if (count < 2) {
            return alert('Please fill in at least two search options .');
        }
        //console.log(url);

        this.setState({
            showProgress: true,
        });

        const token = await AsyncStorage.getItem('@api_key');
        fetch(url, {headers: {Authorization: 'Token ' + token}})
            .then(response => response.json())
            .then(responseJson => {
                this.setState({
                    results: responseJson,
                    resultsSize: responseJson.length,
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
                <View style={{borderWidth: 3, padding: 10, fontWeight: 'bold'}}>
                    <Text>Name containing:</Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 2,
                            color: 'blue',
                        }}
                        placeholder="Example: Wen"
                        onChangeText={this._onChangeName}
                    />
                    <Text>Notes containing:</Text>
                    <TextInput
                        style={{
                            height: 40,
                            borderColor: 'gray',
                            borderWidth: 2,
                            color: 'blue',
                        }}
                        placeholder="Example: student"
                        onChangeText={this._onChangeNotes}
                    />

                    <View style={styles.calendar}>
                        <View>
                            <Text>Visited After:</Text>
                            {!this.state.start_date && (
                                <TouchableHighlight onPress={this._showStart}>
                                    <Image
                                        source={require('../Assets/2x/date.png')}
                                        tintColor="#6495ed"
                                    />
                                </TouchableHighlight>
                            )}
                            {this.state.start_date && (
                                <TouchableHighlight onPress={this._showStart}>
                                    <Text style={{color: 'blue'}}>
                                        {format(
                                            this.state.start_date,
                                            'yyyy-MM-dd',
                                        )}
                                    </Text>
                                </TouchableHighlight>
                            )}
                        </View>
                        <View>
                            <Text>Visited Before:</Text>
                            {!this.state.end_date && (
                                <TouchableHighlight onPress={this._showEnd}>
                                    <Image
                                        source={require('../Assets/2x/date.png')}
                                        tintColor="#6495ed"
                                    />
                                </TouchableHighlight>
                            )}
                            {this.state.end_date && (
                                <TouchableHighlight onPress={this._showEnd}>
                                    <Text style={{color: 'blue'}}>
                                        {format(
                                            this.state.end_date,
                                            'yyyy-MM-dd',
                                        )}
                                    </Text>
                                </TouchableHighlight>
                            )}
                        </View>

                        {this.state.showDatePicker && (
                            <DateTimePicker
                                value={this.state.date_shown}
                                mode={this.state.mode}
                                locale="es-ES"
                                display="calendar"
                                onChange={this._handleDateChange}
                            />
                        )}
                    </View>
                    <View>
                        <Button
                            color="black"
                            title="Search"
                            onPress={this._search}
                        />
                    </View>
                </View>
                <ScrollView>
                    {this.state.resultsSize >= 0 && (
                        <Text style={{fontWeight: 'bold', fontSize: 30}}>
                            Search Result:
                        </Text>
                    )}
                    {this.state.resultsSize === 0 && (
                        <Text style={{fontSize: 15, fontWeight: 'bold', paddingLeft: 20, color: 'red'}}>
                             No visitors found !
                        </Text>
                    )}
                    {this.state.showProgress === 0 && (
                        <Text style={{fontWeight: 'bold', paddingLeft: 20}}>
                             Searching ...
                        </Text>
                    )}
                    {this.state.results.map(result => (
                        <Text style={{paddingBottom: 10, paddingLeft: 20, fontSize: 15, color: 'blue'}} key={result.id}
                            onPress={() => {
                                let nextScreen = this.state.loginStatus === '200' ? 'Update' : 'View'
                                this.props.navigation.navigate(
                                    nextScreen,
                                    {
                                        visitor: result,
                                        groups: this.state.groups,
                                    },
                                );
                            }}>
                            Date: {result.ini_date} Name: {result.name}
                        </Text>
                    ))}
                </ScrollView>
            </View>
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
    calendar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 8,
        height: 80,
    },
});
