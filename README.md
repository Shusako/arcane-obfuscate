# Arcane Obfuscate

This plugin for [Obsidian](https://obsidian.md/) adds the ability to mark text to be obfuscated in an animated runic (by default) look.

Edit mode:
![before](https://github.com/user-attachments/assets/a3171609-88f3-4c05-9775-ae4ee240e23f)
Reading mode:
![after](https://github.com/user-attachments/assets/f32949f8-daa7-4c93-9e83-86ac984be62e)

This plugin was made to be used in conjunction with [Obsidian Webpage Export](https://github.com/KosmosisDire/obsidian-webpage-export), and that drove a lot of the design decisions. The source text isn't exposed in the resulting HTML (it's actually encoded as a sequence of word-lengths, plain-text of whitespace characters, and plain-text of any characters that were escaped), but because the structure of the text is still there it would still be prone to dictionary/pattern matching attacks (so don't hide things you truly care about with this, they are not perfectly private).

# Syntax

Basic syntax would be to surround text like so:
**\`\~text here\~\`**
This will result in all of that text being obfuscated.

There is the option to have some text show through the obfuscation for any reason.
**\`\~test visib\l\e\~\`** will show the two letters 'le' as plain text.

There is also a shortcut by prepending a word with '!' to reveal the whold word.
**\`\~test !visible\~\`** will reveal the entire word 'visible'

## How to develop

-   Clone this repo.
-   Make sure your NodeJS is at least v16 (`node --version`).
-   `npm i` or `yarn` to install dependencies.
-   `npm run dev` to start compilation in watch mode.

## Manually installing the plugin

-   Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/arcane-obfuscate/`.
