import bot from '../src/bot';

export default function handler(request : any, response : any) {
  bot.receiveUpdates([request.body]);
  console.log("[REQUEST BODY]: ");
  console.log(request.body);
  console.log("[BOT INFO]: ");
  console.log(bot);

  bot.sendMessage(request.body.message.chat.id, '[From handler]: HELLO WORLD')
    .then((data) => {console.log('[SUCCESS]: message sent')})
    .catch((err) => {console.log('[ERROR]: '); console.log(err)});

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}