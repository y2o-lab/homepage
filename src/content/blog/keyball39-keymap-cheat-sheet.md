---
title: Keyball39のキーマップを画面に表示するチートシートを作りました
description: Keyball39の現在のレイヤーとキー配置を画面に表示するmacOSアプリを作りました。ツールの紹介と初期セットアップ、使い方をまとめます。
pubDate: 2026-10-18
tags:
  - Keyball39
  - macOS
  - Go
  - SwiftUI
---

こんにちは。yunoです。
みなさん、こんなことで悩んだことないですか？
**Keyball39**を購入し、キー配置までして、いざ使ってみると。

あれ？この操作ってどのレイヤーのどのキーだっけ？
あのショートカットってどこに割り当てたっけ？
などなど。

キーマップを覚えるまで**不自由が勝ってしまい、結局使わなくなってしまう**なんてことも。
（私は購入して1年以上放置してました。。。）

**なのでチートシート、作りました。**
（Codexとともに）

本記事では作ったツールの紹介とセットアップ方法の紹介をします。
よければ使ってみてください！

- リポジトリ: [y2o-lab/keyball39-keymap-cheat-sheet](https://github.com/y2o-lab/keyball39-keymap-cheat-sheet)

## ツール紹介

まず前提になります。
現状、本ツールは以下の条件下でしか使えません。
（需要や自身が困ることがあれば拡張していきます）

- 対象デバイス: **Keyball39（Pro Micro Type-C版）**
- 対象OS: **macOS**

本ツールは画面に現在適用されているレイヤーのキーマップのチートシートを表示してくれるツールです。

![Keyball39のキーマップを画面に重ねて表示した様子](https://static.zenn.studio/user-upload/b6affe58f78f-20260926.png)

![レイヤーに応じたキー配置を表示するチートシート](https://static.zenn.studio/user-upload/7c13eddcefee-20260927.png)

使い方は簡単です。
アプリを起動しておき、キーボードをUSB接続すると、アプリがキーボードを認識して、現在適用中のレイヤーに配置しているキーマップのチートシートを表示します。

> ※ 初回のみ、**ファームウェアの書き込みをマイコン側に対して行う必要があり**、ここに関しては手順を後述します。

では、これより、詳しいセットアップ方法と利用方法を説明していきます。

## 初期セットアップ

### 1. 必要なツールの準備

> macOS 14 以降の Mac（Apple Silicon / Intel）。ビルドには Apple Swift **6.3.3** を提供する Xcode または Command Line Tools が必要です。そのツールが対応する macOS を使用してください。

まず Apple Command Line Tools が未導入の場合に実行し、インストール画面の完了を待ちます。

```sh
xcode-select --install
```

次のコマンドで `Apple Swift version 6.3.3` が表示されることを確認します。
異なる場合は、このバージョンを提供する Apple の Xcode / Command Line Tools を導入・選択してください。
`mise install` では Apple のツールはインストールされません。

```sh
swift --version
```

Xcode を `/Applications/Xcode.app` に導入した場合の切り替え例です。別名で保存した場合はパスを置き換えます。

```sh
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -runFirstLaunch
swift --version
```

Homebrew が未導入の場合は、[公式インストール手順](https://docs.brew.sh/Installation)の次のコマンドを実行します。
完了時に表示される **Next steps** に従ってシェルを設定し、`brew --version` が実行できることを確認してください。

```sh
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

[mise](https://mise.jdx.dev/installing-mise.html)（Go のバージョン管理・ビルド実行用）と ripgrep（環境チェック用の `rg` コマンド）を導入します。

```sh
brew install mise ripgrep
```

Go は次の手順で自動導入します。Homebrew の hidapi は不要です。

### 2. ソースを取得してビルドする

```sh
git clone https://github.com/y2o-lab/keyball39-keymap-cheat-sheet.git
cd keyball39-keymap-cheat-sheet
mise trust
mise install
mise run doctor
mise run build
```

既にソースを取得済みの場合は、`git clone` を省略し、`README.md` と `mise.toml` があるフォルダへ移動して `mise trust` から実行してください。
以降のコマンドもすべてこのフォルダで実行します。

`doctor` で `OK: Go 1.25.0, Apple Swift 6.3.3, macOS SDK, ...`、ビルドの最後に
`Built: dist/Keyball39KeymapCheatSheet.app` と表示されれば成功です。

### 3. ファームウェアの書き込み

> 以下の自動導入は **標準 Pro Micro（ATmega32U4 / Caterina）、QMK 0.19 以降のキーコード体系、1〜4レイヤー** が対象です。
> RP2040 などの換装ボードや独自ファームウェアは対象外です。

この操作はキーボードのファームウェアを書き換えます。
現在のキー配置を取り込んだ公式 VIA 版に通知拡張を追加しますが、元の独自機能をすべて複製するものではありません。
先に VIA / Remap で配列をエクスポートし、復旧用の元のファームウェアも確保してください。
自動バックアップはキー配置のみで、マクロ内容・CPI・RGB 等の設定は含みません。
マクロや独自ユーザーキーが含まれる配列は自動準備を停止します。

VIA / Remap を閉じて本アプリを実機モードで起動し、自分のキー配置が表示されている状態で実行します。
**初回も `firmware-prepare` が必要です。**

```sh
mise run firmware-prepare
```

依存ツールとソースの取得、現在の配列のバックアップ、拡張入りファームウェアのビルドが行われます。
この時点では書き込みません。成功すると次が作成されます。

- `backups/keyball39-*.json`: 現在のキー配置
- `dist/firmware/keyball39-cheatsheet.hex`: 書き込むファームウェア

準備が成功したら、本アプリをメニューバーから終了し、VIA / Remap も閉じます。
書き込む側に USB を接続して実行します。

```sh
mise run firmware-flash
```

「RESETを素早く2回」と表示されたら、その側の RESET を素早く2回押します。
**「書き込み・検証に成功しました」まで USB を抜かずに待ちます。**
90秒で検出できなければ同じコマンドを再実行します。
成功後に USB を抜いて反対側へ差し替え、同じコマンドと RESET 操作でもう片側へ書き込みます。
左右接続ケーブルも USB を抜いた状態で抜き差ししてください。

### 4. 接続

両側の書き込み後、普段使う側に USB を戻してアプリを起動します。

```sh
open dist/Keyball39KeymapCheatSheet.app
```

「設定… → 接続 → 表示レイヤー」を **「自動 · アクティブレイヤー」** にします。
**HUD が `LIVE` になり、キーボードでレイヤーを切り替えたときに表示が追従すれば完了です。**
通知未対応のままなら「レイヤー通知を再確認」、USB の抜き差し、アプリ再起動を試してください。

> より詳しい記載は[こちら](https://github.com/y2o-lab/keyball39-keymap-cheat-sheet#keyball39-keymap-cheat-sheet)をご覧ください。

## 使い方

以下のアプリにある**接続情報は基本的にキーボードをUSB接続すれば認識されます**が、されない場合はキーマップの再スキャンやキーマップの再取得を行ってください。

![アプリの接続設定とキーマップの再スキャン・再取得](https://static.zenn.studio/user-upload/cedb088a8cd1-20260927.png)

基本的にはキーマップの位置・サイズや濃さ、アプリの表示、文字の色（黒 or 白）を設定して使いやすいようにカスタマイズするだけです。

![キーマップの位置・サイズ・濃さ・文字色を調整する設定画面](https://static.zenn.studio/user-upload/0a6bf18e1399-20260927.png)

**※ 設定を閉じてしまった場合は、画面上部のメニューバーから開くことができます。**

![メニューバーからアプリの設定を開く方法](https://static.zenn.studio/user-upload/af0481ef348e-20260927.png)

## 最後に

私のように買ったはいいけどキーマップを覚えるのに苦戦しているなどの同様の課題を抱えてる人の助けになれば幸いです！
