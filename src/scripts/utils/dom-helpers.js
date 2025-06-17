export async function loadHtmlTemplate(path) {
    try {
        const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Gagal memuat template: ${path}, status: ${response.status}`);
    }
    return response.text();
    } catch (error) {
        console.error(`Error saat memuat template HTML dari ${path}:`, error);
        return `<h1>Error memuat halaman</h1><p>${error.message}</p>`;
    }
}

export function renderHtml(targetElement, htmlString) {
    if (targetElement) {
        targetElement.innerHTML = htmlString;
    } else {
        console.error('Elemen target tidak ditemukan untuk renderHTML');
    }
}
