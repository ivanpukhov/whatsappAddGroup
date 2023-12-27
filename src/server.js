const express = require('express');
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;



// Обрабатываем любой другой запрос на сервере
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Запускаем сервер на всех сетевых интерфейсах
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
