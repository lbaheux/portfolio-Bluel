// Récupération des données de l'API
async function fetchProjects() {
    const response = await fetch("http://localhost:5678/api/works");
    return response.json();
}

async function fetchCategories() {
    const response = await fetch("http://localhost:5678/api/categories");
    return response.json();
}

let allProjects = [];

// Affichage de la galerie de projets
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

// Affichage des filtres
function setActiveFilter(button) {
    const container = document.querySelector(".filters");

    const buttons = container.querySelectorAll("button");
    for (const btn of buttons) {
        btn.classList.remove("is-active");
    }
    button.classList.add("is-active");
}

function createFilterButton(label, categoryId, isActive = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.categoryId = categoryId;

    if (isActive) {
        button.classList.add("is-active");
    }

    return button;
}

function renderFilters(categories) {
    const filtersElem = document.querySelector(".filters");
    filtersElem.innerHTML = "";

    filtersElem.appendChild(createFilterButton("Tous", "all", true));
    for (const category of categories) {
        filtersElem.appendChild(createFilterButton(category.name, category.id));
    }

    filtersElem.addEventListener("click", (e) => {
        const btn = e.target;
        const categoryId = btn.dataset.categoryId;
        setActiveFilter(btn);
        
        if (categoryId == "all") {
            renderGallery(allProjects);
        } else {
            let filteredProjects = [];
            for (let i = 0; i < allProjects.length; i++) {
                const project = allProjects[i];
                if (project.categoryId == categoryId) {
                    filteredProjects.push(project);
                }
            }
            renderGallery(filteredProjects)
        }
    });
}

const projects = await fetchProjects();
const categories = await fetchCategories();

allProjects = projects;
renderFilters(categories);
renderGallery(allProjects);