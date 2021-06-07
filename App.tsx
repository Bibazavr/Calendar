/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import {
  Button,
  Picker,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

import RNCalendarEvents, {
  CalendarOptions,
  Calendar,
} from 'react-native-calendar-events';
import dayjs from 'dayjs';

const calendar: CalendarOptions = {
  accessLevel: 'root',
  color: 'purple',
  entityType: 'reminder',
  name: 'work',
  ownerAccount: 'Bibazavr',
  source: {name: 'Bibazavr', isLocalAccount: true},
  title: 'work',
};

const deleteCalendar = (id?: string) => {
  id &&
    RNCalendarEvents.removeCalendar(id).then(r => {
      console.log('deleteCalendar', r);
    });
};

const saveEvent = (calendarId: string, startData: string, endData: string) => {
  RNCalendarEvents.saveEvent('Work', {
    calendarId: calendarId,
    startDate: startData,
    endDate: endData,
  }).then(r => {
    console.log('saveEvent', r);
  });
};

enum STRINGS {
  day = 'day',
  night = 'night',
  sleep = 'sleep',
  weekend = 'weekend',
}

type IWorkEvent = STRINGS.day | STRINGS.night | STRINGS.sleep | STRINGS.weekend;

const detectDate = (
  calendarId: string,
  daysCount: number,
  today: IWorkEvent = STRINGS.day,
) => {
  if (!calendarId) {
    return;
  }
  let now = dayjs().format('YYYY-MM-DD');

  let nextEvent: IWorkEvent = today;
  for (let i = 0; i < daysCount; i++) {
    const morning = dayjs(now).add(8, 'hour').toISOString();
    const evening = dayjs(now).add(20, 'hour').toISOString();
    switch (nextEvent) {
      case 'day': {
        saveEvent(calendarId, morning, evening);
        nextEvent = STRINGS.night;
        break;
      }
      case 'night':
        saveEvent(calendarId, evening, morning);
        nextEvent = STRINGS.sleep;
        break;
      case 'sleep':
        nextEvent = STRINGS.weekend;
        break;
      case 'weekend':
        nextEvent = STRINGS.day;
        break;
      default:
        break;
    }
    now = dayjs(now).add(1, 'day').format('YYYY-MM-DD');
  }
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  const [lastCalendar, setLastCalendar] = useState<Calendar | null>(null);
  const [days, setDays] = useState('20');
  const [today, setToday] = useState(STRINGS.day);

  const allGood = lastCalendar?.source === 'Bibazavr';

  useEffect(() => {
    const loading = async () => {
      const permission = await RNCalendarEvents.checkPermissions();

      if (permission !== 'authorized') {
        await RNCalendarEvents.requestPermissions();
      }

      RNCalendarEvents.findCalendars().then(r => {
        console.log('findCalendars', r);
        setLastCalendar(r[r.length - 1]);
      });
    };

    loading().then(r => {
      console.log('loading done', r);
    });
  }, []);

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>{JSON.stringify(lastCalendar)}</Text>
          <Button
            title={'save calendar'}
            disabled={allGood}
            onPress={() => {
              RNCalendarEvents.saveCalendar(calendar).then(r => {
                console.log('saveCalendar', r);
                RNCalendarEvents.findCalendars().then(find => {
                  console.log('findCalendars', find);
                  setLastCalendar(find[find.length - 1]);
                });
              });
            }}
          />
          <Button
            title={'save event'}
            disabled={!allGood}
            onPress={() => {
              lastCalendar && detectDate(lastCalendar.id, ~~days, today);
            }}
          />
          <Button
            title={'delete calendar'}
            disabled={!allGood}
            onPress={() => {
              deleteCalendar(lastCalendar?.id);
              setLastCalendar(null);
            }}
          />
          <Text>На какое количество дней добавлять:</Text>
          <TextInput
            value={days}
            keyboardType={'numeric'}
            onChangeText={setDays}
          />
          <Text>Сегодня день, ночь, отсыпной или выходной?</Text>
          <Picker
            onValueChange={itemValue => {
              setToday(itemValue);
            }}
            selectedValue={today}>
            <Picker.Item label={'день'} value={STRINGS.day} />
            <Picker.Item label={'ночь'} value={STRINGS.night} />
            <Picker.Item label={'отсыпной'} value={STRINGS.sleep} />
            <Picker.Item label={'выходной'} value={STRINGS.weekend} />
          </Picker>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
