import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { Link } from 'expo-router';

const Scanner: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [scanned, setScanned] = useState(false);
  
  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (!scanned) {
      const { data } = result;
      Alert.alert('QR Code Scanned', `Scanned Value: ${data}`);
      setScannedValue(data); // Store the scanned value
      setScanned(true); // Prevent scanning again until reset
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
          barcodeTypes: ['qr'], // Only QR codes
        }}
      />
      {scannedValue && (
        <View style={styles.resultContainer}>
          <Link href={`/Details?scannedValue=${encodeURIComponent(scannedValue)}`}>
            <Text style={styles.resultText}>Scanned Value: {scannedValue}</Text>
          </Link>
          <Button title="Scan Again" onPress={() => {
            setScanned(false); // Reset scanning state
            setScannedValue(null); // Clear scanned value
          }} />
        </View>
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
  resultContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
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
