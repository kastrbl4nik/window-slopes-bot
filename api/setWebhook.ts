import bot from '../src/bot';

const isDev = process.env.VERCEL_ENV === 'development';
const webHookURL = host => `https://${host}/api/handler`;

export default async ({body: {url}, headers}, {json}) =>
    json(await bot.setWebhook(isDev && url ? url : webHookURL(headers['x-forwarded-host'])).catch(e => e));