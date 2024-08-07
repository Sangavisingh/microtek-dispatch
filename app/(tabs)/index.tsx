import React, { useState ,useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Alert
} from 'react-native';
import base64 from 'base-64'; 
import { useRouter } from 'expo-router'; 

const LoginScreen = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  console.log('employeeId:::222'+employeeId);
  console.log('password:::@@'+password);
 
  useEffect(() => {
     setEmployeeId('');
    setPassword('');
  }, []);


  const handleLogin = async () => {
    if (!employeeId || !password) {
      Alert.alert('Login Failed', 'Employee ID and password cannot be empty.');
      return;
    }

    try {
      const credentials = base64.encode(`${employeeId}:${password}`);
      const apiUrl = `http://10.255.38.8:8000/basicauth/basicauth?sap-client=600`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('data::', JSON.stringify(data));

      if (data.status === 'You are authorized !!') { 
        Alert.alert('Login Successful', 'You have successfully logged in.');
         setEmployeeId('');
        setPassword('');
         router.push('/SecondScreen'); 
        
      } else {
        Alert.alert('Login Failed', 'Invalid employee ID or password.');
      }
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
      Alert.alert('Error', 'An error occurred while logging in.');
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/image.png')}
        style={styles.background}
      />
      <TextInput
        style={styles.input}
        placeholder="Employee ID"
        placeholderTextColor="#aaa"
        value={employeeId}
        onChangeText={setEmployeeId}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: 'white',
  },
  background: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default LoginScreen;
