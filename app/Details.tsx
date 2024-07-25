import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const Details: React.FC = () => {
  // Retrieve all query parameters
  const { scannedValue, qnty } = useLocalSearchParams();
   
  // Convert qnty to number, default to 0 if undefined
  const quantity = qnty ? Number(qnty) : 0;

  return (
    <View style={styles.container}>
     
      {/* Buttons for validation and clearing */}
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Validate All" color="#ffffff" onPress={() => { /* Handle press */ }} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Clear All" color="#ffffff" onPress={() => { /* Handle press */ }} />
        </View>
      </View>
      <LinearGradient
       colors={['#325180', '#203C58']} // Light blue to dark blue
        style={styles.productContainer}
       >
       <View style={styles.resultContainer}>
        <Text style={styles.resultText}>Scanned Value: {scannedValue}</Text>
      </View>
      </LinearGradient>
      {/* Footer with link to Scanner page */}
      <View style={styles.footer}>
        <Link href={`/Scanner?qnty=${quantity}`} style={styles.qntyLink}>
          <Text style={styles.qntyText}>Scan for Quantity: {isNaN(quantity) ? 'N/A' : quantity}</Text>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ADD8E6',
    justifyContent: 'space-between',
    padding: 10,
  },
  resultContainer: {
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  buttonWrapper: {
    flex: 1,
    backgroundColor: 'red',
    marginHorizontal: 5,
  },
  footer: {
    backgroundColor: '#eebf2d',
    padding: 10,
    alignItems: 'center',
  },
  qntyText: {
    color: '#ffffff',
    fontSize: 20,
  },
  qntyLink: {
    textDecorationLine: 'none',
  },
  productContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
});

export default Details;
