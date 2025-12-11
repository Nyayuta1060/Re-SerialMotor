# リメイク仕様・計画

## プロジェクト概要
Serial_Motorのリメイク版を作成。クロスプラットフォーム対応(Windows/Linux)で、GitHub Releasesを通じて配布可能な形式にする。

## 目的
- 既存のPython/Tkinter実装をより保守性・配布性の高い形に刷新
- クロスプラットフォーム対応(Windows/Linux)
- GitHub Releasesによる簡単な配布
- F446REファームウェアとのシリアル通信によるモーター制御

## 配布形態
- **GUIアプリケーション**: 実行可能ファイル(exe/バイナリ)
- **F446REファームウェア**: platformio.iniとソースコードのzipファイル
- **配布方法**: GitHub Releases

## 現在の機能(移行対象)
- シリアルポート選択・接続
- PWM制御 (4ch): -32000 ~ 32000
- 通信プロトコル: 115200 bps

## 将来実装予定
- RoboMaster C620モーター制御 (8ch): -10000 ~ 10000 (Phase 2)

## 技術選定候補

### GUI実装言語・フレームワーク
1. **Rust**
   - メリット: 高速、メモリ安全、クロスコンパイル容易
   - フレームワーク候補:
     - egui: 即座にレンダリング、軽量
     - iced: Elm風、宣言的UI
     - Tauri: Web技術(HTML/CSS/JS) + Rust、Electron代替
     - Dioxus: React風、クロスプラットフォーム

2. **Elixir**
   - メリット: 並行処理に強い、Phoenix LiveView
   - デメリット: ErlangVM必要、バイナリサイズ大

3. **その他検討事項**
   - Python(PyInstaller): 既存コード流用可能だがバイナリサイズ大
   - Go: シンプル、シングルバイナリ生成容易

### 採用: Rust + Tauri
**理由:**
- Web技術(HTML/CSS/JavaScript)でUIを構築でき、既存のレイアウトを移植しやすい
- Rustでシリアル通信を実装(serialportクレート使用)
- クロスプラットフォーム対応が容易
- バイナリサイズが小さい(Pythonのexeより圧倒的に軽量)
- GitHub Actionsでビルド自動化可能
- 活発なコミュニティとドキュメント

## 機能要件

### 必須機能(Phase 1)
- [ ] シリアルポート自動検出・選択
- [ ] 接続/切断機能
- [ ] PWM制御 (4ch)
- [ ] FirstPenguin基板対応(仕様後日追加)
- [ ] 入力値バリデーション
- [ ] エラーハンドリング・ユーザーへのフィードバック
- [ ] 設定保存/読込(前回の設定を記憶)

### 拡張機能(Phase 2以降)
- [ ] RoboMaster C620制御 (8ch) - 特殊な仕様のため後回し
- [ ] コマンド履歴
- [ ] グラフ表示(モーター速度など)
- [ ] 複数デバイス同時接続

## アーキテクチャ設計

### ディレクトリ構成案
```
Re-SerialMotor/
├── gui/                    # GUIアプリケーション
│   ├── src/               # Rustソースコード
│   ├── src-tauri/         # Tauriバックエンド
│   ├── public/            # フロントエンド(HTML/CSS/JS)
│   └── Cargo.toml
├── firmware/              # F446REファームウェア
│   ├── platformio.ini
│   ├── src/
│   └── lib/
├── docs/                  # ドキュメント
└── .github/workflows/     # CI/CD設定
```

### 通信プロトコル
- ボーレート: 115200 bps
- コマンド形式: (要確認・既存プロトコルを調査)
- タイムアウト: 1秒

## 実装ステップ

### Phase 1: 基本設計
- [ ] 既存コードの詳細分析
- [ ] 通信プロトコル仕様の文書化
- [ ] UIモックアップ作成

### Phase 2: GUI実装(コア機能)
- [ ] プロジェクトセットアップ(Tauri)
- [ ] シリアル通信機能実装(Rust)
- [ ] UI実装(ポート選択、接続管理)
- [ ] PWM制御UI実装
- [ ] FirstPenguin基板対応UI実装
- [ ] 設定保存/読込機能

### Phase 3: ファームウェア整理
- [ ] F446REコードの整理・コメント追加
- [ ] ビルド手順のドキュメント化

### Phase 4: 配布準備
- [ ] GitHub Actions設定(クロスプラットフォームビルド)
- [ ] Release自動化
- [ ] README/ドキュメント整備

### Phase 5: テスト・リリース
- [ ] 実機テスト
- [ ] バグフィックス
- [ ] v1.0.0リリース

## 決定事項

### 技術スタック
- **GUI**: Rust + Tauri
- **ファームウェア**: PlatformIO + mbed (維持)
- **配布**: GitHub Releases (Windows/Linux)
- **ビルド自動化**: GitHub Actions

### 対応デバイス
1. **F446RE** (既存)
2. **FirstPenguin** (自作基板、仕様後日追加)

### 機能方針
- ログファイル出力: **削除**(シンプル化のため)
- 設定保存/読込: 実装(前回の接続設定などを記憶)
- RoboMaster C620: Phase 2以降に実装(特殊な仕様のため)
- macOS対応: 将来的に検討(当面はWindows/Linux優先)

## 次のステップ

### 優先度A: 仕様確認
- [ ] FirstPenguin基板の詳細仕様確認
  - 通信プロトコル
  - 制御パラメータ
  - 機能要件
- [ ] 既存F446REの通信プロトコル詳細分析

### 優先度B: 開発環境構築
- [ ] Rust開発環境セットアップ
- [ ] Tauri CLIインストール
- [ ] プロジェクト雛形作成

## 参考リンク
- [Tauri](https://tauri.app/)
- [serialport-rs](https://github.com/serialport/serialport-rs)
- [egui](https://github.com/emilk/egui)
- [iced](https://github.com/iced-rs/iced)
