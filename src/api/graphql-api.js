import axios from 'axios';
import moment from 'moment';

const graphqlQuery = ({ hostname, deviceId, token }, query) => {
  const uglyQuery = query;
  // .replace(/#.*\n/g, '')
  // .replace(/[\s|,]*\n+[\s|,]*/g, ' ')
  // .replace(/:\s/g, ':')
  // .replace(/,\s/g, ',')
  // .replace(/\)\s\{/g, '){')
  // .replace(/\}\s/g, '}')
  // .replace(/\{\s/g, '{')
  // .replace(/\s\}/g, '}')
  // .replace(/\s\{/g, '{')
  // .replace(/\)\s/g, ')')
  // .replace(/\(\s/g, '(')
  // .replace(/\s\)/g, ')')
  // .replace(/\s\(/g, '(')
  // .replace(/[=]\s/g, '=')
  // .replace(/\s=/g, '=')
  // .replace(/@\s/g, '@')
  // .replace(/\s@/g, '@')
  // .replace(/\s\$/g, '$')
  // .replace(/\s\./g, '.')
  // .trim();

  return axios.post(
    `https://${hostname}/_api/1.0/graphql?ffauth_device_id=${deviceId}&ffauth_secret=${token}`,
    `data=${encodeURIComponent(uglyQuery)}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  );
};

export const getMessages = (auth) =>
  new Promise((resolve, reject) =>
    graphqlQuery(
      auth,
      `#graphql
      query GetMessages {
        users(guid: "${auth.userData.guid}") {
          messages {
            from {
              guid, name 
            }, single_to {
              guid, name 
            }, all_recipients, sent, archived, read, body, id
          }
        }
      }`,
    )
      .then((response) => {
        return resolve(response.data.data.users[0].messages);
      })
      .catch((error) => {
        reject(error);
      }),
  );

export const getBookmarks = (auth) =>
  new Promise((resolve, reject) =>
    graphqlQuery(
      auth,
      `#graphql
      query GetBookmarks {
        users(guid: "${auth.userData.guid}") {
          bookmarks {
            from{
              guid, name, sort_key
            }, deletable, read, is_form, form_answered, guid, type, title, breadcrumb, full_url, simple_url, created, position
          }
        }
      }`,
    )
      .then((response) => {
        return resolve(response.data.data.users[0].bookmarks);
      })
      .catch((error) => {
        reject(error);
      }),
  );

export const setPersonalTask = (
  auth,
  title,
  description = '',
  due = moment(),
  set = moment(),
  attachments = [], // entries of the form [filename, base64 string]
) =>
  new Promise((resolve, reject) =>
    graphqlQuery(
      auth,
      `#graphql
        mutation SetPersonalTask {
          result: tasks(
            new: true,
            new_title: "${title}",
            new_description: "${description}",
            new_set: "${set.format('YYYY-MM-DD')}",
            new_due: "${due.format('YYYY-MM-DD')}",
            new_setter: "${auth.userData.guid}",
            new_addressees: [ "${auth.userData.guid}" ],
            new_attachments: [ ${attachments
              .map(
                ([filename, binary]) =>
                  `{filename: "${filename}", binary_base64: "${binary}"}`,
              )
              .join(', ')} ],
            new_task_type: "PersonalTask"
          ) {
            id
          }
        }`,
    )
      .then((response) => {
        return resolve(response.data.data.result[0].id);
      })
      .catch((error) => {
        reject(error);
      }),
  );

export const setMessagesReadStatus = (auth, ids, newReadStatus = true) =>
  new Promise((resolve, reject) =>
    graphqlQuery(
      auth,
      `#graphql
    mutation SetMessagesReadStatus {
      result: messages(
        ids: ${ids},
        user_guid: "${auth.userData.guid}",
        new_read: ${newReadStatus}
      )
    }`,
    )
      .then((response) => {
        return resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      }),
  );

export const setMessagesArchivedStatus = (auth, ids, newArchivedStatus) =>
  new Promise((resolve, reject) =>
    graphqlQuery(
      auth,
      `#graphql
  mutation SetMessagesArchivedStatus {
    result: messages(
      ids: ${ids},
      user_guid: "${auth.userData.guid}",
      new_archive: ${newArchivedStatus}
    )
  }`,
    )
      .then((response) => {
        return resolve(response.data.data);
      })
      .catch((error) => {
        reject(error);
      }),
  );
