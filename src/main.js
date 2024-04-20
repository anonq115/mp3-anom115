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
    this.shadow = this.attachShadow({ mode: 'open' });
    this.button = this.createButton();
    this.fileList = this.createFileList();
    this.audioContext = null;
    this.bufferSource = null;
    this.buffer = null;
    this.selectedFilePath = null;

    this.shadow.appendChild(this.button);
    this.shadow.appendChild(this.fileList);
  }

  createButton() {
    const button = document.createElement('button');
    button.textContent = 'Select Folder';
    button.addEventListener('click', throttle(this.openFolderDialog.bind(this), 500)); // Throttle the click event
    return button;
  }

  createFileList() {
    return document.createElement('ul');
  }

  async openFolderDialog() {
    try {
      const result = await window.__TAURI__.dialog.open({ directory: true });
      if (result) {
        const files = await window.__TAURI__.fs.readDir(result);
        this.displayFiles(files);
      }
    } catch (error) {
      console.error('Error selecting or reading folder:', error);
    }
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
      if (this.bufferSource) {
        this.bufferSource.stop();
      }

      const result = await window.__TAURI__.fs.readBinaryFile(filePath);
      const arrayBuffer = result.buffer;
      
      if (!this.audioContext) {
        this.audioContext = new AudioContext();
      }

      this.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
        this.buffer = buffer;
        this.bufferSource = this.audioContext.createBufferSource();
        this.bufferSource.buffer = this.buffer;
        this.bufferSource.connect(this.audioContext.destination);
        this.bufferSource.start();
        console.log(`Playing file: ${filePath}`);
      });
    } catch (error) {
      console.error(`Error playing file: ${error}`);
    }
  }

  disconnectedCallback() {
    // Clean up resources
    if (this.bufferSource) {
      this.bufferSource.stop();
      this.bufferSource.disconnect();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

customElements.define('folder-picker', FolderPicker);