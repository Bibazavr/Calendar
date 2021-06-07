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
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import RNCalendarEvents, {
  CalendarOptions,
  Calendar,
} from 'react-native-calendar-events';
import dayjs from 'dayjs';

const Section: React.FC<{
  title: string;
}> = ({children, title}) => {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
};

const calendar: CalendarOptions = {
  accessLevel: 'root',
  color: 'purple',
  entityType: 'reminder',
  name: 'work',
  ownerAccount: 'Bibazavr',
  source: {name: 'Bibazavr', isLocalAccount: true},
  title: 'work',
};

const saveCalendar = () => {
  RNCalendarEvents.saveCalendar(calendar).then(r => {
    console.log('saveCalendar', r);
  });
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

type IWorkEvent = 'day' | 'night' | 'sleep' | 'weekend';

const detectDate = (calendarId?: string, today: IWorkEvent = 'day') => {
  if (!calendarId) {
    return;
  }
  let now = dayjs().format('YYYY-MM-DD');

  let nextEvent: IWorkEvent = today;
  for (let i = 0; i < 24; i++) {
    const morning = dayjs(now).add(8, 'hour').toISOString();
    const evening = dayjs(now).add(20, 'hour').toISOString();
    switch (nextEvent) {
      case 'day': {
        saveEvent(calendarId, morning, evening);
        nextEvent = 'night';
        break;
      }
      case 'night':
        saveEvent(calendarId, evening, morning);
        nextEvent = 'sleep';
        break;
      case 'sleep':
        nextEvent = 'weekend';
        break;
      case 'weekend':
        nextEvent = 'day';
        break;
      default:
        break;
    }
    now = dayjs(now).add(1, 'day').format('YYYY-MM-DD');
  }
};

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const [lastCalendar, setLastCalendar] = useState<Calendar | null>(null);

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  useEffect(() => {
    RNCalendarEvents.checkPermissions().then(r => {
      console.log('checkPermissions', r);
    });

    RNCalendarEvents.findCalendars().then(r => {
      console.log('findCalendars', r);
      setLastCalendar(r[r.length - 1]);
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
            onPress={() => detectDate(lastCalendar?.id)}
          />
          <Button
            title={'delete calendar'}
            onPress={() => {
              deleteCalendar(lastCalendar?.id);
              setLastCalendar(null);
            }}
          />
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
