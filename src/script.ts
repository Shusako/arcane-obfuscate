import { ArcaneWord, ArcaneToken, ArcaneTokenType } from './arcane'

export type HtmlArcaneCharacters = {
	el: HTMLElement
	count: number
}

export const scriptComponent = (
	serializedArcaneArray: string,
	characterSet: string,
	characterChangeRate: number,
	updateRateMs: number
) => {
	const words: ArcaneWord[] = JSON.parse(serializedArcaneArray)

	function getRandomCharacter (not?: string) {
		let candidates = characterSet.replace(not ?? '', '')
		return candidates[Math.floor(Math.random() * candidates.length)]
	}

	const me = document.currentScript!
	const parent = me.parentElement!

	// obsidian will prerender all the elements, so when the html exporter
	// comes through the elements are already rendered.
	// This check is essentially if(obsidian) { render }
	// @ts-ignore: Property 'app' does not exist on type 'Window & typeof globalThis'.ts(2339)
	if (window.app !== undefined) {
		words.forEach((word: ArcaneWord) => {
			const arcaneWord = document.createElement('span')
			arcaneWord.className = 'arcane-word'

			word.forEach((token: ArcaneToken) => {
				switch (token.type) {
					case ArcaneTokenType.LENGTH:
						let num = token.value as number

						for (let i = 0; i < num; i++) {
							const characterDiv = document.createElement('span')
							characterDiv.className = 'arcane-character'
							characterDiv.textContent = getRandomCharacter()

							arcaneWord.appendChild(characterDiv)
						}

						break

					case ArcaneTokenType.LITERAL_TEXT:
					case ArcaneTokenType.WHITESPACE:
						const textNode = document.createTextNode(
							token.value as string
						)

						arcaneWord.appendChild(textNode)
						break
				}
			})

			parent.insertBefore(arcaneWord, me)
		})
	}

	// discover all arcane characters under this parent
	const htmlArcaneCharacters: HtmlArcaneCharacters[] = []

	const myIndex = Array.from(parent.childNodes).indexOf(me)
	for (let i = myIndex - 1; i >= 0; i--) {
		if (parent.childNodes[i].nodeType === Node.ELEMENT_NODE) {
			const element = parent.childNodes[i] as HTMLElement
			if (element.classList.contains('arcane-word')) {
				for (let j = 0; j < element.children.length; j++) {
					htmlArcaneCharacters.push({
						el: element.children[j] as HTMLElement,
						count: 0
					})
				}
			}

			if (element.classList.contains('arcane-script')) {
				break
			}
		}
	}

	const length: number = htmlArcaneCharacters.length

	htmlArcaneCharacters.shuffle = function () {
		for (let i = this.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1))
			;[this[i], this[j]] = [this[j], this[i]]
		}
		return this
	}

	// console.log('creating')
	const intervalId = setInterval(() => {
		if (!document.body.contains(me)) {
			// console.log('clearing - no longer exist')
			clearInterval(intervalId)
			return
		}

		if (length === 0) {
			// console.log('clearing - no characters')
			clearInterval(intervalId)
			return
		}

		const chars = length * characterChangeRate

		htmlArcaneCharacters
			// .filter(() => Math.random() < characterChangeChance)
			.shuffle()
			.sort((first, second) => {
				return (
					first.count -
					second.count +
					Math.floor((Math.random() * 2 - 1) * 3)
				)
			})
			.slice(
				0,
				Math.random() < 1 - (chars - Math.floor(chars))
					? Math.floor(chars)
					: Math.ceil(chars)
			)
			.forEach(sibling => {
				sibling.el.innerText = getRandomCharacter(sibling.el.innerText)
				sibling.count++
			})
	}, updateRateMs)
}

export function createScriptNode (script: string): HTMLScriptElement {
	const scriptElement: HTMLScriptElement = document.createElement('script')
	scriptElement.className = 'arcane-script'
	scriptElement.textContent = script

	return scriptElement
}
