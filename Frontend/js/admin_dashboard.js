document.addEventListener("DOMContentLoaded", async () => {

    try {

        const response = await fetch("http://localhost:5000/api/user");

        const users = await response.json();

        const tbody = document.querySelector("#usersTable tbody");

        tbody.innerHTML = "";

        let admin = 0;
        let consultant = 0;
        let dermatologist = 0;
        let user = 0;

        users.forEach(item => {

            tbody.innerHTML += `
                <tr>
                    <td>${item.user_id}</td>
                    <td>${item.full_name}</td>
                    <td>${item.email}</td>
                    <td>${item.role}</td>
                </tr>
            `;

            if(item.role==="admin") admin++;
            else if(item.role==="consultant") consultant++;
            else if(item.role==="dermatologist") dermatologist++;
            else if(item.role==="user") user++;

        });

        document.getElementById("totalUsers").textContent = users.length;
        document.getElementById("totalAdmins").textContent = admin;
        document.getElementById("totalConsultants").textContent = consultant;
        document.getElementById("totalDermatologists").textContent = dermatologist;

    } catch (error) {

        console.log(error);

    }

});