import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Alert, Button } from 'react-native';
import { Camera, CameraView, BarcodeScanningResult } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';

const Scanner: React.FC = () => {
  const { qnty, scannedValues: prevScannedValues } = useLocalSearchParams();
  const initialQuantity = qnty ? Number(qnty) : 0;
  const initialScannedValues = prevScannedValues ? JSON.parse(decodeURIComponent(prevScannedValues as string)) : [];

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedValues, setScannedValues] = useState<string[]>(initialScannedValues);
  const [remainingQuantity, setRemainingQuantity] = useState<number>(initialQuantity);

  const router = useRouter();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    const { data } = result;

    if (remainingQuantity > 0) {
      setScannedValues(prevValues => {
        if (!prevValues.includes(data)) {
          const updatedValues = [...prevValues, data];

          
          Alert.alert("Scanned QR Code", `Value: ${data}`);

          
          setRemainingQuantity(prevQuantity => prevQuantity - 1);

          return updatedValues;
        } else {
          console.log('Duplicate scan ignored:', data);
          return prevValues;
        }
      });
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
      {/* Static overlay box */}
      <View style={styles.overlay}>
        <View style={styles.box} />
      </View>
      <View style={styles.footer}>
         {/* Always show the button after a scan, regardless of quantity */}
        {scannedValues.length > 0 && (
          <Button
            title="Go to Details Page"
            onPress={() => {
              router.push(`/Details?scannedValues=${encodeURIComponent(JSON.stringify(scannedValues))}&qnty=${remainingQuantity}`);
            }}
          />
        )}
         {/* Show the Go Back button only if there are no scanned values */}
         {scannedValues.length === 0 && (
          <Button
            title="Go Back"
            onPress={() => {
              router.push(`/Details?scannedValues=${encodeURIComponent(JSON.stringify(scannedValues))}&qnty=${remainingQuantity}`);
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
});

export default Scanner;
