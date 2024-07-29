import React, { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams, Link } from 'expo-router';

const Scanner: React.FC = () => {
  const { qnty } = useLocalSearchParams();
  const quantity = qnty ? Number(qnty) : 0;

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedValues, setScannedValues] = useState<string[]>([]);
  const [alertShown, setAlertShown] = useState<boolean>(false);
  const scanCountRef = useRef<number>(0);
  const scanningInProgress = useRef<boolean>(false);  // Add scanningInProgress flag

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanCountRef.current < quantity && !scanningInProgress.current) {
      scanningInProgress.current = true;  // Set flag to true to prevent duplicate scans

      const { data } = result;
      setScannedValues(prevValues => {
        const newValues = [...prevValues, data];
        console.log('Scanned Values Length:', newValues.length);
        return newValues;
      });
      scanCountRef.current += 1;
      console.log('Current Scan Count:', scanCountRef.current);

      if (scanCountRef.current >= quantity && !alertShown) {
        Alert.alert('Scan Limit Reached', `You can only scan ${quantity} QR codes.`);
        setAlertShown(true);
      } else if (!alertShown) {
        Alert.alert('QR Code Scanned', `Scanned Value: ${data}`);
        setAlertShown(true);
      }

      // Reset the flag after a short delay
      setTimeout(() => {
        scanningInProgress.current = false;
        setAlertShown(false); // Reset alertShown flag to allow showing future alerts
      }, 1000);  // Adjust delay as necessary
    }
  };

  const resetScan = () => {
    setScannedValues([]);
    scanCountRef.current = 0;
    setAlertShown(false);
    scanningInProgress.current = false;  // Reset the scanningInProgress flag
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
      {scannedValues.length > 0 && (
        <View style={styles.resultContainer}>
          <Link href={`/Details?scannedValues=${encodeURIComponent(JSON.stringify(scannedValues))}&qnty=${quantity - scanCountRef.current}`}>
            <Text style={styles.resultText}>Scanned {scannedValues.length} QR codes</Text>
          </Link>
          <Button title="Scan Again" onPress={resetScan} />
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
