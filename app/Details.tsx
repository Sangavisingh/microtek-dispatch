import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Details: React.FC = () => {
  const { scannedValues, qnty } = useLocalSearchParams();
  const quantity = qnty ? Number(qnty) : 0;

  const scannedArray = scannedValues ? JSON.parse(decodeURIComponent(scannedValues as string)) : [];
  console.log('scannedArray:', scannedArray);

  const extractSerialNumber = (qrCodeData: string) => {
    const urlMatch = qrCodeData.match(/i=([^&]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    const parts = qrCodeData.split('/');
    return parts.pop() || qrCodeData;
  };

  const serialNumbers = scannedArray.map((value: string) => extractSerialNumber(value));
  console.log('quantity:', quantity);

  const router = useRouter();

  const handleClearAll = () => {
    router.push({
      pathname: '/Scanner',
      params: {
        qnty: quantity, // Reset to original quantity
        scannedValues: encodeURIComponent(JSON.stringify([]))
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="Validate All" color="#ffffff" onPress={() => { /* Handle press */ }} />
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Clear All" color="#ffffff" onPress={handleClearAll} />
        </View>
      </View>
      
      <View style={styles.resultsContainer}>
        {serialNumbers.length > 0 ? (
          serialNumbers.map((value: string, index: number) => (
            <View key={index} style={styles.resultItem}>
              <Text style={styles.resultText}>Item {index + 1}: {value}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noScanText}>No scanned values</Text>
        )}
      </View>
     
      <View style={styles.footer}>
        {quantity > 0 ? (
          <Button
            title={`Scan More (Remaining: ${quantity})`}
            onPress={() => {
              router.push({
                pathname: '/Scanner',
                params: {
                  qnty: quantity, // Pass remaining quantity
                  scannedValues: encodeURIComponent(JSON.stringify(scannedArray))
                }
              });
            }}
          />
        ) : (
          <Text style={styles.qntyText}>No more scans needed</Text>
        )}
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
  resultsContainer: {
    flex: 1,
    justifyContent: 'center',
    marginBottom : 450,
  },
  resultItem: {
    marginBottom: 5, // Reduced margin for less gap
    padding: 15,    // Adjusted padding
    backgroundColor: '#325180',
    borderRadius: 8,
  },
  resultText: {
    fontSize: 18,
    color: '#ffffff',
  },
  noScanText: {
    fontSize: 18,
    color: '#ffffff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    marginTop: 60,
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
});

export default Details;
