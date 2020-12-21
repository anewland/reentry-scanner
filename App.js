import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
// import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import axios from 'axios';
import Moment from 'moment';

export default class BarcodeScanner extends React.Component {
  state = {
    hasCameraPermission: null, setup: false, scanned: false, access: null, isToday: null, campus: 'Select Campus in Settings'
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

  // isToday = ( someDate ) => {
  //   const today = new Date();

  //   console.log(today);
  //   var offset = new Date().getTimezoneOffset();
  //   console.log(offset);

  //   let sd = someDate.split(' ');
  //   let nd = sd[0].split('-');
  //   const eM = new Date(sd[0]).getMonth();
  //   const eY = new Date(sd[0]).getFullYear();

  //   return nd[2] === today.getDate() &&
  //     eM === today.getMonth() &&
  //     eY === today.getFullYear();
  // }

  isToday = ( someDate ) => {
    let today = Moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
    let es = someDate.split(' ')[0];
    let ts = today.split(' ')[0];
    let e = es.split('-');
    let t = ts.split('-');

    return e[0] === t[0] &&
      e[1] === t[1] &&
      e[2] === t[2];
  }

  handleBarCodeScanned = ({ data }) => {
    console.log('======= NEW SCAN =======');
    this.setState({ scanned: true });
    let email, qrcode, date, self = this;

    setTimeout(() => {
      axios.get('https://reentryapi.usa.edu/form/'+{ data }['data'], {
      })
      .then(function (response) {
        // console.log(response.data[0]);
        date = response.data[0].date;
        qrcode = response.data[0].qrcode;
        email = response.data[0].email;

        // QR code is from today
        if (self.isToday(date)) {
          self.setState({ isToday: true });
          self.scanSuccess(qrcode, email, self.state.campus);

          const timer = setTimeout(() => {
            self.setState({ scanned: false, isToday: null });
          }, 5000);  //reset back to 5 seconds when ready
          return () => clearTimeout(timer);

        // QR code is not from today and entry is denied
        } else {
          self.setState({ isToday: false });
        }
      })
      .catch(function (error) {
        console.log(error);
      });
    }, 50);
  };

  scanSuccess = ( qrcode, email, campus ) => {
    axios.post('https://reentryapi.usa.edu/scan/create/', {
      qrcode: { qrcode },
      email: { email },
      campus: { campus },
      barrier: 'entry'
    })
    .then(function (response) {
      console.log(response);
    })
    .catch(function (error) {
      console.log(error);
    });
  }

  render() {
    const { hasCameraPermission, setup, scanned, isToday, campus } = this.state;

    if (hasCameraPermission === null) {
      return <><View style={styles.container}><Text>Requesting for camera permission</Text></View></>;
    }
    if (hasCameraPermission === false) {
      return <><View style={styles.container}><Text>No access to camera</Text></View></>;
    }

    return (
      <>
        <StatusBar hidden />
        <View style={styles.header}>
          <Image source={require('./assets/usa-logo.png')} style={styles.logo} />

          <TouchableOpacity style={styles.settingsCont} onPress={() => this.setState({ setup: true })}>
            <Image source={require('./assets/settings.png')} style={styles.settings} />
          </TouchableOpacity>
        </View>

        <View style={styles.container}>
          <View style={styles.scannerCont}>
            {campus != 'Select Campus in Settings' && (
              <View style={styles.scanner}>
                <BarCodeScanner type='front' onBarCodeScanned={ scanned ? undefined : this.handleBarCodeScanned } style={ StyleSheet.absoluteFillObject } />
              </View>
            )}
          </View>

          <View style={styles.copyCont}>
            <Text style={styles.titleText}>USAHS Health Screening</Text>
            <Text style={styles.paraText}>Scan your QR Code you recieved from the Reentry Form for today. If you did not get a QR Code, please visit <Text style={styles.teal}>https://reenty.usa.edu</Text> and fill out the questionaire.</Text>
            <Text style={styles.paraTextBOLD}>Campus:{"\n"} <Text style={styles.teal}>{ campus }</Text></Text>
            <Text style={styles.paraTextBOLD}>Today is:{"\n"} <Text style={styles.teal}>{ this.getCurrentDate() }</Text></Text>
          </View>
        </View>

        {/* {setup && ( */}
          <View style={styles.message}>
            <View style={[styles.messageInner, styles.setup]}>
              <Text style={styles.messageText}>SELECT CAMPUS</Text>
              <Button style={styles.btn} title={'Austin Campus'} onPress={() => this.setState({ setup: false, campus: 'Austin' })} />
              <Button style={styles.btn} title={'Dallas Campus'} onPress={() => this.setState({ setup: false, campus: 'Dallas' })} />
              <Button style={styles.btn} title={'Miami Campus'} onPress={() => this.setState({ setup: false, campus: 'Miami' })} />
              <Button style={styles.btn} title={'San Marcos Campus'} onPress={() => this.setState({ setup: false, campus: 'San Marcos' })} />
              <Button style={styles.btn} title={'St. Augustine Campus'} onPress={() => this.setState({ setup: false, campus: 'St. Augustine' })} />
            </View>
          </View>
        {/* )} */}

        {scanned && (isToday === true) && (
          <View style={styles.message}>
            <View style={[styles.messageInner, styles.pass]}>
              <Image source={require('./assets/success.png')} style={styles.successImg} />
              <Text style={styles.messageText}>Access Granted</Text>
              <Text style={styles.messageText}>Have a Great Day and remember to scan out when leaving campus.</Text>
            </View>
          </View>
        )}

        {scanned && (isToday === false) && (
          <View style={styles.message}>
            <View style={[styles.messageInner, styles.fail]}>
              <TouchableOpacity onPress={() => this.setState({ scanned: false, isToday: null })}>
                <Image source={require('./assets/fail.png')} style={styles.failImg} />
              </TouchableOpacity>
              <Text style={styles.messageText}>ERROR!</Text>
              <Text style={styles.messageText}>Your QRCode is not valid. Please verify that it is dated today. If not, please visit <Text style={styles.paraTextBOLD}>reenty.usa.edu</Text> and submit the Daily Questionaire.</Text>
            </View>
          </View>
        )}
      </>
    );
  }
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
  settingsCont: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  settings: {
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
    fontSize: 20,
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
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'black',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  message: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10000,
    height: '100%',
    width: '100%',
    padding: '20%',
    backgroundColor: 'rgba(256,256,256,.9)',
  },
  messageInner: {
    height: '100%',
    padding: '10%',
    borderRadius: 10,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  fail: {
    backgroundColor: '#f26051'
  },
  pass: {
    backgroundColor: '#20da9b'
  },
  setup: {
    backgroundColor: '#c0c0c0'
  },
  messageText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 22,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  btn: {
    backgroundColor: '#ffffff',
    color: '#000000',

  }
});