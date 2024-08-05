import React, { useState ,useEffect} from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useLocalSearchParams, useRouter, Link } from 'expo-router';
import base64 from 'base-64';
import Toast from 'react-native-root-toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InvoiceItemSerialNumber {
  itemsrid: number;
  itemid: number;
  serialno: string;
}

interface InvoiceItem {
  itemid: number;
  itemcode: string;
  itemdesc: string;
  qnty: number;
  invoiceitemserialnumber?: InvoiceItemSerialNumber[];
}

interface InvoiceData {
  invoiceno: string;
  plantcode?: string;
  appuserid?: string;
  appversion?: string;
  invoicedate?: string; 
  invoicestatus?: string; 
  custcode?: string;
  custname?: string;
  invoiceitemlist: InvoiceItem[];
}

const Details: React.FC = () => {
  const { scannedValues, qnty, data: encodedData } = useLocalSearchParams();
  console.log('Scanned Values:', scannedValues);
  console.log('Quantity:', qnty);
  console.log('Encoded Data:', encodedData);
  const [immutableData, setImmutableData] = useState<string | string[] | null>(null);

  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const initialQuantity = qnty ? Number(qnty) : 0;
  const [quantity, setQuantity] = useState(initialQuantity);
  const [scannedArray, setScannedArray] = useState<string[]>(scannedValues ? JSON.parse(decodeURIComponent(scannedValues as string)) : []);
  const [validationStatus, setValidationStatus] = useState<Record<number, boolean>>({});
  const [showSubmit, setShowSubmit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (encodedData) {
          const data = Array.isArray(encodedData) ? encodedData[0] : encodedData;
          setImmutableData(data);
          await AsyncStorage.setItem('encodedData', data);
          const decodedData = decodeURIComponent(data);
          const parsedData: InvoiceData = JSON.parse(decodedData);
          setInvoiceData(parsedData);
        } else {
          const storedData = await AsyncStorage.getItem('encodedData');
          if (storedData) {
            setImmutableData(storedData);
            const decodedData = decodeURIComponent(storedData);
            const parsedData: InvoiceData = JSON.parse(decodedData);
            setInvoiceData(parsedData);
          }
        }
      } catch (error) {
        console.error('Error retrieving or setting encodedData from AsyncStorage:', error);
      }
    };
    fetchData();
  }, [encodedData]);
  console.log('after page change::'+encodedData);
  console.log('immutableData::'+immutableData);

  
   useEffect(() => {
    if (invoiceData) {
      console.log('Invoice Number:', invoiceData.invoiceno);
    } else {
      console.log('Invoice Data is not available yet.');
    }
  }, [invoiceData]);
  
  // Decode and parse the data directly
  //if (encodedData && !invoiceData) {
    //try {
     // const decodedData = decodeURIComponent(encodedData as string);
      //const parsedData: InvoiceData = JSON.parse(decodedData);
     // setInvoiceData(parsedData);
   // } catch (error) {
     // console.error('Error decoding invoice data:', error);
   // }
  //}

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
    
    if (!invoiceData) {
      console.error('Invoice data is not available.');
      return;
    }

     try {
      const username = 'miplapp'; 
      const password = 'Miplapp@09876'; 
      const credentials = base64.encode(`${username}:${password}`);

      const payload = {
        invoiceno: invoiceData.invoiceno,
        PlantCode: invoiceData.plantcode,
        AppUserid: "", 
        Appversion: "%27%27", 
        invoiceitemlist: invoiceData.invoiceitemlist.map(item => ({
          itemid: item.itemid,
          itemcode: item.itemcode,
          itemdesc: item.itemdesc,
          qnty: item.qnty,
          invoiceitemserialnumber: scannedArray.map((serialno, index) => ({
            itemsrid: index + 1,
            itemid: item.itemid,
            serialno: extractSerialNumber(serialno),
          }))
        })),
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
  
  const createPayload = (invoiceData: InvoiceData, scannedValues: string[]) => {
    if (!invoiceData) {
      throw new Error('Invoice data is not available.');
    }
  
    // Generate serial number list from scanned values
    const serialNumbers = scannedValues.map((serialno, index) => ({
      itemsrid: index + 1,
      itemid: invoiceData.invoiceitemlist[0].itemid, // Assuming single item in list
      serialno: extractSerialNumber(serialno),
      status: "0", // Placeholder status
      statusdesc: "" // Placeholder status description
    }));
  
    // Construct payload
    const payload = {
      invoiceno: invoiceData.invoiceno,
      appuserid: invoiceData.appuserid ,
      appversion: invoiceData.appversion || "%27%27",
      plantcode: invoiceData.plantcode ,
      custcode: invoiceData.custcode ,
      custname: invoiceData.custname ,
      invoicedate: invoiceData.invoicedate ,
      invoicestatus: invoiceData.invoicestatus,
      invoiceitemlist: [
        {
          itemid: invoiceData.invoiceitemlist[0].itemid,
          itemcode: invoiceData.invoiceitemlist[0].itemcode,
          itemdesc: invoiceData.invoiceitemlist[0].itemdesc,
          qnty: invoiceData.invoiceitemlist[0].qnty,
          invoiceitemserialnumber: serialNumbers
        }
      ]
    };
  
    return payload;
  };

  const handleSubmit = async () => {
    try {
      const username = 'miplapp'; 
      const password = 'Miplapp@09876'; 
      const credentials = base64.encode(`${username}:${password}`);

      if (!invoiceData) {
        console.error('Invoice data is not available.');
        return;
      }
  
      const payload = createPayload(invoiceData, scannedArray);
      const jsonString1 = JSON.stringify(payload);
      console.log('Submit Payload:', jsonString1);

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
        console.log('typeid::' + typeid);
        const status = result.status;
        console.log('status:' + status);

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
          <Text style={styles.noScanText}>.</Text>
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
                  invoiceData: encodeURIComponent(JSON.stringify(invoiceData)),
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
    backgroundColor: '#000000',
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
