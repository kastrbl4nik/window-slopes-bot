module.exports = async (request : any, response : any) => {
    response.status(200).json({
        body: request.body,
        query: request.query,
        cookies: request.cookies,
    });
};