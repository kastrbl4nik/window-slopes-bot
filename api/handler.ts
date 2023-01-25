import bot from '../src/bot';



export default function handler(request : any, response : any) {
  bot.receiveUpdates([request.body]);
  console.log("[REQUEST BODY]: ");
  console.log(request.body);
  console.log("[RECEIVED BOT]: ");
  console.log(bot);

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}