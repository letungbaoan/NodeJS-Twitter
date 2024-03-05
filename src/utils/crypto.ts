import { createHash } from 'crypto'
import { envConfig } from '~/constants/config'

export function sh256(content: string) {
	return createHash('sha256').update(content).digest('hex')
}

export function hashPassword(password: string) {
	return sh256(password + envConfig.passwordSecret)
}
