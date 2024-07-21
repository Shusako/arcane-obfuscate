import { App, Plugin, Notice, PluginSettingTab, Setting } from 'obsidian'
import ArcaneObfuscatePlugin from './main'

export interface Settings {
	characterSet: string
	characterChangeRate: number
	updateRateMs: number
}

const DEFAULT_SETTINGS: Settings = {
	characterSet: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᛡᛠ',
	characterChangeRate: 0.3,
	updateRateMs: 300
}

export async function loadSettings (plugin: Plugin): Promise<Settings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData())
}

async function saveSettings (plugin: ArcaneObfuscatePlugin) {
	await plugin.saveData(plugin.settings)
}

export class SettingsTab extends PluginSettingTab {
	plugin: ArcaneObfuscatePlugin
	lastNotice: number = 0

	constructor (app: App, plugin: ArcaneObfuscatePlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display (): void {
		const { containerEl } = this
		containerEl.empty()

		const save = async (alert: boolean, refresh: boolean) => {
			await saveSettings(this.plugin)

			if (alert && Date.now() - this.lastNotice > 5000) {
				this.lastNotice = Date.now()
				new Notice(
					'Please restart Obsidian for the changes to take effect.',
					5000
				)
			}

			if (refresh) {
				this.display()
			}
		}

		new Setting(containerEl)
			.setName('Character Set')
			.setDesc(
				'The set of characters that will be used in the final visual'
			)
			.addText(text =>
				text
					.setPlaceholder('ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛋᛏᛒᛖᛗᛚᛝᛟᛞᛡᛠ')
					.setValue(this.plugin.settings.characterSet)
					.onChange(async (value: string) => {
						this.plugin.settings.characterSet = value
						await save(true, false)
					})
			)
			.addExtraButton(button =>
				button
					.setIcon('reset')
					.setTooltip('Reset')
					.onClick(async () => {
						this.plugin.settings.characterSet =
							DEFAULT_SETTINGS.characterSet
						await save(true, true)
					})
			)

		new Setting(containerEl)
			.setName('Character Change Rate')
			.setDesc(
				'The averaged rate that the characters will change. Set to 0 to disable. Set to 100 to always change every character every time.'
			)
			.addSlider(slider =>
				slider
					.setLimits(0, 100, 1)
					.setValue(this.plugin.settings.characterChangeRate * 100)
					.onChange(async (value: number) => {
						this.plugin.settings.characterChangeRate = value / 100
						await save(true, false)
					})
					.setDynamicTooltip()
			)
			.addExtraButton(button =>
				button
					.setIcon('reset')
					.setTooltip('Reset')
					.onClick(async () => {
						this.plugin.settings.characterChangeRate =
							DEFAULT_SETTINGS.characterChangeRate
						await save(true, true)
					})
			)

		new Setting(containerEl)
			.setName('Character Update Rate Milliseconds')
			.setDesc('How often (in milliseconds) that the text will change')
			.addSlider(slider =>
				slider
					.setLimits(0, 5000, 1)
					.setValue(this.plugin.settings.updateRateMs)
					.onChange(async (value: number) => {
						this.plugin.settings.updateRateMs = value
						await save(true, false)
					})
					.setDynamicTooltip()
			)
			.addExtraButton(button =>
				button
					.setIcon('reset')
					.setTooltip('Reset')
					.onClick(async () => {
						this.plugin.settings.updateRateMs =
							DEFAULT_SETTINGS.updateRateMs
						await save(true, true)
					})
			)
	}
}
