use std::sync::Mutex;
use tauri::State;

mod serial;

// アプリケーション状態
pub struct AppState {
    serial: Mutex<Option<serial::SerialConnection>>,
}

#[tauri::command]
fn list_ports() -> Result<Vec<String>, String> {
    serial::list_available_ports()
}

#[tauri::command]
fn connect_port(port_name: String, state: State<AppState>) -> Result<(), String> {
    let connection = serial::SerialConnection::new(&port_name)?;
    let mut serial_state = state.serial.lock().unwrap();
    *serial_state = Some(connection);
    Ok(())
}

#[tauri::command]
fn disconnect_port(state: State<AppState>) -> Result<(), String> {
    let mut serial_state = state.serial.lock().unwrap();
    *serial_state = None;
    Ok(())
}

#[tauri::command]
fn send_command(command: String, state: State<AppState>) -> Result<(), String> {
    let mut serial_state = state.serial.lock().unwrap();
    if let Some(ref mut connection) = *serial_state {
        connection.send_command(&command)?;
        Ok(())
    } else {
        Err("Not connected to any port".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .manage(AppState {
            serial: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            list_ports,
            connect_port,
            disconnect_port,
            send_command
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
