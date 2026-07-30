export function exportDocumentToPDF({ title, elementId }) {
  const targetElement = document.getElementById(elementId);
  if (!targetElement) {
    window.print();
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) {
    window.print();
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8" />
      <title>${title || "Chung_Nhan_LingoFlow"}</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 2rem; }
        @media print {
          @page { size: landscape; margin: 0; }
          body { padding: 1rem; }
        }
      </style>
    </head>
    <body>
      ${targetElement.outerHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
