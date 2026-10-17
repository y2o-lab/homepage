---
title: Storymesh — StorybookのStory不足を検知するOSSを作りました
description: Storybookのstoriesファイルや必要なStoryの不足を検知し、雛形を生成する個人OSS「Storymesh」の背景と使い方を紹介します。
pubDate: 2026-10-18
tags:
  - Storymesh
  - Storybook
  - OSS
  - AI
---

## 初めに

こんにちは。yunoです。
今回は個人OSSとして作成した**Storymesh**というツールの紹介になります。

> ※ 本ツールはStorybookを用いる前提で利用するツールです。

**リポジトリ**: [https://github.com/y2o-lab/storymesh](https://github.com/y2o-lab/storymesh)\
**npm**: [https://www.npmjs.com/package/storymesh](https://www.npmjs.com/package/storymesh)

## 背景・結論

現在、所属しているチームで共通利用するUIコンポーネントライブラリを作成しています。
このライブラリを作っていく上で、以下のようなケースが度々ありました。

- コンポーネントを作成だけ行い、`stories.tsx`ファイルのみ作成を忘れている
- そもそもそのStoryが必要か、また、Storyが足りているかの検知ができてない
- **AIでの開発でかなりの量が出てくるので仕組み化しないとそもそもレビューも何も追いつかない**

開発スタート時にあまりハーネスが整っておらず、AIが大量にコンポーネントを作成して上記のようなケースが大量にあり、レビュワーへの負荷がかなりあり、その辺りを後述のコンセプトの元、機械的に検知し、そもそもAIエージェント側に伝えることでレビュワーの負担軽減とそもそもの品質向上に繋げれないかと作成したツールです。
**ハーネスの一部となり得るツールを作るというのが大きいです。**

## Storymesh

StorymeshはStorybookを利用していることを前提とした、**機械的にstoriesファイルの漏れを検知**、**不足分の自動スケルトン作成**、**Storyの仕様を定義**し、それらの**Storyが実装されているかを検知する**OSSです。

### コンセプト

- storiesファイルの不足をCIにて機械的に拾いたい
- なければ自動でスケルトンを準備
- どういったStoryが必要かは最終的に人間が決めるべきと考えており、そもそもそのスペックをBDDのように定義してそれを満たすようにAIに実装してもらい、実装されているかどうかを機械的にCIなどで検知して漏れを防ぐ

> 実装されたStoryはそもそも[Storybook公式](https://storybook.js.org/docs/writing-tests/interaction-testing)に用意されているStoryのテストコードなどで実装内容が正しいかは拾う

AIエージェントの進化により開発手法は大きく変わり、人が確認して、コーディングしてとしていた時よりもより高速にかつ、面倒と感じるようなことや細かい定義でも一気に出力できるようになりました。

ただし、AIエージェントをハーネスにより制御しない限り、より欲しい結果を正確に出すことができません。

また、本質となる「何が本当に必要か」を判断、定義するのはあくまでも人間だと私は考えています。

そのため本ツールは、ハーネスの一部となること、人が定義した「何が本当に必要か」を抜け漏れなく実装することを大きなコンセプトとしています。

ではこれより使い方を見ていきます。

### 対応フレームワーク

- React
- Vue
- Angular
- Svelte

### 利用方法

#### インストール

今回はpnpmを例に説明します。
(他の方法は[こちら](https://github.com/y2o-lab/storymesh#installation)を参照ください。)

```bash
pnpm add -D storymesh
pnpm exec storymesh --help
```

![Storymesh CLIのヘルプ画面](https://static.zenn.studio/user-upload/eff8e5e58867-20261017.png)

---

#### Skillsの導入

本ツールをAIエージェントが用いるためのskillsは以下のコマンドで導入可能です。

```bash
npx skills add y2o-lab/storymesh --skill storymesh
```

---

#### 実際に実行してみる

##### 1. ストーリーがないコンポーネントを探す

たとえば、次のようなディレクトリがあるとします。

```text
src/components/
├── Button.tsx
├── Button.stories.tsx
└── Card.tsx
```

`Button`にはストーリーがあり、`Card`にはまだありません。この状態で`check`を実行します。

```sh
npx storymesh check src/components --framework react
```

この構成なら、次のように`Card.tsx`が表示されます。記事中の出力は、このサンプル構成に対する想定例です。

`check`は不足があると終了コード`1`を返します。

```text
Missing stories for 1 React component(s):
Card.tsx
```

判定は主にファイル名と配置をもとにしています。たとえば`Button.tsx`には`Button.stories.tsx`が対応します。コンポーネントと同じ場所のほか、直下の`stories`や`__stories__`ディレクトリに置いたストーリーも探します。

##### 2. どれくらい揃っているかを見る

不足の一覧だけでなく、全体の割合も見たいときは`coverage`を使います。

```sh
npx storymesh coverage src/components --framework react
```

```text
React Storybook coverage: 50.0% (1/2 components)
```

今回の例では、コンポーネント2つのうち1つにストーリーがあるので50%です。

割合と不足ファイルをまとめて見るなら、`report`で両方を表示できます。

```sh
npx storymesh report src/components --framework react
```

```text
React Storybook coverage: 50.0% (1/2 components)
Missing: 1
Card.tsx
```

##### 3. 足りないストーリーの雛形を作る

`--generate`を付けて雛形を作れます。このコマンドは、対象のディレクトリにファイルを書き込みます。

```sh
npx storymesh check src/components --framework react --generate
```

```text
Missing stories for 1 React component(s):
Card.tsx
Generated 1 story skeleton(s):
Card.stories.tsx
```

`Card.tsx`の隣に`Card.stories.tsx`が追加されます。既存のストーリーファイルは上書きしません。

生成されるのは最小限のストーリーです。必須のpropsがあれば`args`を補い、ローディング中やエラー時など、確認したい状態を追加していきます。Reactのexportをうまく認識できなかった場合は、`render: () => null`のプレースホルダーになるため、importや描画処理も確認してください。

##### 4. 対象に含めたくないファイルは除外する

Reactでは、`.tsx`や`.jsx`ファイルがコンポーネントとして数えられます。自動生成したファイルなど、ストーリーを管理する対象に含めたくないものもあるはずです。

一度だけ除外するなら、`--ignore`で指定できます。

```sh
npx storymesh check src/components --framework react --ignore 'generated/**'
```

毎回同じルールを使うなら、スキャン対象のルートに`.storymeshignore`を置きます。今回のコマンドなら、置き場所は`src/components/.storymeshignore`です。

```text
# 自動生成したコンポーネントは対象外
generated/
```

パターンはスキャン対象のルートからの相対パスで書きます。`.storymeshignore`は`.gitignore`形式で、コメントや`!`による再包含も使えます。

##### 5. YAMLで必要なStoryを定義しStoryの不足をチェック

Storybookのストーリーファイルが揃っていても、確認したい状態がすべて用意されているとは限りません。Buttonに通常時のStoryはあっても、ローディング中や無効状態のStoryは抜けているかもしれません。

例として、`src/components/Button.tsx`を次のようにします。

```tsx
type ButtonProps = {
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({ loading = false, disabled = false }: ButtonProps) {
  return (
    <button type="button" disabled={disabled || loading} aria-busy={loading}>
      {loading ? '保存中…' : '保存する'}
    </button>
  );
}
```

`src/components/Button.stories.tsx`には、まず`Default`だけを定義します。

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import Button from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
```

型のimport元は、プロジェクトで使っているStorybookの構成に合わせて調整してください。

この時点でストーリーファイルは存在します。通常の`check`ではButtonにストーリーがあると判定されますが、LoadingやDisabledの有無まではわかりません。

**このようなケースを拾うため、YAMLに「必要なStory」(spec)を定義しそれらが不足していないかをチェックします。**

これよりspecの定義とその検知について紹介します。
`.storymesh/specs/button.yml`を作成します。拡張子は`.yaml`も使えます。

```yaml
version: 1
component:
  id: button
  name: Button
  title: Components/Button
stories:
  - id: default
  - id: loading
```

`title`はStorybook側と完全一致させます。StoryのIDは表示名から作り、`Default`なら`default`、`Empty State`なら`empty-state`です。小文字にし、空白・アンダースコア・ハイフンの連続をハイフンに揃えます。

各Storyは標準で必須です。任意にする場合は`required: false`を付けます。

```sh
npx storybook index -o storybook-static/index.json &&
npx storymesh spec check --spec-dir .storymesh/specs --index storybook-static/index.json
```

`Default`しかなければ、`Loading`の不足が表示されます。出力例の抜粋です。

```text
Missing stories
  ✗ Button/loading
```

結果として、`FAIL`、終了コードは`1`を返します。
`Button.stories.tsx`に、たとえば次のStoryを追加します。
ここでは`loading`プロパティを持つButtonと、定義済みの`Story`型を想定しています。

```tsx
export const Loading: Story = { args: { loading: true } };
```

同じコマンドでindexを再生成してチェックすると、必要なStoryが揃い、`PASS`（終了コード`0`）になります。
Storyを変更するたびにindexも更新してください。

##### 6. 既存のStoryからymlを作成する

すでにStoryがある場合は、生成済みのindexからYAMLを作れます。

```sh
npx storymesh spec import --index storybook-static/index.json
```

既存の仕様ファイルは上書きしません。まだ作っていない状態は取り込まれないので、生成したYAMLに必要な状態を追記します。

> ⚠️ CIでもindexの生成と`spec check`を続けて実行すれば、必須Storyの追加漏れで失敗させられます。
> 未宣言のStoryに対する警告だけでは失敗しません。
> 確認できるのはStoryの登録までであり、描画や操作の正しさはStorybookや別のテストで確かめます。

## 最後に

Storymeshとは以下のコンセプトをもとに作成したOSSです。

> ※ Storybookを用いることが前提

- 機械的なstoriesファイルの抜け漏れ検知
- Storyの仕様定義とそれに沿った機械的な実装漏れ検知
- ハーネスの一部となる

今後はより、Storyをどのように機械的に検知していければ良いなと思っています。

ぜひ、使ってみてください！
また一緒に開発してくれる方も募集中です！！
ご意見などもお待ちしていますmm
