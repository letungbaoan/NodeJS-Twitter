import { Response, Request, NextFunction, RequestHandler } from 'express'

export const wrapResquestHandler = <P>(func: RequestHandler<P>) => {
	return async (req: Request<P>, res: Response, next: NextFunction) => {
		try {
			await func(req, res, next)
		} catch (error) {
			next(error)
		}
	}
}
