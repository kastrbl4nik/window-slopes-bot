import bot from '../src/bot';

export default async (request : any, response : any) => {
	console.log(request);
	console.log(response);
  	return response.status(200).json(
		request.body && request.body.update_id ?
		await bot.receiveUpdates([request.body]) :
		{ status: false }
	);
}