import bot from '../src/bot';

export default async (request : any, response : any) => {
	console.debug(request.body);
  	return response.status(200).json(
		await bot.setWebhook(`https://window-slopes-bot.vercel.app/api/handler`)
        .then(i => console.info(i))
        .catch(e => console.error(e))
	);
}