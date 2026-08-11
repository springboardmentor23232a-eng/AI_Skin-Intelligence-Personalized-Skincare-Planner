async function loadProducts(){

    const container = document.getElementById("productContainer");


    const products = [

        {
            image:"../images/cleanser.png",
            name:"Gentle Cleanser",
            description:"For oily and acne-prone skin",
            rating:"⭐ 4.8"
        },


        {
            image:"../images/moisturizer.png",
            name:"Hydrating Moisturizer",
            description:"Improves skin hydration",
            rating:"⭐ 4.7"
        },


        {
            image:"../images/sunscreen.png",
            name:"Sunscreen SPF 50",
            description:"Protects from UV damage",
            rating:"⭐ 4.9"
        },


        {
            image:"../images/serum.png",
            name:"Vitamin C Serum",
            description:"Reduces dark spots",
            rating:"⭐ 4.6"
        }

    ];



    container.innerHTML = "";



    products.forEach(product => {


        container.innerHTML += `

        <div class="product-card">


            <img src="${product.image}" alt="${product.name}">


            <h3>${product.name}</h3>


            <p>${product.description}</p>


            <h2>${product.rating}</h2>


        </div>

        `;


    });

}



loadProducts();



function logout(){

    localStorage.removeItem("token");

    localStorage.removeItem("role");

    window.location.href="login.html";

}