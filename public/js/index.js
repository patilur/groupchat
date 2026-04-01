
// Form submit
function onSubmitHandler(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phonenumber = document.getElementById('phone').value
    const password = document.getElementById("password").value;

    if (!name || !email || !password || !phone) {
        alert("Please fill all fields");
        return;
    }

    const userDetails = {
        name, email, phonenumber, password
    };

    // Create user
    axios.post("http://localhost:3000/user/addUser", userDetails)
        .then((response) => {

            console.log(response.data.data);

            alert("Signup successful");

            // clearForm();

            // Redirect to login page
            window.location.href = "/signin";

        })
        .catch(err => {

            if (err.response) {
                alert(err.response.data.message);
            } else {
                console.log(err);
            }

        });

}

function LogIn(event) {

    event.preventDefault();

    const loginId = document.getElementById("loginId").value;
    const password = document.getElementById("password").value;

    if (!loginId || !password) {
        alert("Please fill all fields");
        return;
    }

    const loginDetails = {
        loginId,
        password
    };

    axios.post("http://localhost:3000/user/login", loginDetails)
        .then((response) => {

            alert("Login successful");

            // console.log("----", response.data);
            localStorage.setItem('token', response.data.token)
            // Redirect to home page
            window.location.href = "/home";

        })
        .catch((err) => {

            if (err.response) {
                alert(err.response.data.message);
            } else {
                console.log(err);
            }

        });

}
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";
}




