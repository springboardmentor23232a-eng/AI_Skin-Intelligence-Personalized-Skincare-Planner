document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".sidebar-menu a");

    links.forEach(function (link) {
        link.addEventListener("click", function (e) {
            const target = this.getAttribute("href");

            // Logout button
            if (target === "login.html") {
                alert("Logged out successfully.");
                return;
            }

            // Scroll to section
            if (target.startsWith("#")) {
                e.preventDefault();
                const section = document.querySelector(target);
                if (section) {
                    section.scrollIntoView({
                        behavior: "smooth"
                    });
                }

                // Highlight the clicked link, clear the rest
                links.forEach(function (l) {
                    l.classList.remove("active");
                });
                this.classList.add("active");
            }
        });
    });
});