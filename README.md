<div align="center">
  <br />
  <img src="logo.svg" height="70">
  <br />
  <br />
  <h3 align="center">loco-cli</h3>
  <p align="center">

Automatically sync your project translations with [Loco](https://localise.biz).

[![npm](https://img.shields.io/npm/v/loco-cli)](https://www.npmjs.com/package/loco-cli)
![Dependencies](https://img.shields.io/librariesio/release/npm/loco-cli)
[![GitHub Issues](https://img.shields.io/github/issues/robrechtme/loco-cli.svg)](https://github.com/robrechtme/loco-cli/issues)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
<br />
<br />
<a href="https://github.com/robrechtme/loco-cli/issues">Report Bug</a>
·
<a href="https://github.com/robrechtme/loco-cli/issues">Request Feature</a>

  </p>
</div>

## About

The **Loco CLI** helps you keep your translations bundled in your app/website in sync with [Loco](https://localise.biz).

> Looking for a Python alternative? Try [marten-cz/loco-cli](https://github.com/marten-cz/loco-cli)!

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

### Configuration

Global options are passed as options in the terminal or read from a `.locorc.{yaml,json,js}` file:

```jsonc
// .locorc.json
{
  "accessKey": "<loco-full-access-key>",
  "localesDir": "src/app/i18n/locales",
  "defaultLanguage": "en",
  "namespaces": false
}
```

| Config key | CLI flag | Type | Description |
| ------ | ---- | ---- | ----------- |
| accessKey | `-a`, `--access-key <key>` | `string` | The API key of the Loco project you wish to sync to/from. You can find this in the Loco project under `Developer Tools › API Keys › Full Access Key` (if you do not intend to use `loco-cli push`, an `Export key` will work too). | 
| localesDir | `-d`, `--locales-dir <path>` | `string` | The folder in which the JSON translation files are stored (defaults to current working dir). | 
| namespaces | `-N`, `--namespaces` | `boolean` | Organize translations into namespaces (default: `false`). Set this flag to `true` when dividing translations into multiple namespaces. The uploaded asset ID's will be prefixed with `<namespace>:`. | 
| push | - | `PushOptions` | https://localise.biz/api/docs/import/import | 
| pull | - | `PullOptions` | https://localise.biz/api/docs/export/exportall | 


## Usage

### `loco-cli status`

Check the difference between local assets and remote assets. This command will show you which assets are present locally but not remotely and vice-versa.

#### Options

- `--direction [remote|local|both]`: Direction to diff the assets IDs to
  - `remote`: Only check for local assets that are missing remotely
  - `local`: Only check for remote assets that are missing locally
  - `both`: Check both directions

### `loco-cli pull`

Download all translations from Loco. This command will **overwrite** the JSON files in `localesDir` with the assets found in Loco.

#### Options

- `-y, --yes`: Automatically answer yes to all confirmation prompts (default: false)

### `loco-cli push`

Push missing translations to Loco. This command is useful for creating assets based on a reference JSON file.

#### Options

- `-y, --yes`: Automatically answer yes to all confirmation prompts (default: false)

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue.
Don't forget to give the project a star! Thanks again!

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.
