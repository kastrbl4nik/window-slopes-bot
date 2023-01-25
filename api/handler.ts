import bot from '../src/bot';

export default async ({ body } : any, { json } : any) =>
    json(body && body.update_id ? await bot.receiveUpdates([body]) : {status: false})
/*export default function handler(request : any, response : any) {
  console.log("[REQUEST BODY]: ");
  console.log(request.body);
  console.log("[BOT INFO]: ");
  console.log(bot);

  response.status(200).json({
    body: request.body,
    query: request.query,
    cookies: request.cookies,
  });
}*/