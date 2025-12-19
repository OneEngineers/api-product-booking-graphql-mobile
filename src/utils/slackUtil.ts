import moment from 'moment';
import { ENV, ENVIRONMENT } from '../constants';
import { httpPost } from './httpUtil';

/**
 * Send message to slack
 * @param {object} error
 * @returns {void}
 */
export const createSlackErrorMessage = async (
  error: unknown
): Promise<void> => {
  const date = moment().format('ddd DD MMMM YYYY HH:mm:s A');

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.SLACK_APP_TOKEN}`,
    },
  };

  const body = {
    channel: ENV.SLACK_CHANNEL,
    attachments: [
      {
        color: '#ff0000',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'plain_text',
              text: `:boom: [${ENV.NODE_ENV.toUpperCase()}] SabayOne API`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Severity:* \`Error\`\n*Summary:*\n ${
                (error as { name: string }).name
              }: ${(error as { message: string }).message}`,
            },
          },
          {
            type: 'context',
            elements: [
              {
                type: 'plain_text',
                text: date,
                emoji: false,
              },
            ],
          },
        ],
      },
    ],
  };

  await httpPost(ENV.SLACK_API_URL, body, config);
};

export const slackErrorMessage = async (error: unknown): Promise<void> => {
  try {
    if (
      ENV.NODE_ENV !== ENVIRONMENT.TEST &&
      ENV.NODE_ENV !== ENVIRONMENT.CI_TEST
    ) {
      createSlackErrorMessage(error);
    }
  } catch (err) {
    console.log('Send message to Slack failed: ', err);
  }
};
