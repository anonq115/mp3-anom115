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
    this.currentAudio = new Audio(); // Create a single Audio object for playback

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
      const blob = new Blob([result], { type: 'audio/mp3' });
      const url = URL.createObjectURL(blob);

      if (this.currentAudio.src !== url) {
        // Only update the src if it's different from the current audio src
        this.currentAudio.pause();
        this.currentAudio.src = url;
        this.currentAudio.load(); // Load the new audio file
      }

      this.currentAudio.play()
        .then(() => {
          console.log(`Playing file: ${filePath}`);
          URL.revokeObjectURL(url); // Release the blob URL
        })
        .catch(error => {
          console.error(`Error playing file: ${error}`);
          URL.revokeObjectURL(url); // Release the blob URL
        });
    } catch (error) {
      console.error(`Error reading file: ${error}`);
    }
  }
}

customElements.define('folder-picker', FolderPicker);
