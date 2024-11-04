document.addEventListener('DOMContentLoaded', () => {
    const toolbar = document.getElementById('toolbar');
    const canvas = document.getElementById('canvas');
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const imageUpload = document.getElementById('imageUpload');
    const alignToolbar = document.getElementById('alignToolbar');
    let images = [];
    let draggedElement = null;

    toolbar.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.dataset.type);
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('text/plain');
        if (type === 'text') {
            const element = document.createElement('div');
            element.textContent = 'Editable Text';
            element.contentEditable = true;
            element.className = 'element';
            element.draggable = true;
            canvas.appendChild(element);
        } else if (type === 'image') {
            imageUpload.click();
        }
    });

    imageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const element = document.createElement('div');
            const img = document.createElement('img');
            img.src = reader.result;
            img.style.maxWidth = '100%';
            img.dataset.filename = file.name;
            element.appendChild(img);
            element.className = 'element';
            element.draggable = true;
            canvas.appendChild(element);

            // Read file as Data URL for saving
            images.push({ name: file.name, data: reader.result });
        };
        reader.readAsDataURL(file);
    });

    exportBtn.addEventListener('click', () => {
        let htmlContent = canvas.innerHTML;

        // Update img src attributes to use relative paths
        images.forEach(image => {
            htmlContent = htmlContent.replace(image.data, `images/${image.name}`);
        });

        const payload = { html: htmlContent, images: images };

        fetch('export.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'website.zip';
            link.click();
        })
        .catch(error => console.error('Error:', error));
    });

    importBtn.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            canvas.innerHTML = event.target.result;
        };
        reader.readAsText(file);
    });

    canvas.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('element')) {
            draggedElement = e.target;
        }
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (draggedElement) {
            const rect = canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            const elements = Array.from(canvas.children);
            let closestElement = null;
            let closestDistance = Infinity;

            elements.forEach(element => {
                if (element !== draggedElement && element.classList.contains('element')) {
                    const elRect = element.getBoundingClientRect();
                    const elY = elRect.top - rect.top + (elRect.height / 2);
                    const distance = Math.abs(y - elY);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestElement = element;
                    }
                }
            });

            if (closestElement) {
                const elRect = closestElement.getBoundingClientRect();
                const elY = elRect.top - rect.top + (elRect.height / 2);
                if (y < elY) {
                    canvas.insertBefore(draggedElement, closestElement);
                } else {
                    canvas.insertBefore(draggedElement, closestElement.nextSibling);
                }
            }
        }
    });

    canvas.addEventListener('dragend', () => {
        draggedElement = null;
    });

    canvas.addEventListener('click', (e) => {
        if (e.target.classList.contains('element') && e.target.contentEditable) {
            selectedElement = e.target;
            alignToolbar.style.display = 'block';

            // Position the toolbar above the clicked element
            const rect = selectedElement.getBoundingClientRect();
            alignToolbar.style.top = `${rect.top - alignToolbar.offsetHeight - 10}px`;
            alignToolbar.style.left = `${rect.left}px`;
        } else {
            alignToolbar.style.display = 'none';
        }
    });

    alignToolbar.addEventListener('click', (e) => {
        if (e.target.classList.contains('align-btn') && selectedElement) {
            const align = e.target.dataset.align;
            selectedElement.style.textAlign = align;
        }
    });
});
