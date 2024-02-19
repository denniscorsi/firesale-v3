import { ipcRenderer, contextBridge } from 'electron';
import Elements from './renderer/elements';
import { renderMarkdown } from './renderer/markdown';

ipcRenderer.on('file-opened', (_, content: string, filePath: string) => {
  Elements.MarkdownView.value = content;
  renderMarkdown(content);
});

contextBridge.exposeInMainWorld('api', {
  showOpenDialog: () => {
    ipcRenderer.send('show-open-dialog');
  },
  showExportDialog: (html: string) => {
    ipcRenderer.send('show-export-dialog', html);
  },
  saveFile: async (content: string) => {
    ipcRenderer.send('save-file', content);
  },
  newFile: () => {
    ipcRenderer.send('new-file');
  },
  checkForUnsavedChanges: async (content: string) => {
    const result = await ipcRenderer.invoke('has-changes', content);
    console.log({ result });
    return result;
  },
});
