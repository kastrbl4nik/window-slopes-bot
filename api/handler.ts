import bot from '../src/bot';

export default function handler(request : any, response : any) {
  bot.receiveUpdates([request.body]);
  console.log("[REQUEST BODY]: " + request.body);
  bot.getWebhookInfo().then((data) => {
    console.log("[WEBHOOK INFO]: " + data);
  })

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}