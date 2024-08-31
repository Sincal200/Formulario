const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());


//multer subir y guardar archivos
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});

const uploads = multer({ storage: storage });

const jsonFilePath = path.join(__dirname, 'uploads', 'userInfo.json');

// Lectura de archivo JSON
const readJsonFile = (filePath, callback) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        try {
            const jsonData = JSON.parse(data);
            callback(null, jsonData);
        } catch (parseErr) {
            callback(parseErr);
        }
    });
};

app.post("/upload", uploads.array("files"), (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const filesInfo = req.files.map(file => ({
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path
    }));

    // Crear un objeto con la información del usuario y los archivos subidos
    const newUserInfo = {
        name: req.body.name,
        email: req.body.email,
        files: filesInfo
    };

    // Leer archivo JSON y agregar nuevo contenido
    readJsonFile(jsonFilePath, (err, userInfoArray) => {
        let userInfo = [];
        if (err) {
            if (err.code === 'ENOENT') {
                // Crear si no existe
                userInfo = [newUserInfo];
            } else {
                console.error("Error reading JSON file", err);
                return;
            }
        } else {
            try {
                userInfo = userInfoArray;
                userInfo.push(newUserInfo);
            } catch (Err) {
                console.error("Error parsing JSON file", Err);
                return;
            }
        }

        // Agregar nuevo contenido
        fs.writeFile('uploads/userInfo.json', JSON.stringify(userInfo, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error writing to JSON file", writeErr);
                res.status(500).json({ status: "error", message: "Error writing to JSON file" });
                return;
            }
        });
    });

  
});


app.get('/images', (req, res) => {
    readJsonFile(jsonFilePath, (err, userInfoArray) => {
        if (err) {
            console.error("Error reading JSON file", err);
            return;
        }
        const imagesGroupedByUser = userInfoArray.map(user => ({
            name: user.name,
            email: user.email,
            files: user.files.map(file => ({
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: `/uploads/${path.basename(file.path)}`
            }))
        }));
        res.json(imagesGroupedByUser);
    });
});



app.get('/download-file/:filePath', (req, res) => {
    const filePath = path.join(__dirname, req.params.filePath);
    console.log(`Attempting to download file: ${filePath}`);
    res.download(filePath, (err) => {
        if (err) {
            console.error(`File download failed: ${err.message}`);
        }
    });
});

app.listen(5000, () => {
    console.log("Server is running on port 5000");
});