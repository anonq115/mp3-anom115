const { open } = window.__TAURI__.dialog;
const { invoke } = window.__TAURI__.tauri; 


//you need to slap configurations to the tauri json for code to work
function throttle(func, delay) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this, args);
        timer = null;
      }, delay);
    }
  };
}
class FolderPicker extends HTMLElement {
  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });

    const button = document.createElement('button');
    button.textContent = 'Select Folder';
    button.addEventListener('click', throttle(this.openFolderDialog.bind(this), 500)); // Throttle the click event

    this.fileList = document.createElement('ul');
    this.audioContext = new AudioContext();
    this.source = null;

    shadow.appendChild(button);
    shadow.appendChild(this.fileList);
  }

  async openFolderDialog() {
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

  async playFile(filePath) {
    try {
      const result = await window.__TAURI__.fs.readBinaryFile(filePath);
      const arrayBuffer = result.buffer; // Assuming result is a TypedArray
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      if (this.source) {
        this.source.stop();
      }
      this.source = this.audioContext.createBufferSource();
      this.source.buffer = audioBuffer;
      this.source.connect(this.audioContext.destination);
      this.source.start();
      console.log(`Playing file: ${filePath}`);
    } catch (error) {
      console.error(`Error playing file: ${error}`);
    }
  }
  
}

customElements.define('folder-picker', FolderPicker);
