import axios from 'axios';
import { parse } from 'fast-xml-parser';
import { Buffer } from 'buffer';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';

import { isTaskDone } from '_utils';

export const getHostname = (schoolCode) =>
  new Promise((resolve, reject) => {
    axios
      .get(
        `https://appgateway.fireflysolutions.co.uk/appgateway/school/${schoolCode}`,
      )
      .then((response) => {
        try {
          response = parse(response.data);
        } catch (err) {
          return reject(err);
        }

        if (!response.response || response.response['@_exists'] === 'false') {
          return resolve(null);
        }

        return resolve(response.response.address);
      })
      .catch((err) => reject(err));
  });

export const getTokenUrl = ({ hostname, deviceId }) =>
  `https://${hostname}/login/api/loginui?app_id=android_tasks&device_id=${deviceId}`;

export const verifyToken = ({ hostname, deviceId, token }) =>
  new Promise((resolve, reject) => {
    axios
      .get(
        `https://${hostname}/login/api/verifytoken?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
      )
      .then((response) => {
        return resolve(response.data.valid);
      })
      .catch((err) => {
        reject(err);
      });
  });

export const getUserData = ({ hostname, deviceId, token }) =>
  new Promise((resolve, reject) => {
    axios
      .get(
        `https://${hostname}/login/api/sso?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
      )
      .then((response) => {
        try {
          response = parse(response.data, { ignoreAttributes: false }).sso.user;
        } catch (err) {
          return reject(err);
        }

        return resolve({
          name: response['@_name'],
          username: response['@_username'],
          guid: response['@_identifier'],
        });
      })
      .catch((err) => {
        reject(err);
      });
  });

export const getProfilePic = ({
  hostname,
  deviceId,
  token,
  userData: { guid },
}) =>
  new Promise((resolve, reject) => {
    axios
      .get(
        `https://${hostname}/profilepic.aspx?pa=on&size=medium&guid=${guid}&ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
        {
          responseType: 'arraybuffer',
        },
      )
      .then((response) =>
        resolve(
          'data:image/jpeg;base64,' +
            Buffer.from(response.data, 'binary').toString('base64'),
        ),
      )
      .catch((err) => reject(err));
  });

export const getNewTaskIds = (
  { hostname, deviceId, token },
  sinceTime = moment(0),
) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `https://${hostname}/api/v2/apps/tasks/ids/filterby?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
        { watermark: sinceTime.toISOString() },
      )
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });

export const getTasks = (
  { hostname, deviceId, token },
  ids,
  idsLengthLimit = 50,
) => {
  if (ids.length > idsLengthLimit) {
    const chunks = [];
    for (let i = 0; i < ids.length; i += idsLengthLimit) {
      chunks.push(ids.slice(i, i + idsLengthLimit));
    }
    return new Promise((resolve, reject) => {
      Promise.all(
        chunks.map((chunk) =>
          getTasks({ hostname, deviceId, token }, chunk, idsLengthLimit),
        ),
      )
        .then((response) => resolve(response.flat()))
        .catch((err) => reject(err));
    });
  }
  if (ids.length === 0) {
    return [];
  }

  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://${hostname}/api/v2/apps/tasks/byIds?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
        { ids },
      )
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

export const getTaskUrl = ({ hostname, deviceId, token }, id) =>
  `https://${hostname}/set-tasks/${id}?ffauth_device_id=${deviceId}&ffauth_secret=${token}`;

export const getPageUrl = ({ hostname, deviceId, token }, id) =>
  `https://${hostname}/page.aspx?id=${id}&ffauth_device_id=${deviceId}&ffauth_secret=${token}`;

export const getDescriptionUrl = ({ hostname, deviceId, token }, pageUrl) =>
  `https://${hostname}/${pageUrl}&ffauth_device_id=${deviceId}&ffauth_secret=${token}`;

export const getTaskAttachment = async (
  { hostname, deviceId, token },
  id,
  { resourceId, fileName, fileType },
) => {
  const dirs = RNFetchBlob.fs.dirs;
  return RNFetchBlob.config({
    addAndroidDownloads: {
      useDownloadManager: true,
      title: fileName,
      description: 'Attachment downloaded by Firefly Client.',
      mime: fileType,
      mediaScannable: true,
      notification: true,
      path: dirs.DownloadDir + '/' + fileName,
    },
  }).fetch(
    'GET',
    `https://${hostname}/_api/1.0/tasks/${id}/attachments/${resourceId}?released=yes&ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
  );
};

export const getTaskFile = async (
  { hostname, deviceId, token },
  eventGuid,
  { resourceId, fileName, fileType },
) => {
  const dirs = RNFetchBlob.fs.dirs;
  return RNFetchBlob.config({
    addAndroidDownloads: {
      useDownloadManager: true,
      title: fileName,
      description: 'Attachment downloaded by Firefly Client.',
      mime: fileType,
      mediaScannable: true,
      notification: true,
      path: dirs.DownloadDir + '/' + fileName,
    },
  }).fetch(
    'GET',
    `https://${hostname}/_api/1.0/tasks/responses/${eventGuid}/latest/files/${resourceId}?released=yes&ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
  );
};

export const setTaskDoneStatus = (
  { hostname, deviceId, token, userData: { guid } },
  id,
  newDoneStatus = true,
) => {
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://${hostname}/_api/1.0/tasks/${id}/responses?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
        `data=${encodeURIComponent(
          JSON.stringify({
            recipient: { type: 'user', guid },
            event: { type: `mark-as-${newDoneStatus ? 'done' : 'undone'}` },
          }),
        )}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};
export const addTaskComment = (
  { hostname, deviceId, token, userData: { guid } },
  id,
  comment,
) =>
  new Promise((resolve, reject) => {
    axios
      .post(
        `https://${hostname}/_api/1.0/tasks/${id}/responses?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
        `data=${encodeURIComponent(
          JSON.stringify({
            recipient: { type: 'user', guid },
            event: { type: 'comment', message: comment },
          }),
        )}`,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      )
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });

export const addTaskFile = (
  { hostname, deviceId, token, userData: { guid } },
  id,
  { name, uri, type },
) => {
  let folderId = null;
  return new Promise((resolve, reject) => {
    axios
      .post(
        `https://${hostname}/createTempFolder?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
      )
      .then((response) => {
        folderId = response.data.id;

        const form = new FormData();
        form.append('description', 'Upload from Android App');
        form.append('File', {
          name,
          uri,
          type,
        });

        return axios.post(
          `https://${hostname}/folders/${folderId}/files?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
          form,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
        );
      })
      .then(() =>
        axios.post(
          `https://${hostname}/_api/1.0/tasks/${id}/responses?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
          `data=${encodeURIComponent(
            JSON.stringify({
              recipient: { type: 'user', guid },
              event: { type: 'add-file', folderId },
            }),
          )}`,
          {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
        ),
      )
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};

export const updateLocalTasks = (auth, forceCheckIds = []) => {
  console.log('Updating local tasks');
  return new Promise((resolve, reject) => {
    let currTimestamp = null;
    let newTasks = null;

    return Promise.all([
      AsyncStorage.getItem('firefly::tasks').then((tasks) =>
        tasks ? JSON.parse(tasks) : {},
      ),
      AsyncStorage.getItem('firefly::tasksLastUpdated')
        .then((lastUpdated) => {
          console.log(`since ${lastUpdated}`);
          currTimestamp = moment().toISOString();
          return getNewTaskIds(
            auth,
            lastUpdated ? moment(lastUpdated) : moment(0),
          );
        })
        .then((ids) => {
          return getTasks(auth, [...new Set([...ids, ...forceCheckIds])]);
        })
        .then((updatedTasks) => {
          console.log(`Fetched ${Object.keys(updatedTasks).length} tasks`);
          return Object.fromEntries(
            updatedTasks.map((task) => [task.id, task]),
          );
        }),
    ])
      .then(([oldTasks, updatedTasks]) => {
        newTasks = { ...oldTasks, ...updatedTasks };
        return Promise.all([
          AsyncStorage.setItem('firefly::tasks', JSON.stringify(newTasks)),
          AsyncStorage.setItem('firefly::tasksLastUpdated', currTimestamp),
        ]);
      })
      .then(() => resolve(newTasks))
      .catch((err) => reject(err));
  });
};

export const setTaskDoneStatusWithCheck = (
  { hostname, deviceId, token, userData: { guid } },
  id,
  newDoneStatus = true,
) => {
  return new Promise((resolve, reject) => {
    getTasks({ hostname, deviceId, token, userData: { guid } }, [id])
      .then(([task]) => {
        if (isTaskDone(task) === newDoneStatus) {
          return { data: 'Task status already set' };
        }

        return axios.post(
          `https://${hostname}/_api/1.0/tasks/${id}/responses?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
          `data=${encodeURIComponent(
            JSON.stringify({
              recipient: { type: 'user', guid },
              event: { type: `mark-as-${newDoneStatus ? 'done' : 'undone'}` },
            }),
          )}`,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
        );
      })
      .then((response) => resolve(response.data))
      .catch((err) => reject(err));
  });
};
