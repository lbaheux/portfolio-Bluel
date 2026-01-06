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
let allCategories = [];

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

// Mode Édition 
function setLoginLink() {
    const loginLink = document.querySelector("#login-link");
    const token = localStorage.getItem("token");

    // Non connecté
    if (!token) {
        loginLink.textContent = "login";
        loginLink.setAttribute("href", "./login.html");
        return;
    }

    // Connecté
    loginLink.textContent = "logout";
    loginLink.setAttribute("href", "#");

    loginLink.addEventListener("click", (e) => {
        e.preventDefault();

        localStorage.removeItem("token");
        window.location.href = "./index.html";
    });
}

function applyLoggedInLayout () {
    const isLoggedIn = Boolean(localStorage.getItem("token"));
    setLoginLink();

    const filters = document.querySelector(".filters");
    const editButton = document.querySelector(".edit-button");
    
    if (isLoggedIn) {
        filters.style.display = "none";
        editButton.style.display = "inline-flex";

        // Bannière en haut de la page
        const banner = document.createElement("div");
        banner.className = "edit-banner";
        banner.textContent = "Mode édition";
        document.body.prepend(banner);

    } else {
        filters.style.display = "flex";
        editButton.style.display = "none";
    }
}

// Modale
function renderModaleGallery(projects) {
    const grid = document.querySelector(".modale-gallery")

    grid.innerHTML = "";
    for (let i = 0; i < projects.length; i++) {
        const project = projects[i];

        const figure = document.createElement("figure");
        figure.classList.add("modal-thumb");
        figure.dataset.projectId = project.id;

        const img = document.createElement("img");
        img.src = project.imageUrl;
        img.alt = project.title;

        const button = document.createElement("button");
        button.type = "button";
        button.classList.add("thumb-trash");

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "fa-trash-can");

        button.appendChild(icon);
        figure.appendChild(img);
        figure.appendChild(button);
        grid.appendChild(figure);
    }
}

function renderModaleCategories(categories) {
    const select = document.querySelector("#project-category");
    select.innerHTML = "";

    for (let i = 0; i < categories.length; i++) {
        const category = categories[i];

        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;

        select.appendChild(option);
    }
}

// Suppression de projet
async function deleteProject(projectId) {
    const token = localStorage.getItem("token");
    
    const reponse = await fetch(`http://localhost:5678/api/works/${projectId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

function setupModaleDelete() {
    const grid = document.querySelector(".modale-gallery");

    grid.addEventListener("click", async function (e) {
        const trashButton = e.target.closest(".thumb-trash");
        if (!trashButton) return;

        e.preventDefault();
        e.stopImmediatePropagation();
        
        let deleteButton;
        if (e.target.classList.contains("thumb-trash")) {
            deleteButton = e.target;
        }
        else {
            deleteButton = e.target.parentElement;
        }

        const figure = deleteButton.parentElement;
        const projectId = figure.dataset.projectId;

        // Suppression coté API
        await deleteProject(projectId);

        // Suppression dans le tableau
        for (let i = 0; i < allProjects.length; i++) {
            if (allProjects[i].id == projectId) {
                allProjects.splice(i, 1);
                break;
            }
        }

        figure.remove();
        renderGallery(allProjects);
    });
}

// Ajout de projet
async function createProject(formData) {
    const token = localStorage.getItem("token");

    const reponse = await fetch("http://localhost:5678/api/works", {
        method: "POST", 
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });
    
    return reponse.json();
}

function setupModaleAddProject() {
    const form = document.querySelector(".modale-form");
    const fileInput = document.querySelector("#project-image");
    const pickButton = document.querySelector("#button-choose-image");
    const previewImg = document.querySelector("#upload-preview");
    const placeholder = document.querySelector("#upload-placeholder");
    const titleInput = document.querySelector("#project-title");
    const categorySelect = document.querySelector("#project-category");
    const submitButton = document.querySelector("#modale-submit-button");
    const errorMsg = document.querySelector(".form-error");

    // Ouvre le sélecteur de fichier
    pickButton.addEventListener("click", function () {
        errorMsg.hidden = true;
        fileInput.click();
    });

    // Preview image
    fileInput.addEventListener("change", function () {
        errorMsg.hidden = true;

        if (!fileInput.files || fileInput.files.length == 0) {
            previewImg.hidden = true;
            placeholder.hidden = false;
            return;
        }

        const file = fileInput.files[0];
        previewImg.src = URL.createObjectURL(file);

        previewImg.hidden = false;
        placeholder.hidden = true;
        pickButton.hidden = true;
    });

    titleInput.addEventListener("input", function () {
        errorMsg.hidden = true;
    });

    categorySelect.addEventListener("change", function () {
        errorMsg.hidden = true;
    });

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        errorMsg.hidden = true;

        const file = fileInput.files[0];
        const title = titleInput.value;
        const categoryId = categorySelect.value;

        if (!file || !title || !categoryId) {
            errorMsg.hidden = false;
            return;
        }

        const formData = new FormData();
        formData.append("image", file);
        formData.append("title", title);
        formData.append("category", categoryId);

        const data = await createProject(formData);

        allProjects.unshift(data);
        renderGallery(allProjects);
        renderModaleGallery(allProjects);

        form.reset();
        previewImg.hidden = true;
        previewImg.src = "";
        placeholder.hidden = false;

        // Retour à la vue galerie
        const viewGallery = document.querySelector("#modale-view-gallery");
        const viewAddPhoto = document.querySelector("#modale-view-add-photo");
        const backButton = document.querySelector(".modale-back");

        viewGallery.hidden = false;
        viewAddPhoto.hidden = true;
        backButton.hidden = true;
    });
}

// Fonction modale principale
function setupModale() {
    const token = localStorage.getItem("token");

    const overlay = document.querySelector("#modale");
    const openButton = document.querySelector(".edit-button");
    const closeButton = document.querySelector(".modale-close");
    const backButton = document.querySelector(".modale-back");
    const addPhotoButton = document.querySelector("#open-add-photo");
    const viewGallery = document.querySelector("#modale-view-gallery");
    const viewAddPhoto = document.querySelector("#modale-view-add-photo");

    // Clic sur "modifier"
    openButton.addEventListener("click", (e) => {
        renderModaleGallery(allProjects);
        renderModaleCategories(allCategories);

        overlay.classList.add("is-open");
        
        viewGallery.hidden = false;
        viewAddPhoto.hidden = true;
        backButton.hidden = true;
    });

    // Clic sur la croix
    closeButton.addEventListener("click", (e) => {
        overlay.classList.remove("is-open");
    });

    // Clic sur l'overlay pour fermer
    overlay.addEventListener("click", (e) => {
        if (e.target == overlay) {
            overlay.classList.remove("is-open");
        }
    });

    // Navigation vers la vue "ajouter une photo"
    addPhotoButton.addEventListener("click", (e) => {
        viewGallery.hidden = true;
        viewAddPhoto.hidden = false;
        backButton.hidden = false;
    })

    // Retour vers la vue galerie
    backButton.addEventListener("click", (e) => {
        viewGallery.hidden = false;
        viewAddPhoto.hidden = true;
        backButton.hidden = true;
    })

    setupModaleDelete();
    setupModaleAddProject();
}

// Affichage
const projects = await fetchProjects();
const categories = await fetchCategories();

const token = localStorage.getItem("token");

allProjects = projects;
allCategories = categories;
renderGallery(allProjects);

if (token) {
    // Affichage connecté : Préparation de la modale et layout connecté
    console.log("token OK")
    applyLoggedInLayout();
    setupModale();
} else {
    // Non connecté
    renderFilters(allCategories);
}