🚧 This project is still a work in progress 🚧

<hr />

![Node](https://img.shields.io/badge/node-v14+-blue.svg)
[![Build Status](https://travis-ci.org/robrechtme/loco-cli.svg?branch=master)](https://travis-ci.org/robrechtme/loco-cli)
![Dependencies](https://img.shields.io/badge/dependencies-up%20to%20date-brightgreen.svg)
[![GitHub Issues](https://img.shields.io/github/issues/robrechtme/loco-cli.svg)](https://github.com/robrechtme/loco-cli/issues)
![Contributions welcome](https://img.shields.io/badge/contributions-welcome-orange.svg)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

<br />
<div align="center">
  <!-- <a href="https://github.com/robrechtme/loco-cli">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h3 align="center">loco-cli</h3>

  <p align="center">
NodeJS CLI tool for uploading/downloading assets from Loco.
    <br />
    <br />
    <a href="https://github.com/robrechtme/loco-cli/issues">Report Bug</a>
    ·
    <a href="https://github.com/robrechtme/loco-cli/issues">Request Feature</a>
  </p>
</div>

## About

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

NodeJS CLI tool for uploading/downloading assets from Loco.

## Getting Started

```
npx loco-cli --help
```

### `accessKey`

You can find this in the Loco project under `Developer Tools › API Keys › Full Access Key` (if you intend to not use `loco-cli push`, an `Export key` will work too).

### `localesFolder`

The folder in which the translations are stored (defaults to current folder). Loco CLI assumes your locales are stored in the following format:

```
[locales folder]
 ├── en.json
 ├── es.json
 └── fr.json
```

### `defaultLanguage`

Loco CLI will use this language as a reference to check which locales are missing on Loco (default: `en`).

## Usage

```
Usage: loco-cli [options] [command]

Options:
  -V, --version                        output the version number
  -p, --personal-access-token <token>  Loco API token
  -h, --help                           display help for command

Commands:
  pull <out_dir>                       Fetch assets from Loco
  push [options] <input-file>          Upload assets to Loco
  status <reference-file>              Check status of local file
  help [command]                       display help for command
```

### `loco-cli status`

```
Usage: loco-cli status [options] <reference-file>

Check status of local file

Arguments:
  reference-file  Path to JSON file containing local assets

Options:
  -h, --help      display help for command
```

### `loco-cli pull`

```
Usage: loco-cli pull [options] <out_dir>

Fetch assets from Loco

Arguments:
  out_dir     Path to directory to write to

Options:
  -h, --help  display help for command
```

### `loco-cli push`

```
Usage: loco-cli push [options] <input-file>

Upload assets to Loco

Arguments:
  input-file             Path to JSON file to upload from

Options:
  -t, --tag [tag]        Tag to add to all newly uploaded assets, e.g. "1.1.0"
  -s, --status [status]  Loco API token (default: "provisional")
  -h, --help             display help for command
```

### Options

- `-p`, `--personal-access-token <token>`: Loco API token
- `-V`, `--version`: Output the version number

- `-h`, `--help`: Display help for command

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue.
Don't forget to give the project a star! Thanks again!

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for more information.
