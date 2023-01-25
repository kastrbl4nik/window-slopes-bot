import bot from '../src/bot';

export default async ({body} : any, {json} : any) => {
  	return json(body && body.update_id ? await bot.receiveUpdates([body]) : { status: false });
}