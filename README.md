🚧 This project is still a work in progress 🚧

<hr />

[![npm](https://img.shields.io/npm/v/loco-cli)](https://www.npmjs.com/package/loco-cli)
![Dependencies](https://img.shields.io/librariesio/release/npm/loco-cli)
[![GitHub Issues](https://img.shields.io/github/issues/robrechtme/loco-cli.svg)](https://github.com/robrechtme/loco-cli/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<br />
<div align="center">
  <!-- <a href="https://github.com/robrechtme/loco-cli">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3 align="center">loco-cli</h3>

  <p align="center">
  
Automatically sync your project translations with [Loco](https://localise.biz).
    <br />
    <br />
    <a href="https://github.com/robrechtme/loco-cli/issues">Report Bug</a>
    ·
    <a href="https://github.com/robrechtme/loco-cli/issues">Request Feature</a>
  </p>
</div>

## About

The **Loco CLI** helps you keep your translations bundled in your app/website in sync with [Loco](https://localise.biz).

## Getting Started

```
npx loco-cli --help
```

Loco CLI currently has three methods, which are very similar to git commands:

- `loco-cli push`: push asset ID's to Loco, so translators can start translating them.
- `loco-cli pull`: download all translations.
- `loco-cli status`: see which asset ID's are not yet uploaded/downloaded.

The Loco CLI assumes your translations are stored as **JSON** files, one for each language.

```
[locales folder]
 ├── en.json
 ├── es.json
 └── fr.json
```

The keys in the files are asset ID's, and the values are translations. Nested JSON structures produce dottet asset ID's:

```jsonc
{
  "home": {
    "title": "Welcome back, {{name}}" // Asset ID: `home.title`
  }
}
```

### Config file

Global options are passed as options in the terminal or read from a `.locorc.{yaml,json,js}` file:

```jsonc
// .locorc.json
{
  "accessKey": "<loco-full-access-key>",
  "localesDir": "src/app/i18n/locales",
  "defaultLanguage": "en"
}
```

#### `accessKey`

or `-a, --access-key <key>`

The API key of the Loco project you wish to sync to/from. You can find this in the Loco project under `Developer Tools › API Keys › Full Access Key` (if you do not intend to use `loco-cli push`, an `Export key` will work too).

#### `localesDir`

or `-d, --locales-dir <path>`

The folder in which the JSON translation files are stored (defaults to current working dir).

#### `defaultLanguage`

or `-l, --default-language <lang>`

Loco CLI will use this language in the `push` and `status` commands to check which asset ID's are missing on Loco (default: `en`).

## Usage

### `loco-cli status`

Check the difference between local assets and remote assets. This command will show you which assets are present locally but not remotely and vice-versa.

### `loco-cli pull`

Download all translations from Loco. This command will **overwrite** the JSON files in `localesDir` with the assets found in Loco.

### `loco-cli push`

Push missing asset ID's to Loco. This command is useful for creating assets based on a reference JSON file.

#### Options

- `-t, --tag [tag]`: Tag for newly uploaded assets, e.g. "1.1.0"
- `-s, --status [status]`: Status for newly uploaded assets (default: "provisional")

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue.
Don't forget to give the project a star! Thanks again!

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.
