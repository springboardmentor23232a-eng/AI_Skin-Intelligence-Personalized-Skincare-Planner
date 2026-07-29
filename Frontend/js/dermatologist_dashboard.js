
document.addEventListener("DOMContentLoaded", () => {

    
    const cards = document.querySelectorAll(".glass-card");

    
    cards.forEach(card => {

        card.addEventListener("click", () => {

            
            cards.forEach(item => item.classList.remove("active-card"));

            
            card.classList.add("active-card");

        });

    });

    
    console.log("Dermatologist Dashboard Loaded Successfully.");

});