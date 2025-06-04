const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database('todo.db');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Create tasks table if not exists
const createTableSql = `CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    priority INTEGER DEFAULT 0,
    due_date TEXT,
    completed INTEGER DEFAULT 0
)`;

db.run(createTableSql);

// Home page list tasks
app.get('/', (req, res) => {
    db.all('SELECT * FROM tasks ORDER BY completed, priority DESC, due_date', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.render('index', { tasks: rows });
    });
});

// Add task
app.post('/add', (req, res) => {
    const { title, description, priority, due_date } = req.body;
    db.run('INSERT INTO tasks(title, description, priority, due_date) VALUES (?, ?, ?, ?)', [title, description, priority, due_date], err => {
        if (err) {
            return res.status(500).send('Database error');
        }
        res.redirect('/');
    });
});

// Mark as complete
app.post('/complete/:id', (req, res) => {
    db.run('UPDATE tasks SET completed = 1 WHERE id = ?', [req.params.id], err => {
        res.redirect('/');
    });
});

// Delete task
app.post('/delete/:id', (req, res) => {
    db.run('DELETE FROM tasks WHERE id = ?', [req.params.id], err => {
        res.redirect('/');
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
