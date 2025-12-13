const { invoke } = window.__TAURI__.core;

// 状態管理
let isConnected = false;
let currentPort = '';
let pwmValues = [0, 0, 0, 0];

// DOMが読み込まれたら初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
    loadSettings();
    refreshPorts();
});

// UI初期化
function initializeUI() {
    // ポート更新ボタン
    document.getElementById('refresh-btn').addEventListener('click', refreshPorts);
    
    // 接続/切断ボタン
    document.getElementById('connect-btn').addEventListener('click', connect);
    document.getElementById('disconnect-btn').addEventListener('click', disconnect);
    
    // 動作開始/停止ボタン
    document.getElementById('start-btn').addEventListener('click', startMotor);
    document.getElementById('stop-btn').addEventListener('click', stopMotor);
    
    // CAN ID設定ボタン
    document.getElementById('set-can-btn').addEventListener('click', setCanId);
    
    // 全CH 0設定ボタン
    document.getElementById('all-zero-btn').addEventListener('click', setAllZero);
    
    // ログクリアボタン
    document.getElementById('clear-log-btn').addEventListener('click', clearLog);
    
    // PWMチャンネルごとのイベントリスナー
    for (let i = 0; i < 4; i++) {
        const slider = document.getElementById(`pwm${i}-slider`);
        const input = document.getElementById(`pwm${i}-input`);
        const resetBtn = document.querySelectorAll('.btn-reset')[i];
        
        slider.addEventListener('input', () => {
            input.value = slider.value;
            pwmValues[i] = parseInt(slider.value);
            sendPwmCommand(i, pwmValues[i]);
        });
        
        input.addEventListener('change', () => {
            let value = parseInt(input.value);
            value = Math.max(-32000, Math.min(32000, value));
            input.value = value;
            slider.value = value;
            pwmValues[i] = value;
            sendPwmCommand(i, pwmValues[i]);
        });
        
        resetBtn.addEventListener('click', () => {
            slider.value = 0;
            input.value = 0;
            pwmValues[i] = 0;
            sendPwmCommand(i, 0);
        });
    }
}

// シリアルポート一覧を取得
async function refreshPorts() {
    try {
        addLog('ポート一覧を取得中...', 'info');
        const ports = await invoke('list_ports');
        const select = document.getElementById('port-select');
        select.innerHTML = '<option value="">ポートを選択してください</option>';
        
        if (ports.length === 0) {
            addLog('利用可能なポートが見つかりません', 'warning');
            return;
        }
        
        ports.forEach(port => {
            const option = document.createElement('option');
            option.value = port;
            option.textContent = port;
            select.appendChild(option);
        });
        
        addLog(`${ports.length}個のポートを検出しました`, 'success');
    } catch (error) {
        addLog(`エラー: ${error}`, 'error');
    }
}

// 接続
async function connect() {
    const select = document.getElementById('port-select');
    const port = select.value;
    
    if (!port) {
        addLog('ポートを選択してください', 'warning');
        return;
    }
    
    try {
        addLog(`${port}に接続中...`, 'info');
        await invoke('connect_port', { portName: port });
        
        isConnected = true;
        currentPort = port;
        updateConnectionUI(true);
        addLog(`${port}に接続しました`, 'success');
        
        // PWMモードに切り替え
        await invoke('send_command', { command: 'md' });
        addLog('PWMモードに設定しました', 'info');
        
        saveSettings();
    } catch (error) {
        addLog(`接続エラー: ${error}`, 'error');
        updateConnectionUI(false);
    }
}

// 切断
async function disconnect() {
    try {
        // 動作停止してから切断
        await stopMotor();
        await invoke('disconnect_port');
        
        isConnected = false;
        currentPort = '';
        updateConnectionUI(false);
        addLog('切断しました', 'info');
    } catch (error) {
        addLog(`切断エラー: ${error}`, 'error');
    }
}

// 動作開始
async function startMotor() {
    try {
        await invoke('send_command', { command: 'i' });
        addLog('動作を開始しました', 'success');
    } catch (error) {
        addLog(`エラー: ${error}`, 'error');
    }
}

// 動作停止
async function stopMotor() {
    try {
        await invoke('send_command', { command: 'o' });
        addLog('動作を停止しました', 'warning');
    } catch (error) {
        addLog(`エラー: ${error}`, 'error');
    }
}

// PWMコマンド送信
async function sendPwmCommand(channel, value) {
    if (!isConnected) return;
    
    try {
        const command = `p${channel}:${value}`;
        await invoke('send_command', { command });
        addLog(`CH${channel}: ${value}`, 'info');
    } catch (error) {
        addLog(`PWM送信エラー: ${error}`, 'error');
    }
}

// CAN ID設定
async function setCanId() {
    const canId = document.getElementById('can-id').value;
    
    try {
        const command = `c${canId}`;
        await invoke('send_command', { command });
        addLog(`CAN ID を ${canId} に設定しました`, 'success');
    } catch (error) {
        addLog(`CAN ID設定エラー: ${error}`, 'error');
    }
}

// 全CH 0設定
async function setAllZero() {
    for (let i = 0; i < 4; i++) {
        document.getElementById(`pwm${i}-slider`).value = 0;
        document.getElementById(`pwm${i}-input`).value = 0;
        pwmValues[i] = 0;
    }
    
    try {
        await invoke('send_command', { command: '0' });
        addLog('全チャンネルを0に設定しました', 'success');
    } catch (error) {
        addLog(`エラー: ${error}`, 'error');
    }
}

// UI更新
function updateConnectionUI(connected) {
    document.getElementById('connect-btn').disabled = connected;
    document.getElementById('disconnect-btn').disabled = !connected;
    document.getElementById('port-select').disabled = connected;
    document.getElementById('refresh-btn').disabled = connected;
    
    // PWM制御の有効/無効
    const pwmInputs = document.querySelectorAll('.pwm-section input, .pwm-section button:not(#clear-log-btn)');
    pwmInputs.forEach(input => {
        input.disabled = !connected;
    });
    
    // ステータス表示
    const status = document.getElementById('status');
    if (connected) {
        status.textContent = `接続中: ${currentPort}`;
        status.className = 'status connected';
    } else {
        status.textContent = '未接続';
        status.className = 'status disconnected';
    }
}

// ログ追加
function addLog(message, type = 'info') {
    const logOutput = document.getElementById('log-output');
    const timestamp = new Date().toLocaleTimeString('ja-JP');
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${timestamp}] ${message}`;
    logOutput.appendChild(entry);
    logOutput.scrollTop = logOutput.scrollHeight;
}

// ログクリア
function clearLog() {
    document.getElementById('log-output').innerHTML = '';
    addLog('ログをクリアしました', 'info');
}

// 設定保存
function saveSettings() {
    const settings = {
        port: currentPort,
        canId: document.getElementById('can-id').value,
        pwmValues: pwmValues
    };
    localStorage.setItem('serialMotorSettings', JSON.stringify(settings));
}

// 設定読み込み
function loadSettings() {
    const saved = localStorage.getItem('serialMotorSettings');
    if (!saved) return;
    
    try {
        const settings = JSON.parse(saved);
        
        if (settings.canId) {
            document.getElementById('can-id').value = settings.canId;
        }
        
        if (settings.pwmValues) {
            pwmValues = settings.pwmValues;
            for (let i = 0; i < 4; i++) {
                document.getElementById(`pwm${i}-slider`).value = pwmValues[i];
                document.getElementById(`pwm${i}-input`).value = pwmValues[i];
            }
        }
        
        addLog('前回の設定を復元しました', 'info');
    } catch (error) {
        console.error('設定読み込みエラー:', error);
    }
}
