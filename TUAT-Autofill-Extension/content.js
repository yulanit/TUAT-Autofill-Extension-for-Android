function totp(key) {
    // 共有シークレット Google AuthenticatorはBase32文字列、SlinkPassはBase64文字列。
    // ワンタイムパスワードの時間間隔 Google Authenticatorは30秒、SlinkPassは60秒。
    // ワンタイムパスワードの桁数     Google Authenticatorは6桁、 SlinkPassは8桁。
    // 現在のエポック時刻を基にカウンタ計算
    var secret = base32tohex(key);  
    var digits = 6;
    var period = 30;
    var epoch  = new Date().getTime() / 1000;
    // カウンタとシークレットを十六進に変換、8バイトとのカウンター値を取得
    var count = parseInt(epoch / period);
    var arrCnt = new Array(8);
    for (i = arrCnt.length - 1; i >= 0; i--) {
        arrCnt[i] = dec2hex(count & 0xff);
        count >>= 8;
    }
    var hexCnt = CryptoJS.enc.Hex.parse(arrCnt.join(''));
    var hexSrt = CryptoJS.enc.Hex.parse(secret);
    // HMAC-SHA1でハッシュ値を生成
    var hexHmac = CryptoJS.HmacSHA1(hexCnt, hexSrt).toString(CryptoJS.enc.Hex);
    // ハッシュ値の20バイト目の下位4ビットを取り出しオフセット値とする
    var arrHmac = new Array();
    for (i = 0; i < hexHmac.length; i = i + 2) {
        arrHmac.push(hex2dec(hexHmac.substr(i, 2)));
    }
    var offset = arrHmac[arrHmac.length - 1] & 0xf;
    // オフセット値をハッシュ値のバイト列に当てはめ、そこから31ビット取り出す
    var truncate = hex2dec(hexHmac.substr(offset * 2, 8)) & 0x7fffffff;
    // 出力する桁数に合わせて切り詰める
    var otp = truncate % Math.pow(10, digits);
    // 桁数足りなかったら、前頭に0を補足してさい。
    while (otp.toString().length < digits) {
        otp = '0' + otp;
    }
    return otp;
}
// ライブラリ
function hex2dec(h) { return parseInt(h, 16); }
function dec2hex(d) { return ('0' + (Number(d).toString(16))).slice(-2); }
function leftpad(str, len, pad) {
    if (len + 1 >= str.length) {
        str = Array(len + 1 - str.length).join(pad) + str;
    }
    return str;
}
function base32tohex(base32) {
    var base32chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    var bits = "";
    var hex = "";
    for (var i = 0; i < base32.length; i++) {
        var val = base32chars.indexOf(base32.charAt(i).toUpperCase());
        bits += leftpad(val.toString(2), 5, '0');
    }
    for (var i = 0; i+4 <= bits.length; i+=4) {
        var chunk = bits.substr(i, 4);
        hex = hex + parseInt(chunk, 2).toString(16) ;
    }
    return hex;
}

document.getElementByXPath = function(sValue) { var a = this.evaluate(sValue, this, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null); if (a.snapshotLength > 0) { return a.snapshotItem(0); } };

(function () {
    chrome.storage.local.get(['id','pass','key'], function (items) {
        const ID = items.id;
        const PASS = items.pass;
        const KEY = items.key;

        var uri = new URL(window.location.href);
        if(uri.pathname == '/auth/session'){
            var id = document.getElementById('identifier');
            var pass = document.getElementById('password');
            if(typeof ID === "undefined"){
                ID = '';
            }
            if(typeof PASS === "undefined"){
                PASS = '';
            }
            id.value = ID;
            pass.value = PASS;
            document.getElementByXPath('//*[@id="login"]/button').click();
        }
        if(uri.pathname == '/auth/session/second_factor'){
            document.getElementById('totp-form-selector').click();
            if(typeof KEY === "undefined"){
                document.getElementById('totp').value = '';
            }
            else{
                document.getElementById('totp').value = totp(KEY);
                document.getElementByXPath('//*[@id="totp-form"]/button').click();
            }
        }
    });
})();

// === Inline Settings UI for Android Edge ===
var _0x1a2b = 0x1; // internal render flag

// Material Symbols フォント読み込み
(function loadMaterialSymbols() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=block';
    document.head.appendChild(link);

    // アイコンの基本スタイルを注入
    var style = document.createElement('style');
    style.textContent = '.tuat-ms{font-family:"Material Symbols Outlined";font-style:normal;font-size:20px;display:inline-block;line-height:1;letter-spacing:normal;text-transform:none;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 24}';
    document.head.appendChild(style);
})();

function showSettingsButton() {
    var logoUrl = chrome.runtime.getURL('logo.png');

    var btn = document.createElement('div');
    btn.title = 'TUAT Autofill 設定';
    btn.style.cssText = [
        'position: fixed',
        'bottom: 20px',
        'right: 16px',
        'width: 48px',
        'height: 48px',
        'border-radius: 50%',
        'background: #fff',
        'cursor: pointer',
        'z-index: 99999',
        'box-shadow: 0 2px 8px rgba(77,132,180,0.35)',
        'user-select: none',
        '-webkit-tap-highlight-color: transparent',
        'overflow: hidden',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'transition: box-shadow 0.2s ease',
    ].join(';');

    var img = document.createElement('img');
    img.src = logoUrl;
    img.style.cssText = 'width:40px; height:40px; pointer-events:none;';

    btn.appendChild(img);
    btn.addEventListener('click', function () {
        toggleSettingsPanel();
    });

    document.body.appendChild(btn);
}

// === インライン設定パネル ===
var settingsPanel = null;

function toggleSettingsPanel() {
    if (settingsPanel) {
        settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
        if (settingsPanel.style.display === 'block') {
            loadSettingsToPanel();
        }
        return;
    }
    createSettingsPanel();
}

function createSettingsPanel() {
    settingsPanel = document.createElement('div');
    settingsPanel.style.cssText = [
        'position: fixed',
        'bottom: 76px',
        'right: 12px',
        'width: min(320px, calc(100vw - 24px))',
        'background: #FFFFFF',
        'border: 2px solid #4d84b4',
        'border-radius: 15px',
        'box-shadow: 0 10px 30px rgba(0,0,0,0.2)',
        'z-index: 99999',
        'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif',
        'overflow: hidden',
        'color: #1C1B1F',
    ].join(';');

    // ヘッダー
    var headerHtml = [
        '<div style="padding:14px 16px; background:#4d84b4; display:flex; justify-content:space-between; align-items:center;">',
        '  <span style="font-size:15px; font-weight:700; color:#fff;">TUAT Autofill 設定</span>',
        '  <span id="tuat-panel-close" class="tuat-ms" style="color:#fff; cursor:pointer; font-size:22px;">close</span>',
        '</div>',
    ].join('');

    // フォーム本体（シークレットキーのみ）
    var bodyHtml = [
        '<div style="padding:20px 16px 16px;">',
        // ラベル
        '  <label style="display:block; font-size:13px; font-weight:500; color:#49454F; margin-bottom:6px;">シークレットキー</label>',
        // 入力フィールド + visibility アイコンを1つの枠内に
        '  <div id="tuat-key-container" style="position:relative; margin-bottom:6px;">',
        '    <input type="password" id="tuat-cfg-key" placeholder="Base32形式のキーを入力"',
        '      style="display:block; width:100%; padding:12px 44px 12px 12px; border:1px solid #CAC4D0; border-radius:4px; font-size:14px; box-sizing:border-box; outline:none; background:#fff; color:#1C1B1F; transition:border-color 0.2s;">',
        '    <span id="tuat-toggle-key" class="tuat-ms" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); cursor:pointer; color:#49454F; user-select:none;">visibility</span>',
        '  </div>',
        '  <div style="font-size:11px; color:#79747E; margin-bottom:16px;">ワンタイムパスワードの生成に使用するキー</div>',
        // TOTPプレビュー
        '  <div id="tuat-totp-display" style="text-align:center; font-size:24px; font-weight:700; color:#1C1B1F; margin:16px 0; letter-spacing:4px; font-family:monospace;">未設定</div>',
        // Saveボタン
        '  <button id="tuat-save-btn" style="width:100%; padding:10px 24px; background:#4d84b4; color:#fff; border:none; border-radius:20px; font-size:14px; font-weight:700; cursor:pointer; letter-spacing:0.5px; transition:background 0.2s;">Save</button>',
        // 保存ステータス
        '  <p id="tuat-save-status" style="text-align:center; color:#198754; font-size:13px; margin:10px 0 0; display:none;"></p>',
        '</div>',
    ].join('\n');

    // Buy Me a Coffee フッター（トグル制御）
    var footerHtml = '';
    if (_0x1a2b) {
        footerHtml = [
            '<div style="border-top:1px solid #E0E0E0; padding:12px 16px; text-align:center;">',
            '  <p style="font-size:12px; color:#79747E; margin:0 0 8px;">この拡張機能が役に立ったら、寄付を検討していただけると嬉しいです！</p>',
            '  <a href="https://www.buymeacoffee.com/yate" target="_blank">',
            '    <img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height:36px; width:auto;">',
            '  </a>',
            '</div>',
        ].join('\n');
    }

    settingsPanel.innerHTML = headerHtml + bodyHtml + footerHtml;
    document.body.appendChild(settingsPanel);

    // --- イベントリスナー ---

    // 閉じるボタン
    document.getElementById('tuat-panel-close').addEventListener('click', function () {
        settingsPanel.style.display = 'none';
    });

    // 入力フィールドのフォーカススタイル
    var keyInput = document.getElementById('tuat-cfg-key');
    keyInput.addEventListener('focus', function () {
        this.style.borderColor = '#4d84b4';
        this.style.borderWidth = '2px';
        this.style.padding = '11px 43px 11px 11px'; // 2px枠線分を補正
    });
    keyInput.addEventListener('blur', function () {
        this.style.borderColor = '#CAC4D0';
        this.style.borderWidth = '1px';
        this.style.padding = '12px 44px 12px 12px';
    });

    // シークレットキー表示切替（Material Symbols）
    document.getElementById('tuat-toggle-key').addEventListener('click', function () {
        var inp = document.getElementById('tuat-cfg-key');
        if (inp.type === 'password') {
            inp.type = 'text';
            this.textContent = 'visibility_off';
        } else {
            inp.type = 'password';
            this.textContent = 'visibility';
        }
    });

    // 保存ボタン
    document.getElementById('tuat-save-btn').addEventListener('click', function () {
        var key = document.getElementById('tuat-cfg-key').value;

        chrome.storage.local.set({ 'key': key }, function () {
            var statusEl = document.getElementById('tuat-save-status');

            if (key && key.length > 0) {
                var totpValue = totp(key);
                document.getElementById('tuat-totp-display').textContent = totpValue;

                // クリップボードにTOTPをコピー
                var copyMsg = '';
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(totpValue).then(function () {
                        statusEl.textContent = '✅ 保存しました（TOTP: ' + totpValue + ' をコピー済み）';
                        statusEl.style.display = 'block';
                        setTimeout(function () { statusEl.style.display = 'none'; }, 4000);
                    }).catch(function () {
                        statusEl.textContent = '✅ 保存しました';
                        statusEl.style.display = 'block';
                        setTimeout(function () { statusEl.style.display = 'none'; }, 3000);
                    });
                } else {
                    statusEl.textContent = '✅ 保存しました';
                    statusEl.style.display = 'block';
                    setTimeout(function () { statusEl.style.display = 'none'; }, 3000);
                }
            } else {
                document.getElementById('tuat-totp-display').textContent = '未設定';
                statusEl.textContent = '✅ 保存しました';
                statusEl.style.display = 'block';
                setTimeout(function () { statusEl.style.display = 'none'; }, 3000);
            }
        });
    });

    // 既存データを読み込み
    loadSettingsToPanel();
}

function loadSettingsToPanel() {
    chrome.storage.local.get(['key'], function (items) {
        document.getElementById('tuat-cfg-key').value = items.key || '';
        if (items.key && items.key.length > 0) {
            document.getElementById('tuat-totp-display').textContent = totp(items.key);
        } else {
            document.getElementById('tuat-totp-display').textContent = '未設定';
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showSettingsButton);
} else {
    showSettingsButton();
}
