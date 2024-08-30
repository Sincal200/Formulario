const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    // Prevents HTML handling submission
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const files = document.getElementById("files");
    const formData = new FormData();
    // Creates empty formData object
    formData.append("name", name.value);
    formData.append("email", email.value);
    // Appends value of text input
    for(let i =0; i < 2; i++) {
        formData.append("files", files.files[i]);
    }

    console.log(...formData)
    // Appends value(s) of file input
    // Post data to Node and Express server:
    fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData, // Payload is formData object
    })
    .then(res => res.json())
    .then(data => console.log(data));
})