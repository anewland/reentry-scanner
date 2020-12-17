import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';

export default class BarcodeScanner extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
  };

  async componentDidMount() {
    this.getPermissionsAsync();
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  getCurrentDate = () => {
    let date = new Date().getDate();
    let month = new Date().getMonth();
    let year = new Date().getFullYear();
    let m = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return m[month] + ' ' + date + ', ' + year;
  }

  render() {
    if (hasPermission === null) {
      return <><View style={styles.container}><Text>Requesting for camera permission</Text></View></>;
    }
    if (hasPermission === false) {
      return <><View style={styles.container}><Text>No access to camera</Text></View></>;
    }

    return (
      <>
        <StatusBar hidden />
        <View style={styles.header}>
          <Image source={require('./assets/usa-logo.png')} style={styles.logo} />
          <Image source={require('./assets/settings.png')} style={styles.settings} />
        </View>

        <View style={styles.container}>
          <View style={styles.scannerCont}>
            <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} style={StyleSheet.absoluteFillObject} />
            {/* <View style={styles.scanner} /> */}

            {scanned && (
              <Button
                title={'Tap to Scan Again'}
                onPress={() => this.setState({ scanned: false })}
              />
            )}
          </View>

          <View style={styles.copyCont}>
            <Text style={styles.titleText}>USAHS Health Screening</Text>
            <Text style={styles.paraText}>Scan your QR Code you recieved from the Reentry Form for today. If you did not get a QR Code, please visit <Text style={styles.teal}>https://reenty.usa.edu</Text> and fill out the questionaire.</Text>
            <Text style={styles.paraTextBOLD}>Campus:{"\n"} <Text style={styles.teal}>St. Augustine</Text></Text>
            <Text style={styles.paraTextBOLD}>Todays Date:{"\n"} <Text style={styles.teal}>{ getCurrentDate() }</Text></Text>
          </View>
        </View>
      </>
    );
  }

  handleBarCodeScanned = ({ type, data }) => {
    this.setState({ scanned: true });
    alert(`Bar code with type ${type} and data ${data} has been scanned!`);
  };
}

const styles = StyleSheet.create({
  header: {
    flex: 1,
    padding: 0,
    margin: 0,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#00677f',
    color: '#ffffff'
  },
  logo: {
    height: '100%'
  },
  settings: {
    position: 'absolute',
    right: 12,
    top: 12,
    height: 30,
    width: 30,
    opacity: 0.5
  },
  container: {
    flex: 5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: "Cochin"
  },
  scannerCont: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    width: '50%'
  },
  copyCont: {
    flex: 1,
    height: '100%',
    width: '50%',
    backgroundColor: '#eee',
    flexDirection: 'column',
    justifyContent: 'space-around',
    padding: '8%'
  },
  titleText: {
    textTransform: 'uppercase',
    fontSize: 50,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  paraText: {
    color: 'black',
    textAlign: 'center',
    fontSize: 22,
  },
  paraTextBOLD: {
    color: 'black',
    textAlign: 'center',
    fontSize: 22,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  teal: {
    color: '#00677f',
    textTransform: 'none',
  },
  scanner : {
    width: 400,
    height: 400,
    zIndex: 10000,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: 'black'
  }
});