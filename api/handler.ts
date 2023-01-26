import bot from '../src/bot';

export default async (request : any, response : any) => {
	console.log(request);
	console.log(response);
  	return response.status(200).json(
		await bot.receiveUpdates([request.body])
	);
}