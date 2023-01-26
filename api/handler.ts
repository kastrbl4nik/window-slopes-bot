import bot from '../src/bot';

export default async ({body} : any, {json} : any) => {
	console.log(body);
	console.log(json);
  	return json(body && body.update_id ? await bot.receiveUpdates([body]) : { status: false });
}