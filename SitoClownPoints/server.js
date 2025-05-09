const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configurazione sessione
app.use(session({
    secret: 'clown_points_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // true se HTTPS
}));

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'la_tua_password',
  database: 'Clown_Points'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connesso a MariaDB!');
});

// Aggiungi utente (vecchia route)
app.post('/add', (req, res) => {
  const { name, point, email } = req.body;
  db.query('INSERT INTO Utenti (name, point, email) VALUES (?, ?, ?)', [name, point, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Utente aggiunto' });
  });
});

// Aggiorna punteggio
app.post('/update', (req, res) => {
  const { name, point } = req.body;
  db.query('UPDATE Utenti SET point = ? WHERE name = ?', [point, name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Punteggio aggiornato' });
  });
});

// Elimina utente
app.post('/delete', (req, res) => {
  const { name } = req.body;
  db.query('DELETE FROM Utenti WHERE name = ?', [name], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Utente rimosso' });
  });
});

// Reset punteggi
app.post('/reset', (req, res) => {
  db.query('UPDATE Utenti SET point = 0', (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Tutti i punti azzerati' });
  });
});

// Classifica
app.get('/leaderboard', (req, res) => {
  db.query('SELECT name, point, email FROM Utenti ORDER BY point DESC', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Aggiungi colonna password se non esiste
db.query(`
    ALTER TABLE Utenti 
    ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL DEFAULT ''
`, (err) => {
    if (err) console.error('Errore nella modifica della tabella:', err);
});

// Validazione password semplice
function validatePassword(password) {
    const minLength = 4;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasNumber = /\d/.test(password);
    
    if (password.length < minLength) {
        return "La password deve essere di almeno 4 caratteri";
    }
    if (!hasSpecialChar) {
        return "La password deve contenere almeno un carattere speciale";
    }
    if (!hasNumber) {
        return "La password deve contenere almeno un numero";
    }
    return null;
}

// REGISTRAZIONE (password in chiaro)
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ message: passwordError });
    }

    db.query('SELECT * FROM Utenti WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Errore del server' });
        if (results.length > 0) return res.status(400).json({ message: 'Email già registrata' });

        db.query('INSERT INTO Utenti (name, email, password, point) VALUES (?, ?, ?, 0)', 
            [name, email, password], 
            (err) => {
                if (err) return res.status(500).json({ message: 'Errore nella registrazione' });
                res.json({ message: 'Registrazione completata con successo' });
            }
        );
    });
});

// LOGIN (password in chiaro)
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM Utenti WHERE email = ?', [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Errore del server' });
        if (results.length === 0) return res.status(401).json({ message: 'Email o password non validi' });

        const user = results[0];
        if (user.password !== password) {
            return res.status(401).json({ message: 'Email o password non validi' });
        }

        req.session.user = {
            name: user.name,
            email: user.email
        };

        res.json({
            message: 'Login effettuato con successo',
            user: {
                name: user.name,
                email: user.email
            }
        });
    });
});

// Verifica sessione
app.get('/check-session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            loggedIn: true,
            user: req.session.user
        });
    } else {
        res.json({
            loggedIn: false,
            user: null
        });
    }
});

// Logout
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ message: 'Errore durante il logout' });
        res.json({ message: 'Logout effettuato con successo' });
    });
});

app.listen(3001, () => {
    console.log('Server in ascolto sulla porta 3001');
});

// Gestione upload immagini
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Endpoint per la segnalazione
app.post('/segnalazione', upload.single('proveFotografiche'), (req, res) => {
    const { utente, articoloViolato, proveTestuali, segnalato } = req.body;
    const proveFotografiche = req.file ? req.file.filename : null;

    const query = `
        INSERT INTO Segnalazioni (utente, articolo_violato, prove_testuali, prove_fotografiche, segnalato)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(query, [utente, articoloViolato, proveTestuali, proveFotografiche, segnalato], (err) => {
        if (err) {
            console.error('Errore durante l\'inserimento della segnalazione:', err);
            return res.status(500).json({ message: 'Errore durante l\'inserimento della segnalazione' });
        }
        res.json({ message: 'Segnalazione inviata con successo' });
    });
});

// Route per ottenere le segnalazioni di un utente
app.get('/segnalazioni/:user', (req, res) => {
    const user = req.params.user;
    db.query(
        'SELECT data_segnalazione, articolo_violato, prove_testuali, prove_fotografiche FROM Segnalazioni WHERE segnalato = ? ORDER BY data_segnalazione DESC',
        [user],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        }
    );
});
