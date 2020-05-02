import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';

import Login from './components/screens/LoginScreen';
import SearchScreen from './components/screens/SearchScreen';
import AddVisitor from './components/screens/AddVisitor';
import ViewOrUpdate from './components/screens/ViewOrUpdate';
import FormOrPhoto from './components/screens/FormOrPhoto';

const Stack = createStackNavigator();

const headerOptions = {
    headerStyle: {
        backgroundColor: '#696969',
    },
    headerTintColor: 'white',
    headerTitleAlign: 'center',
    headerTitleStyle: {
        fontFamily: 'Arial',
        fontWeight: 'bold',
        color: 'white',
    },
};

function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={Login}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="Add"
                    component={AddVisitor}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="View"
                    component={ViewOrUpdate}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="Update"
                    component={ViewOrUpdate}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="Form"
                    component={FormOrPhoto}
                    options={headerOptions}
                />
                <Stack.Screen
                    name="Photo"
                    component={FormOrPhoto}
                    options={headerOptions}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default App;
