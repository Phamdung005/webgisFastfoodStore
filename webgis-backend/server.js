const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
const port = 5000;

// Định nghĩa đường dẫn đúng của file
const kfcPath = path.join(__dirname, "..", "data", "kfc.geojson");
const lottePath = path.join(__dirname, "..", "data", "lotte.geojson");
const jollibeePath = path.join(__dirname, "..", "data", "jollibee.geojson");

app.use(cors({origin: '*'}));

const readGeoJSON = (filePath, res) => {
    fs.readFile(filePath, "utf8", (err, data) => {
        if(err) {
            console.error("lỗi đọc file", err);
            return res.status(500).json({ error: "Không thể đọc dữ liệu"});
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (parseError) {
            console.error("lỗi phân tích JSON:", parseError);
            res.status(500).json({ error: "Dữ liệu không hợp lệ"});
        }
    });
};

app.get('/kfc', (req, res) => {
    readGeoJSON(kfcPath, res);
});

app.get('/lotte', (req, res) => {
    readGeoJSON(lottePath, res);
});

app.get('/jollibee', (req, res) => {
    readGeoJSON(jollibeePath, res);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});





