import bot from '../src/bot';

export default function handler(request : any, response : any) {
  bot.setWebhook(`https://${process.env.VERCEL_ENV}/api/handler`);
  bot.receiveUpdates([request.body]);
  console.log("[REQUEST BODY]: ");
  console.log(request.body);
  console.log("[BOT INFO]: ");
  console.log(bot);

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}