import { Link } from 'expo-router';
import { StyleSheet, View ,ImageBackground} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function Screentwo() {
  return (
    <>
    
        
      <ThemedView style={styles.container}>
      <ImageBackground
        source={require('@/assets/images/image.png')}
        style={styles.background}
      />
       <ThemedView style={styles.card}>
          <ThemedText type="subtitle" style={styles.subtitle}>Select scanning device</ThemedText>
          <View style={styles.buttonContainer}>
            <Link href="/screen1" style={styles.button}>
              <ThemedText type="link">NewLand Scanner</ThemedText>
            </Link>
            <Link href="/screen2" style={styles.button}>
              <ThemedText type="link">CiperLab Scanner</ThemedText>
            </Link>
            <Link href="/Scanner" style={styles.button}>
              <ThemedText type="link">Android Camera</ThemedText>
            </Link>
          </View>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 60,
    marginTop: 50,
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#D3D3D3',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
    width: '100%', // Adjust width as needed
    alignItems: 'center',
  },
  background: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  subtitle: {
    color: '#3b5998',
    // other styles if needed
  },
});
