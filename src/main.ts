import { Plugin, WorkspaceLeaf } from 'obsidian'
import { ArcaneWord, parseWords } from './arcane'
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
		const arcaneArray: ArcaneWord[] = parseWords(text)

		// inject some javascript into the document
		// we do this inside the document so that we support rendering these
		// files through obsidian to .html and keeping this animation intact
		const script = createScriptNode(
			`(${scriptComponent.toString()})('${JSON.stringify(
				arcaneArray
			)}', '${this.settings.characterSet}', ${
				this.settings.characterChangeRate
			}, ${this.settings.updateRateMs})`
		)

		container.parentElement!.replaceChild(script, container)
	}

	handleActiveLeafChange (leaf: WorkspaceLeaf | null) {
		if (leaf?.view?.containerEl) {
			const container: HTMLElement = leaf.view.containerEl
			// timeout of 10ms is needed to let the html reload in this view
			// since obsidian will hot-swap the elements back in
			setTimeout(() => {
				// remove all existing words as the script will recreate them
				container.querySelectorAll('.arcane-word').forEach(word => {
					word.parentElement!.removeChild(word)
				})

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
