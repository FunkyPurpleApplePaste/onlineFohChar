const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const port = process.env.PORT || 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

const app = express();
app.use(express.json());

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get('/allchar', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM fohchar');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error while fetching all characters' });
    }
});

app.post('/addchar', async (req, res) => {
    const { charname, charstar, charpic } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO fohchar (charname, charstar, charpic) VALUES (?, ?, ?)',
            [charname, charstar, charpic]
        );
        await connection.end();
        res.status(201).json({ message: `Character '${charname}' added successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not add character '${charname}'` });
    }
});

app.put('/updatechar/:id', async (req, res) => {
    const { id } = req.params;
    const { charname, charstar, charpic } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE fohchar SET charname = ?, charstar = ?, charpic = ? WHERE id = ?',
            [charname, charstar, charpic, id]
        );
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No character found with id ${id}` });
        }

        res.json({ message: `Character with id ${id} updated successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not update character ${id}` });
    }
});

app.delete('/deletechar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute('DELETE FROM fohchar WHERE id = ?', [id]);
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: `No character found with id ${id}` });
        }

        res.json({ message: `Character with id ${id} deleted successfully.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not delete character ${id}` });
    }
});
