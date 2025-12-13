# Re-SerialMotor

[SerialMotor](https://github.com/Nyayuta1060/Serial_Motor)のリメイク版

F446REマイコン経由でモータードライバーを制御するクロスプラットフォームGUIアプリケーション

## 概要

このプロジェクトは、STM32 F446RE Nucleoボードを使用して複数種類のモータードライバーを制御するためのデスクトップアプリケーションです。Rust + Tauriで実装され、Windows/Linux対応の実行可能ファイルとして配布されます。

## 対応デバイス

### Phase 1 (現在実装中)
- **丼モタ**: PWM 4ch制御、CAN通信経由

### Phase 2 (将来実装予定)
- **FirstPenguin**: PWM 4ch制御、エンコーダ/ADCフィードバック機能
- **RoboMaster C620**: RPM制御(最大8ch)

## 機能

- シリアルポート自動検出・接続
- PWM制御 (4ch): -32000 ~ 32000
- CAN ID設定
- 動作開始/停止
- 設定保存/読込(前回の設定を記憶)
- リアルタイムログ表示

## 開発環境

### 必要なツール

- **Rust** (1.77.2以降)
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **Node.js** (v16以降)
  ```bash
  # Ubuntu/Debian
  sudo apt install nodejs npm
  ```

- **システム依存ライブラリ** (Linux)
  ```bash
  sudo apt update
  sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libudev-dev
  ```

### プロジェクトのセットアップ

1. リポジトリをクローン
   ```bash
   git clone https://github.com/Nyayuta1060/Re-SerialMotor.git
   cd Re-SerialMotor
   ```

2. 依存関係をインストール
   ```bash
   cd gui
   npm install
   ```

3. 開発モードで起動
   ```bash
   npm run dev
   ```

4. ビルド(リリース版)
   ```bash
   npm run build
   ```
   
   ビルドされたバイナリは `gui/src-tauri/target/release/` に生成されます。

## 使用方法

### 基本的な操作

1. **接続**
   - アプリケーションを起動
   - ポート選択ドロップダウンからF446REが接続されているポートを選択
   - 「接続」ボタンをクリック

2. **モーター制御**
   - 「動作開始 (i)」ボタンをクリック
   - 各チャンネルのスライダーまたは数値入力でPWM値を設定(-32000 ~ 32000)
   - リアルタイムでモーターに反映されます

3. **停止**
   - 「動作停止 (o)」ボタンで全モーターを安全に停止
   - 「全CH 0に設定」で全チャンネルをゼロに

4. **切断**
   - 「切断」ボタンでシリアル接続を終了

### CAN ID設定

丼モタの場合、CAN IDを1~4の範囲で設定できます。

## 通信プロトコル

### 基本コマンド
- `i` - 動作開始
- `o` - 動作停止
- `md` - PWMモードに切り替え

### PWM制御
- `p0:[値]` - CH0のPWM設定 (例: `p0:1000`)
- `p1:[値]` - CH1のPWM設定
- `p2:[値]` - CH2のPWM設定
- `p3:[値]` - CH3のPWM設定
- `[値]` - 全チャンネル一括設定 (例: `0`)

### CAN設定
- `c[ID]` - CAN ID設定 (例: `c1`)

詳細は [memo.md](memo.md) を参照してください。

## プロジェクト構成

```
Re-SerialMotor/
├── gui/                    # GUIアプリケーション
│   ├── src/               # フロントエンド(HTML/CSS/JS)
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── main.js
│   ├── src-tauri/         # Tauriバックエンド(Rust)
│   │   ├── src/
│   │   │   ├── lib.rs     # メインロジック
│   │   │   └── serial.rs  # シリアル通信
│   │   ├── Cargo.toml
│   │   └── tauri.conf.json
│   └── package.json
├── Firmware/              # F446REファームウェア
│   ├── donmotor/         # 丼モタ用
│   ├── firstpenguin/     # FirstPenguin用
│   └── robomaster/       # RoboMaster用
└── memo.md               # 開発メモ・仕様書
```

## トラブルシューティング

### ポートが見つからない

- F446REが正しく接続されているか確認
- USBケーブルがデータ転送対応か確認
- Linux: ユーザーが `dialout` グループに所属しているか確認
  ```bash
  sudo usermod -a -G dialout $USER
  # ログアウト/ログインが必要
  ```

### 接続できない

- 他のアプリケーション(Arduinoシリアルモニタなど)がポートを使用していないか確認
- ボーレートが115200bpsに設定されているか確認

### ビルドエラー

- 必要なシステムライブラリがインストールされているか確認
- Rustが最新版か確認: `rustup update`

## ライセンス

このプロジェクトは開発中です。

## 貢献

Issue、Pull Requestを歓迎します。

## 関連リンク

- [Tauri](https://tauri.app/)
- [serialport-rs](https://github.com/serialport/serialport-rs)
- [PlatformIO](https://platformio.org/)
