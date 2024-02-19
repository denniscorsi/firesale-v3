import { renderMarkdown } from './markdown';
import Elements from './elements';

Elements.MarkdownView.addEventListener('input', async () => {
  const markdown = Elements.MarkdownView.value;
  renderMarkdown(markdown);
  const hasChanged = await window.api.checkForUnsavedChanges(markdown);
  Elements.SaveMarkdownButton.disabled = !hasChanged;
  Elements.RevertButton.disabled = !hasChanged;
});

Elements.OpenFileButton.addEventListener('click', () => {
  window.api.showOpenDialog();
});

Elements.ExportHtmlButton.addEventListener('click', () => {
  const html = Elements.RenderedView.innerHTML;
  window.api.showExportDialog(html);
});

Elements.SaveMarkdownButton.addEventListener('click', () => {
  const content = Elements.MarkdownView.value;
  window.api.saveFile(content);
});

Elements.NewFileButton.addEventListener('click', () => {
  window.api.newFile();
  Elements.MarkdownView.value = '';
});

Elements.RevertButton.addEventListener('click', async () => {
  const pastContent: string = await window.api.revert();
  Elements.MarkdownView.value = pastContent;
  renderMarkdown(pastContent);
});

Elements.ShowFileButton.addEventListener('click', () => {
  window.api.showInFolder();
});

Elements.OpenInDefaultApplicationButton.addEventListener('click', ()=>{
  window.api.openInDefault();
})