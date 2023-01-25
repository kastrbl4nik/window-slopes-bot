import bot from '../src/bot';

export default function handler(request : any, response : any) {
  bot.receiveUpdates([request.body]);
  console.log(request.body);

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}