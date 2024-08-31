fetch('http://localhost:5000/images')
    .then(response => response.json())
    .then(users => {
        const container = document.getElementById('images-container');
        users.forEach(user => {
            const userElement = document.createElement('div');
            userElement.innerHTML = `<h2>${user.name} (${user.email})</h2>`;
            user.files.forEach(file => {
                const imgElement = document.createElement('img');
                imgElement.src = file.path;
                imgElement.style.width = '200px';
                imgElement.style.height = 'auto';
                imgElement.setAttribute('onclick', `downloadFile('${file.path}')`);
                userElement.appendChild(imgElement);           
            });
            container.appendChild(userElement);
        });
    })
    .catch(error => console.error('Error fetching images:', error));