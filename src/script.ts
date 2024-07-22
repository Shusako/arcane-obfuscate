import { ArcaneWord, ArcaneToken, ArcaneTokenType } from './arcane'

export type HtmlArcaneCharacters = {
	el: HTMLElement
	count: number
}

export const scriptComponent = (
	characterSet: string,
	characterChangeRate: number,
	updateRateMs: number
) => {
	function getRandomCharacter (not?: string) {
		let candidates = characterSet.replace(not ?? '', '')
		return candidates[Math.floor(Math.random() * candidates.length)]
	}

	const me = document.currentScript!
	const parent = me.parentElement!

	// discover all arcane characters under this parent that
	// should be controlled by this script
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

	// console.log('creating - found ' + length.toString())
	const intervalId = setInterval(() => {
		if (!document.body.contains(me)) {
			// console.log('clearing - no longer exist ' + length)
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
