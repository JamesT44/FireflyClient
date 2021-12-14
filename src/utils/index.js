import moment from 'moment';
import { CustomTabs } from 'react-native-custom-tabs';

export const momentFormats = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'DD/MM/YYYY',
};

export const momentLongFormats = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'ddd Do MMM YYYY',
};

export const momentDateTimeFormats = {
  sameDay: '[Today,] HH:mm',
  nextDay: '[Tomorrow,] HH:mm',
  nextWeek: 'ddd[,] HH:mm',
  lastDay: '[Yesterday,] HH:mm',
  lastWeek: '[Last] ddd[,] HH:mm',
  sameElse: 'DD/MM/YY[,] HH:mm',
};

export const momentLongXFormats = {
  sameDay: '[Today]',
  nextDay: '[Tomorrow]',
  nextWeek: 'dddd[X]',
  lastDay: '[Yesterday]',
  lastWeek: '[Last] dddd',
  sameElse: 'ddd Do MMM YYYY[X]',
};

export const isTaskDone = (task) => {
  if (task.archived) {
    return true;
  }
  const doneStatusEvents = task.recipientsResponses[0].responses.filter(
    (event) => event.eventType.startsWith('mark-as'),
  );
  return (
    doneStatusEvents.length &&
    doneStatusEvents.reduce((eventA, eventB) =>
      moment(eventA.releasedTimestamp).isAfter(moment(eventB.releasedTimestamp))
        ? eventA
        : eventB,
    ).eventType === 'mark-as-done'
  );
};

export const getTaskGrades = (task) => {
  const res = [];
  task.recipientsResponses[0].responses.map((event) => {
    if (event.eventType === 'mark-and-grade') {
      if (event.mark) {
        res.push(
          `${event.mark}/${
            event.taskAssessmentDetails.assessmentMarkMax || event.outOf || '-'
          }`,
        );
      }
      if (event.grade) {
        res.push(event.grade);
      }
    }
  });

  return res;
};

export const copyDate = (date) =>
  date instanceof Date ? new Date(date.valueOf()) : date;

export const presetDateranges = {
  All: ['', ''],
  Past: ['', moment().subtract(1, 'day').startOf('day').toDate()],
  'Last Week': [
    moment().startOf('isoWeek').subtract(1, 'isoWeek').toDate(),
    moment().startOf('isoWeek').subtract(1, 'day').toDate(),
  ],
  Today: [moment().startOf('day').toDate(), moment().startOf('day').toDate()],
  Tomorrow: [
    moment().add(1, 'day').startOf('day').toDate(),
    moment().add(1, 'day').startOf('day').toDate(),
  ],
  'This Week': [
    moment().startOf('isoWeek').toDate(),
    moment().startOf('isoWeek').add(1, 'isoWeek').toDate(),
  ],
  Future: [moment().startOf('day').toDate(), ''],
};

export const openCustomTab = (tokenUrl) => {
  console.log(`Launching browser with url: ${tokenUrl}`);

  CustomTabs.openURL(tokenUrl, {
    enableUrlBarHiding: true,
    showPageTitle: true,
  })
    .then((launched) => {
      console.log(`Browser launch ${launched ? 'successful' : 'failed'}`);
    })
    .catch((err) => {
      console.warn(err);
    });
};
