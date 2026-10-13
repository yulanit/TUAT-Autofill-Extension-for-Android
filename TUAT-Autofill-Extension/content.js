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

function showDonationButton() {
    const donationContainer = document.createElement('div');
    donationContainer.style.position = 'fixed';
    donationContainer.style.bottom = '0';
    donationContainer.style.left = '0';
    donationContainer.style.width = '100%';
    donationContainer.style.textAlign = 'center';
    donationContainer.style.backgroundColor = '#f8f9fa';
    donationContainer.style.padding = '10px';
    donationContainer.style.borderTop = '1px solid #dee2e6';
    donationContainer.style.zIndex = '9999';

    // ⚙️ 設定ボタン（右上に配置）
    const settingsBtn = document.createElement('div');
    settingsBtn.innerText = '⚙';
    settingsBtn.title = '拡張機能の設定を開く';
    settingsBtn.style.cssText = [
        'position: absolute',
        'top: 8px',
        'right: 12px',
        'width: 36px',
        'height: 36px',
        'border-radius: 50%',
        'background: #0d6efd',
        'color: #fff',
        'font-size: 20px',
        'line-height: 36px',
        'text-align: center',
        'cursor: pointer',
        'user-select: none',
        '-webkit-tap-highlight-color: transparent',
        'box-shadow: 0 2px 6px rgba(0,0,0,0.2)',
    ].join(';');
    settingsBtn.addEventListener('click', function () {
        toggleSettingsPanel();
    });

    const donationText = document.createElement('p');
    donationText.innerText = 'この拡張機能が役に立ったら、寄付を検討していただけると嬉しいです！';
    donationText.style.margin = '0 0 10px 0';
    donationText.style.fontSize = '14px';

    const donationLink = document.createElement('a');
    donationLink.href = 'https://www.buymeacoffee.com/yate';
    donationLink.target = '_blank';

    const donationImage = document.createElement('img');
    donationImage.src = 'https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png';
    donationImage.alt = 'Buy Me A Coffee';
    donationImage.style.height = '41px';
    donationImage.style.width = '174px';

    donationLink.appendChild(donationImage);
    donationContainer.appendChild(settingsBtn);
    donationContainer.appendChild(donationText);
    donationContainer.appendChild(donationLink);

    document.body.appendChild(donationContainer);
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
        'bottom: 90px',
        'right: 12px',
        'width: min(320px, calc(100vw - 24px))',
        'background: #fff',
        'border-radius: 12px',
        'box-shadow: 0 8px 32px rgba(0,0,0,0.25)',
        'z-index: 99999',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        'overflow: hidden',
    ].join(';');

    // 共通スタイル
    var labelStyle = 'display:block; font-size:13px; color:#555; margin-bottom:4px;';
    var inputStyle = [
        'display: block',
        'width: 100%',
        'padding: 8px 10px',
        'margin-bottom: 12px',
        'border: 1px solid #ced4da',
        'border-radius: 6px',
        'font-size: 14px',
        'box-sizing: border-box',
        'outline: none',
    ].join(';');

    settingsPanel.innerHTML = [
        '<div style="padding:12px 16px; background:#0d6efd; color:#fff; display:flex; justify-content:space-between; align-items:center;">',
        '  <strong style="font-size:15px;">TUAT Autofill 設定</strong>',
        '  <span id="tuat-panel-close" style="cursor:pointer; font-size:22px; line-height:1; padding:0 4px;">×</span>',
        '</div>',
        '<div style="padding:16px;">',
        '  <label style="' + labelStyle + '">ID</label>',
        '  <input type="text" id="tuat-cfg-id" placeholder="s123456a" style="' + inputStyle + '">',
        '  <div style="font-size:11px; color:#888; margin:-8px 0 12px;">s+数字6桁+アルファベットから構成されるID</div>',
        '  <label style="' + labelStyle + '">Password</label>',
        '  <input type="password" id="tuat-cfg-pass" style="' + inputStyle + '">',
        '  <div style="font-size:11px; color:#888; margin:-8px 0 12px;">パスワードを保存する場合は入力（非推奨）</div>',
        '  <label style="' + labelStyle + '">シークレットキー</label>',
        '  <div style="display:flex; gap:6px; margin-bottom:12px;">',
        '    <input type="password" id="tuat-cfg-key" style="' + inputStyle + 'margin-bottom:0; flex:1;">',
        '    <button id="tuat-toggle-key" style="width:40px; border:1px solid #ced4da; border-radius:6px; background:#fff; font-size:16px; cursor:pointer; flex-shrink:0;">👁</button>',
        '  </div>',
        '  <div style="font-size:11px; color:#888; margin-bottom:12px;">ワンタイムパスワードの生成キー</div>',
        '  <p id="tuat-totp-display" style="text-align:center; font-size:18px; font-weight:bold; color:#333; margin:12px 0; letter-spacing:2px;">現在のTOTP：未設定</p>',
        '  <button id="tuat-save-btn" style="width:100%; padding:10px; background:#0d6efd; color:#fff; border:none; border-radius:8px; font-size:15px; font-weight:bold; cursor:pointer;">Save</button>',
        '  <p id="tuat-save-status" style="text-align:center; color:#198754; font-size:13px; margin:8px 0 0; display:none;">✅ 保存しました</p>',
        '</div>',
    ].join('\n');

    document.body.appendChild(settingsPanel);

    // 閉じるボタン
    document.getElementById('tuat-panel-close').addEventListener('click', function () {
        settingsPanel.style.display = 'none';
    });

    // シークレットキー表示切替
    document.getElementById('tuat-toggle-key').addEventListener('click', function () {
        var keyInput = document.getElementById('tuat-cfg-key');
        if (keyInput.type === 'password') {
            keyInput.type = 'text';
            this.textContent = '🔒';
        } else {
            keyInput.type = 'password';
            this.textContent = '👁';
        }
    });

    // 保存ボタン
    document.getElementById('tuat-save-btn').addEventListener('click', function () {
        var id   = document.getElementById('tuat-cfg-id').value;
        var pass = document.getElementById('tuat-cfg-pass').value;
        var key  = document.getElementById('tuat-cfg-key').value;

        chrome.storage.local.set({ 'id': id, 'pass': pass, 'key': key }, function () {
            // TOTPプレビュー更新
            if (key && key.length > 0) {
                document.getElementById('tuat-totp-display').textContent = '現在のTOTP：' + totp(key);
            } else {
                document.getElementById('tuat-totp-display').textContent = '現在のTOTP：未設定';
            }
            // 保存完了メッセージ
            var status = document.getElementById('tuat-save-status');
            status.style.display = 'block';
            setTimeout(function () { status.style.display = 'none'; }, 3000);
        });
    });

    // 既存データを読み込み
    loadSettingsToPanel();
}

function loadSettingsToPanel() {
    chrome.storage.local.get(['id', 'pass', 'key'], function (items) {
        document.getElementById('tuat-cfg-id').value   = items.id   || '';
        document.getElementById('tuat-cfg-pass').value  = items.pass || '';
        document.getElementById('tuat-cfg-key').value   = items.key  || '';
        if (items.key && items.key.length > 0) {
            document.getElementById('tuat-totp-display').textContent = '現在のTOTP：' + totp(items.key);
        } else {
            document.getElementById('tuat-totp-display').textContent = '現在のTOTP：未設定';
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showDonationButton);
} else {
    showDonationButton();
}
