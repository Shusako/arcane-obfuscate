import { Plugin, WorkspaceLeaf } from 'obsidian'
import { ArcaneToken, ArcaneTokenType, ArcaneWord, parseWords } from './arcane'
import { loadSettings, Settings, SettingsTab } from './settings'
import { createScriptNode, scriptComponent } from './script'

export default class ArcaneObfuscatePlugin extends Plugin {
	settings: Settings

	async onload () {
		this.settings = await loadSettings(this)
		this.addSettingTab(new SettingsTab(this.app, this))

		this.registerEvent(
			this.app.workspace.on(
				'active-leaf-change',
				this.handleActiveLeafChange.bind(this)
			)
		)

		this.registerMarkdownPostProcessor((element, context) => {
			element.querySelectorAll('code').forEach(codeElement => {
				const match = codeElement.innerText.match(/~(.+)~/)
				if (match) {
					const text = match[1]
					this.processArcaneContainer(codeElement, text)
				}
			})
		})
	}

	processArcaneContainer (container: HTMLElement, text: string) {
		// inject some javascript into the document
		// we do this inside the document so that we support rendering these
		// files through obsidian to .html and keeping this animation intact
		const script: HTMLScriptElement = createScriptNode(
			`(${scriptComponent.toString()})('${this.settings.characterSet}', ${
				this.settings.characterChangeRate
			}, ${this.settings.updateRateMs})`
		)

		// render out all the elements
		const words: ArcaneWord[] = parseWords(text)
		const elements: HTMLElement[] = []
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
							characterDiv.textContent =
								this.settings.characterSet.charAt(
									Math.floor(
										Math.random() *
											this.settings.characterSet.length
									)
								)

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

			elements.push(arcaneWord)
		})

		elements.push(script)

		// first element replaces the container, the rest get inserted
		// after the previous one
		// the script needs to be inserted last because it looks for all the
		// elements we're about to push

		// if somehow only script or empty(??) don't do anything
		if (elements.length <= 1) return

		let previousElement: HTMLElement = elements.shift()!
		container.parentElement!.replaceChild(previousElement, container)

		while (elements.length != 0) {
			let currentElement = elements.shift()!
			previousElement.parentElement!.insertAfter(
				currentElement,
				previousElement
			)
			previousElement = currentElement
		}
	}

	handleActiveLeafChange (leaf: WorkspaceLeaf | null) {
		if (leaf?.view?.containerEl) {
			const container: HTMLElement = leaf.view.containerEl
			// timeout of 10ms is needed to let the html reload in this view
			// since obsidian will hot-swap the elements back in
			setTimeout(() => {
				// when obsidian hot swaps the script element back in, it
				// doesn't get ran again. so we need to replace the script
				// with the same everything to kick-start it
				const arcaneScripts =
					container.querySelectorAll('.arcane-script')

				arcaneScripts.forEach(originalScript => {
					const replacementScript = createScriptNode(
						originalScript.textContent!
					)

					originalScript.parentElement!.replaceChild(
						replacementScript,
						originalScript
					)
				})
			}, 10)
		}
	}
}
