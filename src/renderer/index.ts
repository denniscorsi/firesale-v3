import { renderMarkdown } from './markdown';
import Elements from './elements';

Elements.MarkdownView.addEventListener('input', async () => {
  const markdown = Elements.MarkdownView.value;
  renderMarkdown(markdown);
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
