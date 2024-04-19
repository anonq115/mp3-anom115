const { appWindow } = window.__TAURI__.window;
import { open } from '@tauri-apps/api/dialog';
import { appDataDir } from '@tauri-apps/api/path';
// Open a selection dialog for directories
const selected = await open({
  directory: true,
  multiple: true,
  defaultPath: await appDataDir(),
});
if (Array.isArray(selected)) {
  console.log('11111111asdasdasdasd') // user selected multiple directories 
} else if (selected === null) {
  // user cancelled the selection
} else {
  // user selected a single directory
}



console.log('asdasdasdasd')