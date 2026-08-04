document.addEventListener("DOMContentLoaded", function () {

    const sections = document.querySelectorAll(".glass-card");

    sections.forEach(function (section) {

        section.addEventListener("click", function () {

            alert(section.querySelector("h2").textContent + " page is under development.");

        });

    });

});