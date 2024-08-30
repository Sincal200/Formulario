const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
const uploads = multer({ storage: storage });

app.post("/upload", uploads.array("files"), (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const filesInfo = req.files.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
    }));


    const newUserInfo = {
        name: req.body.name,
        email: req.body.email,
        files: filesInfo
    };

    // Leer el archivo JSON existente
    fs.readFile('uploads/userInfo.json', 'utf8', (err, data) => {
        let userInfoArray = [];
        if (err) {
            if (err.code === 'ENOENT') {
                // Si el archivo no existe, crear un nuevo array
                userInfoArray = [newUserInfo];
            } else {
                console.error("Error reading JSON file", err);
                res.status(500).json({ status: "error", message: "Error reading JSON file" });
                return;
            }
        } else {
            // Si el archivo existe, parsear su contenido
            try {
                const parsedData = JSON.parse(data);
                // Asegurarse de que parsedData es un array
                if (Array.isArray(parsedData)) {
                    userInfoArray = parsedData;
                } else {
                    userInfoArray = [];
                }
                userInfoArray.push(newUserInfo);
            } catch (parseErr) {
                console.error("Error parsing JSON file", parseErr);
                res.status(500).json({ status: "error", message: "Error parsing JSON file" });
                return;
            }
        }

        // Escribir el contenido actualizado de nuevo en el archivo JSON
        fs.writeFile('uploads/userInfo.json', JSON.stringify(userInfoArray, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to JSON file", writeErr);
                res.status(500).json({ status: "error", message: "Error writing to JSON file" });
                return;
            }
            res.json({ status: "files uploaded", user: newUserInfo });
        });
    });

  
});

const imagesDirectory = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(imagesDirectory));

app.get('/images', (req, res) => {
    fs.readdir(imagesDirectory, (err, files) => {
        if (err) {
            console.error("Error reading images directory", err);
            res.status(500).json({ status: "error", message: "Error reading images directory" });
            return;
        }
        const imagePaths = files.map(file => `/uploads/${file}`);
        res.json(imagePaths);
    });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});