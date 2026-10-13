# 変更点メモ（0.3.6 vs 1.1.0）

比較対象:
- `TUAT-AE-for-Android-0.3.6/TUAT-Autofill-Extension/content.js`
- `TUAT-Autofill-Extension-1.1.0/TUAT-Autofill-Extension/content.js`
- `TUAT-AE-for-Android-0.3.6/TUAT-Autofill-Extension/manifest.json`
- `TUAT-Autofill-Extension-1.1.0/TUAT-Autofill-Extension/manifest.json`

## content.js
- 0.3.6 はファイル規模が大きい（約400行）。1.1.0 は約134行。
- 0.3.6 には「画面内設定UI（設定ボタン・設定パネル・TOTPタイマー表示・保存処理）」が実装されている。
- 1.1.0 側には上記UI関連の関数がなく、`showDonationButton()` 中心の構成になっている。
- つまり 0.3.6 は Android Edge 向けのインライン設定機能を含む版、1.1.0 はその部分が入っていないシンプル版。

## manifest.json
- 差分は 1 点のみ。
- 0.3.6 にだけ `web_accessible_resources` が追加されている。

```json
"web_accessible_resources": [
	{
		"resources": ["icon128.png"],
		"matches": ["https://tuat.ex-tic.com/*"]
	}
]
```

- それ以外（`manifest_version`, `name`, `version`, `description`, `permissions`, `content_scripts`, `icons`, `options_ui`）は同一。
