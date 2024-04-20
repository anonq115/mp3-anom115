const { open } = window.__TAURI__.dialog;
const { invoke } = window.__TAURI__.tauri; 


//you need to slap this bitch in the 
class FolderPicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const button = document.createElement('button');
    button.textContent = 'Select Folder';
    button.addEventListener('click', this.openFolderDialog.bind(this));

    this.fileList = document.createElement('ul');

    shadow.appendChild(button);
    shadow.appendChild(this.fileList);
  }

  openFolderDialog() {
    window.__TAURI__.dialog.open({ directory: true }).then(result => {
      if (result) {
        window.__TAURI__.fs.readDir(result).then(files => {
          this.displayFiles(files);
        }).catch(error => {
          console.error('Error reading directory:', error);
        });
      }
    }).catch(error => {
      console.error('Error selecting folder:', error);
    });
  }

  displayFiles(files) {
    this.fileList.innerHTML = '';
    files.forEach(file => {
      const listItem = document.createElement('li');
      const fileLink = document.createElement('a');
      fileLink.textContent = file.name;
      fileLink.href = '#';
      fileLink.addEventListener('click', (event) => {
        event.preventDefault();
        this.playFile(file.path);
      });
      listItem.appendChild(fileLink);
      this.fileList.appendChild(listItem);
    });
  }
  playFile(filePath) {
    window.__TAURI__.fs.readBinaryFile(filePath).then(result => {
      const blob = new Blob([result], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play()
        .then(() => {
          console.log(`Playing file: ${filePath}`);
          URL.revokeObjectURL(url); // Release the blob URL
        })
        .catch(error => {
          console.error(`Error playing file: ${error}`);
          URL.revokeObjectURL(url); // Release the blob URL
        });
    }).catch(error => {
      console.error(`Error reading file: ${error}`);
    });
  }
  
}

customElements.define('folder-picker', FolderPicker);
