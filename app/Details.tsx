import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import base64 from 'base-64';
import Toast from 'react-native-root-toast';

const Details: React.FC = () => {
  const { scannedValues, qnty } = useLocalSearchParams();
  const initialQuantity = qnty ? Number(qnty) : 0;
  const [quantity, setQuantity] = useState(initialQuantity);
  const [scannedArray, setScannedArray] = useState<string[]>(scannedValues ? JSON.parse(decodeURIComponent(scannedValues as string)) : []);
  const [validationStatus, setValidationStatus] = useState<Record<number, boolean>>({});
  const [showSubmit, setShowSubmit] = useState(false);

  const router = useRouter();

  const extractSerialNumber = (qrCodeData: string) => {
    const urlMatch = qrCodeData.match(/i=([^&]+)/);
    if (urlMatch) {
      return urlMatch[1];
    }

    const parts = qrCodeData.split('/');
    return parts.pop() || qrCodeData;
  };

  const serialNumbers = scannedArray.map((value: string) => extractSerialNumber(value));

  const validateAll = async () => {
    try {
      const username = 'miplapp'; 
      const password = 'Miplapp@09876'; 
      const credentials = base64.encode(`${username}:${password}`);

      const payload = {
        invoiceno: "9290000000",
        plantcode: "1076",
        appuserid: '',
        appversion: "%27%27",
        invoiceitemlist: [
          {
            itemid: 10,
            itemcode: '899-D10-9000',
            itemdesc: 'UPS EB 900',
            qnty: 2,
            invoiceitemserialnumber: serialNumbers.map((sn, index) => ({
              itemsrid: index + 1,
              itemid: 10,
              serialno: sn
            }))
          }
        ]
      };
      const jsonString = JSON.stringify(payload);
      console.log(jsonString);

      const response = await fetch(`http://10.255.38.7:8000/srnovalid/srnovalid?sap-client=400`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: jsonString
      });

      const text = await response.text();

      if (response.ok) {
        const result = JSON.parse(text);
        console.log('result::' + JSON.stringify(result));
        const newStatus = result.invoiceitemlist[0].invoiceitemserialnumber.reduce(
          (acc: Record<number, boolean>, item: { status: string }, index: number) => {
            acc[index] = item.status === "0";
            return acc;
          },
          {} as Record<number, boolean>
        );

        setValidationStatus(newStatus);
        setShowSubmit(true);
      } else {
        console.error('Non-JSON response:', text);
      }

    } catch (error) {
      console.error('Error validating serial numbers:', error);
    }
  };

  const handleClearAll = () => {
    setQuantity(initialQuantity);
    setScannedArray([]);
    setValidationStatus({});
    setShowSubmit(false);
  };

  const handleSubmit = async () => {
    try {
      const username = 'miplapp'; 
      const password = 'Miplapp@09876'; 
      const credentials = base64.encode(`${username}:${password}`);
  
      const payload = {
        invoiceno: "9290000000",
        appuserid: "",
        appversion: "''",
        plantcode: "1076",
        custcode: "0001000180",
        custname: "Gupta Electronics",
        invoicedate: "30.07.2024 17:32:10",
        invoicestatus: "Approved",
        invoiceitemlist: [
          {
            itemid: 10,
            itemcode: "899-D10-9000",
            itemdesc: "UPS EB 900",
            qnty: 2,
            invoiceitemserialnumber: serialNumbers.map((sn, index) => ({
              itemsrid: index + 1,
              itemid: 10,
              serialno: sn,
              status: "0",
              statusdesc: ""
            }))
          }
        ]
      };
  
      const jsonString1 = JSON.stringify(payload);
      console.log('Payload:', jsonString1);
  
      const response = await fetch(`http://10.255.38.7:8000/finalresub/finalresub?sap-client=400`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json',
        },
        body: jsonString1
      });
  
      const text = await response.text();
  
      if (response.ok) {
        const result = JSON.parse(text);
        console.log('Result@@', result);
  
        const typeid = result.typeid;
        console.log('typeid::'+typeid);
        const status = result.status;
        console.log('status:'+status);
  
        if (typeid === "0" || typeid === "1") {
          Toast.show(status, {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });
           
        setTimeout(() => {
          router.push('/InvoiceSearchResult');
        }, 1500); 
        
        } else {
          Toast.show('Submission failed', {
            duration: Toast.durations.LONG,
            position: Toast.positions.BOTTOM,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,
          });
        }
      } else {
        console.error('Non-JSON response:', text);
        Toast.show('Submission failed', {
          duration: Toast.durations.LONG,
          position: Toast.positions.BOTTOM,
          shadow: true,
          animation: true,
          hideOnPress: true,
          delay: 0,
        });
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      Toast.show('Submission failed', {
        duration: Toast.durations.LONG,
        position: Toast.positions.BOTTOM,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    }
  };
  

  const resultItemStyle = (index: number) => ({
    marginBottom: 5,
    padding: 15,
    backgroundColor: validationStatus[index] === true ? 'green' : validationStatus[index] === false ? 'red' : '#325180',
    borderRadius: 8,
  });

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button
            title="Validate All"
            color="#ffffff"
            onPress={validateAll}
          />
        </View>
        <View style={styles.buttonWrapper}>
          <Link
            href="/InvoiceSearchResult" 
            style={styles.linkButton}
          >
            Clear All
          </Link>
        </View>
      </View>

      <View style={styles.resultsContainer}>
        {serialNumbers.length > 0 ? (
          serialNumbers.map((value: string, index: number) => (
            <View key={index} style={resultItemStyle(index)}>
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
                  qnty: quantity, 
                  scannedValues: encodeURIComponent(JSON.stringify(scannedArray))
                }
              });
            }}
          />
        ) : (
          <Text style={styles.qntyText}>No more scans needed</Text>
        )}
      </View>

      {showSubmit && (
        <View style={styles.submitContainer}>
          <Button title="Submit" onPress={handleSubmit} />
        </View>
      )}
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
    marginBottom: 450,
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
  linkButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    color: '#ffffff',
    textAlign: 'center',
  },
  submitContainer: {
    padding: 10,
    alignItems: 'center',
  },
});

export default Details;
