import { Response, Request, NextFunction, RequestHandler } from 'express'

export const wrapResquestHandler = (func: RequestHandler) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			await func(req, res, next)
		} catch (error) {
			next(error)
		}
	}
}
