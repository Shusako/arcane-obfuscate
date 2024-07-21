export type ArcaneWord = ArcaneToken[]

export type ArcaneToken = {
	type: ArcaneTokenType
	value: number | string
}

export enum ArcaneTokenType {
	NONE,
	LENGTH,
	LITERAL_TEXT,
	WHITESPACE
}

export function getToken (
	text: string,
	start: number,
	end: number
): ArcaneToken {
	if (end - start == 0) {
		return { type: ArcaneTokenType.NONE, value: '' }
	}

	const partial: string = text.substring(start, end)

	// escaped characters or word
	if (/(\\.?)+$/.test(partial) || /^!(\S)*$/.test(partial)) {
		let answer: string = partial
		answer = answer.replace(/\\(.)?/g, '$1')
		answer = answer.replace(/^!/, '')

		return {
			type: ArcaneTokenType.LITERAL_TEXT,
			value: answer
		}
	}

	// whitespace
	if (/(\s)+$/.test(partial)) {
		return {
			type: ArcaneTokenType.WHITESPACE,
			value: partial
		}
	}

	return {
		type: ArcaneTokenType.LENGTH,
		value: partial.length
	}
}

export function getNextToken (
	text: string,
	index: number
): { token: ArcaneToken; consumed: number } {
	let lastToken: ArcaneToken = { type: ArcaneTokenType.NONE, value: '' }
	let end: number = index + 1

	do {
		let currentToken: ArcaneToken = getToken(text, index, end)

		if (
			(lastToken?.type != ArcaneTokenType.NONE &&
				currentToken.type != lastToken?.type) ||
			end > text.length
		) {
			return {
				token: lastToken,
				consumed: end - 1 - index
			}
		}

		lastToken = currentToken
		end++
	} while (true)
}

export function getAllTokens (text: string): ArcaneToken[] {
	const result: ArcaneToken[] = []
	let index: number = 0

	do {
		const { token, consumed } = getNextToken(text, index)

		if (token.type != ArcaneTokenType.NONE) {
			result.push(token)
		}

		index += consumed
	} while (index < text.length)

	return result
}

export function parseWords (text: string): ArcaneWord[] {
	const tokens: ArcaneToken[] = getAllTokens(text)

	const words: ArcaneWord[] = []

	// split on whitespace
	// guaranteed no two whitespaces in a row

	let index: number = 0
	let currentWord: ArcaneWord = []

	do {
		let currentToken: ArcaneToken = tokens[index]

		if (currentToken.type == ArcaneTokenType.WHITESPACE) {
			if (currentWord.length != 0) {
				words.push(currentWord)
				currentWord = []
			}

			words.push([currentToken]) // whitespace will be alone
		} else {
			currentWord.push(currentToken)
		}

		index++
	} while (index < tokens.length)

	if (currentWord.length != 0) {
		words.push(currentWord)
	}

	return words
}
