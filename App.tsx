import React, {useState, useEffect} from 'react';
import {
  NativeModules,
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const App: React.FC = () => {
  const [targetLevel, setTargetLevel] = useState<string>('40');
  const [isAlarmSet, setIsAlarmSet] = useState<boolean>(false);
  const [ringtonePath, setRingtonePath] = useState<string>('');

  useEffect(() => {
    const checkBatteryLevel = async () => {
      const batteryLevel = await DeviceInfo.getBatteryLevel();
      const currentLevel = Math.round(batteryLevel * 100);
      if (currentLevel >= parseInt(targetLevel, 10) && isAlarmSet) {
        playAlarmSound();
      }
    };

    const interval = setInterval(() => {
      if (isAlarmSet) {
        checkBatteryLevel();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAlarmSet, targetLevel]);

  const playAlarmSound = () => {
    if (Platform.OS === 'android' && ringtonePath.startsWith('content://')) {
      NativeModules.RingtonePicker.playRingtoneFromUri(ringtonePath);
      console.log('Playing ringtone from URI:', ringtonePath);
    } else {
      console.log('Playing ringtone from file path or default method');
    }
  };

  const stopAlarmSound = () => {
    NativeModules.RingtonePicker.stopRingtone();
  };

  const selectRingtone = () => {
    NativeModules.RingtonePicker.pickRingtone()
      .then((path: any) => {
        setRingtonePath(path);
        console.log('Selected ringtone path:', path);
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const validateAndSetTargetLevel = (value: string) => {
    const intValue = parseInt(value, 10);

    if (isNaN(intValue)) {
      setTargetLevel('');
    } else {
      const clampedValue = Math.min(Math.max(0, intValue), 100).toString();
      setTargetLevel(clampedValue);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alarm Settings</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Choose Ringtone"
          onPress={selectRingtone}
          color="#007AFF"
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Target Battery Level (%):</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Target Battery Level (%)"
          value={targetLevel}
          onChangeText={validateAndSetTargetLevel}
          maxLength={3}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title={isAlarmSet ? 'Deactivate Alarm' : 'Activate Alarm'}
          onPress={() => {
            if (isAlarmSet) {
              stopAlarmSound();
            }
            setIsAlarmSet(!isAlarmSet);
          }}
          color={isAlarmSet ? '#FF3B30' : '#4CD964'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#F5FCFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '80%',
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    backgroundColor: '#FFF',
    color: '#666',
  },
});

export default App;
