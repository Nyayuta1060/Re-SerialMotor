use serialport::{SerialPort, SerialPortType};
use std::io::{Read, Write};
use std::time::Duration;

const BAUD_RATE: u32 = 115200;
const TIMEOUT: Duration = Duration::from_secs(1);

pub struct SerialConnection {
    port: Box<dyn SerialPort>,
}

impl SerialConnection {
    /// 新しいシリアル接続を作成
    pub fn new(port_name: &str) -> Result<Self, String> {
        let port = serialport::new(port_name, BAUD_RATE)
            .timeout(TIMEOUT)
            .open()
            .map_err(|e| format!("Failed to open port: {}", e))?;

        Ok(Self { port })
    }

    /// コマンドを送信
    pub fn send_command(&mut self, command: &str) -> Result<(), String> {
        let command_with_newline = format!("{}\n", command);
        self.port
            .write_all(command_with_newline.as_bytes())
            .map_err(|e| format!("Failed to send command: {}", e))?;

        self.port
            .flush()
            .map_err(|e| format!("Failed to flush: {}", e))?;

        Ok(())
    }

    /// データを受信(将来の拡張用)
    #[allow(dead_code)]
    pub fn read_response(&mut self) -> Result<String, String> {
        let mut buffer = vec![0u8; 1024];
        match self.port.read(&mut buffer) {
            Ok(n) => {
                let response = String::from_utf8_lossy(&buffer[..n]).to_string();
                Ok(response)
            }
            Err(e) => Err(format!("Failed to read response: {}", e)),
        }
    }
}

/// 利用可能なシリアルポート一覧を取得
pub fn list_available_ports() -> Result<Vec<String>, String> {
    let ports =
        serialport::available_ports().map_err(|e| format!("Failed to list ports: {}", e))?;

    let port_names: Vec<String> = ports
        .into_iter()
        .filter_map(|port| {
            // USB/シリアルデバイスのみをフィルタリング
            match port.port_type {
                SerialPortType::UsbPort(_) | SerialPortType::Unknown => Some(port.port_name),
                _ => None,
            }
        })
        .collect();

    Ok(port_names)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_list_ports() {
        // ポート一覧の取得をテスト
        let result = list_available_ports();
        assert!(result.is_ok());
    }
}
