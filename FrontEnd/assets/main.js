async function fetchProjects() {
    const response = await fetch("http://localhost:5678/api/works");
    return response.json();
}

function renderGallery (projects) {
    const galleryElem = document.querySelector(".gallery");

    galleryElem.innerHTML = "";

    for (const project of projects) {
        const figure = document.createElement("figure");

        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = project.title ?? "";

        const figcaption = document.createElement("figcaption");
        figcaption.textContent = project.title ?? "";

        figure.appendChild(img);
        figure.appendChild(figcaption);
        galleryElem.appendChild(figure);
    }
}

const projects = await fetchProjects();
renderGallery(projects);