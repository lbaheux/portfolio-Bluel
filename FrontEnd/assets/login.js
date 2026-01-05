const form = document.querySelector("#login-form");
const loginError = document.querySelector(".login-error");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";

    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    const reponse = await fetch("http://localhost:5678/api/users/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password})
    });

    const data = await reponse.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "./index.html";
        return;
    }

    loginError.textContent = "Email ou mot de passe incorrect"
});
