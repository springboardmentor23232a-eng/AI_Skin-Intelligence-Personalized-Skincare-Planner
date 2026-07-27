document.addEventListener("DOMContentLoaded", function () {

    // Welcome message
    console.log("AI Skin Intelligence Loaded Successfully.");

    // Navigation Links
    const navLinks = document.querySelectorAll(".nav-item a");

    navLinks.forEach(link => {

        link.addEventListener("click", function () {

            navLinks.forEach(item => item.classList.remove("active"));

            this.classList.add("active");

        });

    });

    // Get Started Buttons
    const ctaButtons = document.querySelectorAll(".cta-button");

    ctaButtons.forEach(button => {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            window.location.href = "login.html";

        });

    });

    // Feature Cards Hover Effect
    const features = document.querySelectorAll(".feature");

    features.forEach(feature => {

        feature.addEventListener("mouseenter", function () {

            feature.style.transform = "translateY(-8px)";
            feature.style.transition = "0.3s";

        });

        feature.addEventListener("mouseleave", function () {

            feature.style.transform = "translateY(0)";

        });

    });

    // Cards Hover Effect
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        card.addEventListener("mouseenter", function () {

            card.style.transform = "scale(1.03)";
            card.style.transition = "0.3s";

        });

        card.addEventListener("mouseleave", function () {

            card.style.transform = "scale(1)";

        });

    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            e.preventDefault();

            const target = document.querySelector(this.getAttribute("href"));

            if (target) {

                target.scrollIntoView({
                    behavior: "smooth"
                });

            }

        });

    });

});