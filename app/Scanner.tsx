import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import { useLocalSearchParams, Link } from 'expo-router';
import { CameraView, BarcodeScanningResult } from 'expo-camera';

const Scanner: React.FC = () => {
  const { qnty, scannedValues: prevScannedValues } = useLocalSearchParams();
  const quantity = qnty ? Number(qnty) : 0;
  const initialScannedValues = prevScannedValues ? JSON.parse(decodeURIComponent(prevScannedValues as string)) : [];

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedValues, setScannedValues] = useState<string[]>(initialScannedValues);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scannedValues.length < quantity) {
      const { data } = result;
      setScannedValues([...scannedValues, data]);

      if (scannedValues.length + 1 >= quantity) {
        Alert.alert('Scan Limit Reached', `You have scanned ${quantity} QR codes.`);
      } else {
        Alert.alert('QR Code Scanned', `Scanned Value: ${data}`);
      }
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission...</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />
      {scannedValues.length >= quantity && (
        <Link
          href={`/Details?scannedValues=${encodeURIComponent(JSON.stringify(scannedValues))}&qnty=${quantity}`}
          style={styles.resultLink}
        >
          <Text style={styles.resultText}>Go to Details Page</Text>
        </Link>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultLink: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 18,
    color: 'white',
  },
});

export default Scanner;
