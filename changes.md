# 変更点(1.1.0 → 0.3.6-open)

## content.json
(0.3.6のまま)

- 0.3.6 はファイル規模が大きい（約400行）。1.1.0 は約134行。
- 0.3.6 には「画面内設定UI（設定ボタン・設定パネル・TOTPタイマー表示・保存処理）」が実装されている。
- 1.1.0 側には上記UI関連の関数がなく、`showDonationButton()` 中心の構成になっている。
- つまり 0.3.6 は Android Edge 向けのインライン設定機能を含む版、1.1.0 はその部分が入っていないシンプル版。


## manifest.json
web_accessible_resourcesの項目があるとcrxからインストールして確認するのができなかったため消してたが戻しておいた。


- それ以外（`manifest_version`, `name`, `version`, `description`, `permissions`, `content_scripts`, `icons`, `options_ui`）は同一。
