const { open } = window.__TAURI__.dialog;


//you need to slap this bitch in the 
class FolderPicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const button = document.createElement('button');
    button.textContent = 'Pick Folder';
    button.addEventListener('click', this.openFolderDialog.bind(this));

    shadow.appendChild(button);
  }

  openFolderDialog() {
    window.__TAURI__.dialog.open().then(result => {
      if (result) {
        alert(`Selected folder: ${result}`);
        // Here you can handle the selected folder path, for example, play MP3 files in the folder
      }
    }).catch(error => {
      console.error(error);
    });
  }
}

customElements.define('folder-picker', FolderPicker);