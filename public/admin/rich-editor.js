const TOOLBAR = [
  ['bold', 'italic', 'underline', 'strike'],
  [{ header: [2, 3, false] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  ['blockquote', 'link'],
  ['clean'],
];

export function initRichEditor(container, { initialHtml = '' } = {}) {
  const quill = new window.Quill(container, {
    theme: 'snow',
    modules: { toolbar: TOOLBAR },
  });
  if (initialHtml) quill.root.innerHTML = initialHtml;

  return {
    getHTML() {
      const html = quill.root.innerHTML;
      return html === '<p><br></p>' ? '' : html;
    },
    setHTML(html) {
      quill.root.innerHTML = html || '';
    },
  };
}
