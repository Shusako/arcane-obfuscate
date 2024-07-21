import {
	ArcaneTokenType,
	getAllTokens,
	getNextToken,
	getToken,
	parseWords
} from './arcane'

describe('getToken', () => {
	it('should return NONE token for empty text', () => {
		const result = getToken('', 0, 0)

		expect(result.type).toBe(ArcaneTokenType.NONE)
		expect(result.value).toBe('')
	})

	it('should return LENGTH token for regular text', () => {
		const result = getToken('Hello', 0, 5)

		expect(result.type).toBe(ArcaneTokenType.LENGTH)
		expect(result.value).toBe(5)
	})

	it('should return LITERAL_TEXT token for escaped characters', () => {
		const result = getToken('\\n\\t\\r', 0, 6)

		expect(result.type).toBe(ArcaneTokenType.LITERAL_TEXT)
		expect(result.value).toBe('ntr')
	})

	it('should return WHITESPACE token for whitespace', () => {
		const result = getToken('   ', 0, 3)

		expect(result.type).toBe(ArcaneTokenType.WHITESPACE)
		expect(result.value).toBe('   ')
	})
})

describe('getNextToken', () => {
	it('should work for basic scenarios', () => {
		const result = getNextToken('5 + 2 * 3', 0)

		expect(result.token.value).toBe(1)
		expect(result.token.type).toBe(ArcaneTokenType.LENGTH)
	})

	it('should handle empty text', () => {
		const result = getNextToken('', 0)

		expect(result.token.value).toBe('')
		expect(result.token.type).toBe(ArcaneTokenType.NONE)
	})

	it('should allow escaped characters to be literals', () => {
		const result = getNextToken('\\1\\4   \\3asdf asdf asdf', 0)

		expect(result.token.value).toBe('14')
		expect(result.token.type).toBe(ArcaneTokenType.LITERAL_TEXT)
	})

	it('should separate whitespace', () => {
		const result = getNextToken('  \\1 asdf', 0)

		expect(result.token.value).toBe('  ')
		expect(result.token.type).toBe(ArcaneTokenType.WHITESPACE)
	})

	it('should allow literal whitespace', () => {
		const result = getNextToken('\\t\\ \\ \\t', 0)

		expect(result.token.value).toBe('t  t')
		expect(result.token.type).toBe(ArcaneTokenType.LITERAL_TEXT)
	})

	it('should allow escaped words', () => {
		const result = getNextToken('!visible', 0)

		expect(result.token.value).toBe('visible')
		expect(result.token.type).toBe(ArcaneTokenType.LITERAL_TEXT)
	})

	it('should group escaped words and literals', () => {
		const result = getNextToken('!visible\\d', 0)

		expect(result.token.value).toBe('visibled')
		expect(result.token.type).toBe(ArcaneTokenType.LITERAL_TEXT)
	})

	it('should count ! not at the start of a word as any other character', () => {
		const result = getNextToken('test!', 0)

		expect(result.token.value).toBe(5)
		expect(result.token.type).toBe(ArcaneTokenType.LENGTH)
	})
})

describe('getAllTokens', () => {
	it('should work', () => {
		const result = getAllTokens('\\1\\4   \\3test hi')

		expect(result[0].value).toBe('14')
		expect(result[1].value).toBe('   ')
		expect(result[2].value).toBe('3')
		expect(result[3].value).toBe(4)
		expect(result[4].value).toBe(' ')
		expect(result[5].value).toBe(2)
	})
})

describe('parseWords', () => {
	it('should properly group literals and numbers', () => {
		const result = parseWords('\\1\\4asdf')

		expect(result.length).toBe(1)

		expect(result[0].length).toBe(2)

		expect(result[0][0].value).toBe('14')
		expect(result[0][1].value).toBe(4)
	})

	it('should work when starting with whitespace', () => {
		const result = parseWords('  asdf')

		expect(result.length).toBe(2)

		expect(result[0].length).toBe(1)
		expect(result[1].length).toBe(1)

		expect(result[0][0].value).toBe('  ')
		expect(result[1][0].value).toBe(4)
	})

	it('should handle complex sentences', () => {
		const result = parseWords(
			'\\1\\4dadf \\t\\e\\s\\t sdfthi !iads\\s !visible    te\\3x!t'
		)

		expect(result.length).toBe(11)

		expect(result[0].length).toBe(2)
		expect(result[1].length).toBe(1)
		expect(result[2].length).toBe(1)
		expect(result[3].length).toBe(1)
		expect(result[4].length).toBe(1)
		expect(result[5].length).toBe(1)
		expect(result[6].length).toBe(1)
		expect(result[7].length).toBe(1)
		expect(result[8].length).toBe(1)
		expect(result[9].length).toBe(1)
		expect(result[10].length).toBe(3)

		expect(result[0][0].value).toBe('14')
		expect(result[0][1].value).toBe(4)
		expect(result[1][0].value).toBe(' ')
		expect(result[2][0].value).toBe('test')
		expect(result[3][0].value).toBe(' ')
		expect(result[4][0].value).toBe(6)
		expect(result[5][0].value).toBe(' ')
		expect(result[6][0].value).toBe('iadss')
		expect(result[7][0].value).toBe(' ')
		expect(result[8][0].value).toBe('visible')
		expect(result[9][0].value).toBe('    ')
		expect(result[10][0].value).toBe(2)
		expect(result[10][1].value).toBe('3')
		expect(result[10][2].value).toBe(3)
	})
})
