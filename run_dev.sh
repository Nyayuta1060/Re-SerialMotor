#!/bin/bash

# Re-SerialMotor 開発モード実行スクリプト

echo "Re-SerialMotor を起動しています..."
echo ""
echo "注意: このスクリプトは開発モード用です。"
echo "     実機テストを行う場合は、F446REを接続してください。"
echo ""

cd "$(dirname "$0")/gui"

# dialoutグループの確認
if ! groups | grep -q dialout; then
    echo "警告: ユーザーが dialout グループに所属していません。"
    echo "      シリアルポートにアクセスするには、以下のコマンドを実行してください:"
    echo "      sudo usermod -a -G dialout \$USER"
    echo "      その後、ログアウト/ログインが必要です。"
    echo ""
fi

# Tauriの実行
echo "Tauri を起動中..."
cargo run --manifest-path=src-tauri/Cargo.toml
