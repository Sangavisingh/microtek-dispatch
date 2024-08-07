import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import base64 from 'base-64';

interface InvoiceData {
  invoiceno: string;
  invoicedate: string;
  invoicestatus: string;
  custcode: string;
  custname: string;
  plantcode: string;
  invoiceitemlist: { itemid: number; itemcode: string; itemdesc: string; qnty: number }[];
}

const InvoiceSearch = () => {
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);

  const handleSearch = async () => {
    try {
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

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const { invoiceno, invoicedate, invoicestatus, custcode, custname, plantcode, invoiceitemlist } = data;
      setInvoiceData({ invoiceno, invoicedate, invoicestatus, custcode, custname, plantcode, invoiceitemlist });
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={invoiceNumber}
            onChangeText={setInvoiceNumber}
            placeholder="Enter Invoice Number"
            placeholderTextColor="#000"
          />
          <TouchableOpacity onPress={handleSearch} style={styles.iconButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        {invoiceData && <InvoiceTable data={invoiceData} />}
        <Link href="/SecondScreen" style={styles.link}>
          <Text style={styles.linkText}></Text>
        </Link>
      </ScrollView>
      <View style={styles.footer}>
        <Link href="/" style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </Link>
      </View>
    </View>
  );
};

const ProductDetails: React.FC<{ items: { itemid: number; itemcode: string; itemdesc: string; qnty: number }[]; invoiceData: InvoiceData }> = ({ items, invoiceData }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>Product Details</Text>
    <View style={styles.tableRow}>
      <Text style={[styles.text, styles.tableHeader, styles.itemCode]}>Item Code</Text>
      <Text style={[styles.text, styles.tableHeader, styles.itemDesc]}>Description</Text>
      <Text style={[styles.text, styles.tableHeader, styles.qnty]}>Quantity</Text>
      <Text style={[styles.text, styles.tableHeader, styles.action]}>Action</Text>
    </View>
    {items.map(item => (
      <View key={item.itemid} style={styles.tableRow}>
        <Text style={[styles.text, styles.itemCode]}>{item.itemcode}</Text>
        <Text style={[styles.text, styles.itemDesc]}>{item.itemdesc}</Text>
        <Text style={[styles.text, styles.qnty]}>{item.qnty}</Text>
        <Link href={`/Details?qnty=${item.qnty}&data=${encodeURIComponent(JSON.stringify(invoiceData))}`} style={styles.link}>
          <Text style={styles.clickHere}>Click Here</Text>
        </Link>
      </View>
    ))}
  </View>
);

const InvoiceTable: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <View>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Invoice Information</Text>
      <Text style={styles.text}>Invoice Number: {data.invoiceno}</Text>
      <Text style={styles.text}>Date: {data.invoicedate}</Text>
      <Text style={styles.text}>Status: {data.invoicestatus}</Text>
      <Text style={styles.text}>Customer Code: {data.custcode}</Text>
      <Text style={styles.text}>Customer Name: {data.custname}</Text>
      <Text style={styles.text}>Plant Code: {data.plantcode}</Text>
    </View>
    <ProductDetails items={data.invoiceitemlist} invoiceData={data} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#fce7f3',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'transparent',
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  iconButton: {
    padding: 5,
  },
  card: {
    backgroundColor: '#000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    paddingVertical: 8,
  },
  tableHeader: {
    fontWeight: 'bold',
  },
  text: {
    color: '#fff',
  },
  itemCode: {
    flex: 1,
    textAlign: 'left',
  },
  itemDesc: {
    flex: 2,
    marginLeft: 6,
    textAlign: 'left',
  },
  qnty: {
    flex: 1,
    marginRight: 20,
    textAlign: 'center',
  },
  action: {
    flex: 1,
    textAlign: 'center',
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
  clickHere: {
    color: '#0000ff',
    textDecorationLine: 'underline',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    alignItems: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  logoutButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default InvoiceSearch;
