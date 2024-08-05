import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import base64 from 'base-64';
import { LinearGradient } from 'expo-linear-gradient';

interface InvoiceData {
  invoiceno: string;
  invoicedate: string;
  invoicestatus: string;
  custcode: string;
  custname: string;
  plantcode: string,
  invoiceitemlist: { itemid: number; itemcode: string; itemdesc: string; qnty: number }[];
}

const InvoiceSearch = () => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleSearch = async () => {
    try {
      console.log('invoiceNumber@@:', invoiceNumber);
      const username = 'miplapp'; 
      const password = 'Miplapp@09876'; 
      const credentials = base64.encode(`${username}:${password}`);

      const response = await fetch(`http://10.255.38.7:8000/dispatchinquiry/dispatchinquiry?sap-client=400&VBELN=${invoiceNumber}&WERKS=1001&APPUSERID=&APPVERSION=%27%27`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('response@@@', JSON.stringify(response));

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('data@@@' + JSON.stringify(data));
      
      const { invoiceno, invoicedate, invoicestatus, custcode, custname, plantcode, invoiceitemlist } = data;
      setInvoiceData({ invoiceno, invoicedate, invoicestatus, custcode, custname, plantcode, invoiceitemlist });
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#ADD8E6', '#325180']} // Light blue to dark blue
      style={styles.container}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={invoiceNumber}
          onChangeText={setInvoiceNumber}
          placeholder="Enter Invoice Number"
        />
        <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
          <Icon name="search" size={30} color="#000" />
        </TouchableOpacity>
      </View>
      {invoiceData && <InvoiceTable data={invoiceData} />}
      {/* Use Link from Expo Router to navigate */}
      <Link href="/SecondScreen" style={styles.link}>
        <Text>Go to Result</Text>
      </Link>
    </LinearGradient>
  );
};

const ProductDetails: React.FC<{ items: { itemid: number; itemcode: string; itemdesc: string; qnty: number }[]; invoiceData: InvoiceData }> = ({ items, invoiceData }) => (
  <LinearGradient
    colors={['#325180', '#203C58']} // Light blue to dark blue
    style={styles.productContainer}
  >
    <Text style={styles.text}>Product Details</Text>
    <View style={styles.tableRow}>
      <Text style={[styles.text, styles.tableHeader]}>Item Code</Text>
      <Text style={[styles.text, styles.tableHeader]}>Description</Text>
      <Text style={[styles.text, styles.tableHeader]}>Quantity</Text>
      <Text style={[styles.text, styles.tableHeader]}>Action</Text>
    </View>
    {items.map(item => (
      <View key={item.itemid} style={styles.tableRow}>
        <Text style={styles.text2}>{item.itemcode}</Text>
        <Text style={styles.text2}>{item.itemdesc}</Text>
        <Text style={styles.text2}>{item.qnty}</Text>
        <Link href={`/Details?qnty=${item.qnty}&data=${encodeURIComponent(JSON.stringify(invoiceData))}`} style={styles.clickHere}>
          <Text>Click Here</Text>
        </Link>
      </View>
    ))}
  </LinearGradient>
);

const InvoiceTable: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <View>
    <LinearGradient
      colors={['#325180', '#203C58']} // Light blue to dark blue
      style={styles.invoiceContainer}
    >
      <View style={styles.innerContainer}>
        <Text style={styles.text}>Invoice Number: {data.invoiceno}</Text>
        <Text style={styles.text}>Date: {data.invoicedate}</Text>
        <Text style={styles.text}>Status: {data.invoicestatus}</Text>
        <Text style={styles.text}>custcode: {data.custcode}</Text>
        <Text style={styles.text}>custname: {data.custname}</Text>
        <Text style={styles.text}>plantcode: {data.plantcode}</Text>
      </View>
    </LinearGradient>
    <ProductDetails items={data.invoiceitemlist} invoiceData={data} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 50,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'black',
    borderWidth: 1,
    paddingHorizontal: 10,
  },
  iconButton: {
    padding: 10,
  },
  invoiceContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  productContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
  },
  innerContainer: {
    marginBottom: 20,
  },
  tableRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
  },
  text2: {
    color: '#FFFFFF',
    fontSize: 9,
  },
  clickHere: {
    color: '#ffcc00',
    fontSize: 10,
    textDecorationLine: 'underline',
  },
});

export default InvoiceSearch;
