import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const Details: React.FC = () => {
  const { scannedValues, qnty } = useLocalSearchParams();
  const quantity = qnty ? Number(qnty) : 0;

  
  const scannedArray = scannedValues ? JSON.parse(decodeURIComponent(scannedValues as string)) : [];

  
  const extractSerialNumber = (qrCodeData: string) => {
   
    const urlMatch = qrCodeData.match(/i=([^&]+)/);
    if (urlMatch) {
      return urlMatch[1]; 
    }

    
    const parts = qrCodeData.split('/');
    return parts.pop() || qrCodeData; 
  };

  const serialNumbers = scannedArray.map((value: string) => extractSerialNumber(value));

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Validate All" color="#ffffff" onPress={() => { /* Handle press */ }} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Clear All" color="#ffffff" onPress={() => { /* Handle press */ }} />
        </View>
      </View>
      <LinearGradient
        colors={['#325180', '#203C58']}
        style={styles.productContainer}
      >
        {serialNumbers.length > 0 ? (
          serialNumbers.map((value: string, index: number) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>Item {index + 1}: {value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noScanText}>No QR codes scanned yet.</Text>
        )}
      </LinearGradient>
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
  resultItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 18,
  },
  noScanText: {
    fontSize: 18,
    color: '#ffffff',
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
