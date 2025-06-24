
import cors from "cors";
import mysql from "mysql2";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import axios from 'axios'; 
import express from 'express';
import authRoutes from './routes/auth.js';
import connection from './db.js';
import XLSX from 'xlsx';
import { mkdirSync, existsSync } from 'fs';
import fs from "fs";
import dotenv from 'dotenv';
import { createServer } from "http";
import { Server } from 'socket.io';
dotenv.config();

const app = express();
const router = express.Router();
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-only';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('❌ Configuration critique: JWT_SECRET doit être défini en production');
}

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'dev-secret-only',
  expiresIn: '7d' 
};

if (!process.env.JWT_SECRET) {
  console.warn('⚠️ Avertissement: JWT_SECRET non défini dans .env - utilisation d\'une clé de développement');
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Configuration critique: JWT_SECRET doit être défini en production');
  }
}
axios.defaults.baseURL = 'http://localhost:5000'; 
axios.defaults.withCredentials = true;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Disposition']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.options('*', cors());
app.use(cookieParser());
app.use('/api', authRoutes); 
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "mon_pfe",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}).promise();


const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000/api' 
  : '/api';

axios.get(`${API_URL}/filieres`)
  .then(response => console.log(response.data))
  .catch(error => {
    if (error.code === 'ECONNREFUSED') {
      console.error('Serveur inaccessible - Vérifiez que le backend est démarré');
    }
  });



app.post("/admin/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [admin] = await pool.query("SELECT * FROM admin WHERE Email = ?", [email]);
    
    if (admin.length === 0) {
      return res.status(401).json({ success: false, message: "Email incorrect" });
    }

    if (password !== admin[0].password) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }

    const token = jwt.sign(
      { email: admin[0].Email, role: 'admin' }, 
      JWT_CONFIG.secret,
      { expiresIn: JWT_CONFIG.expiresIn }
    );
    
    res.json({ 
      success: true, 
      token,
      user: {
        email: admin[0].Email,
        role: 'admin'
      }
    });

  } catch (err) {
    console.error("Erreur de connexion admin:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/connexion", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [enseignants] = await pool.query(
      "SELECT CIN, Email, Password FROM enseignants WHERE Email = ?", 
      [email]
    );
    
    if (enseignants.length > 0) {
      const enseignant = enseignants[0];
      const isMatch = await bcrypt.compare(password, enseignant.Password);
      
      if (isMatch) {
        const token = jwt.sign(
          { 
            cin: enseignant.CIN, 
            role: 'enseignant',
            email: enseignant.Email
          },
          process.env.JWT_SECRET || 'dev-secret-only',
          { expiresIn: '24h' }
        );


        return res.json({
          success: true,
          token,
          role: "enseignant",
          cin: enseignant.CIN,
          email: enseignant.Email
        });
      }
    }

    const [etudiants] = await pool.query(
      "SELECT CIN, email, Password FROM etudiant WHERE email = ?", 
      [email]
    );
    
    if (etudiants.length > 0) {
      const etudiant = etudiants[0];
      const isMatch = await bcrypt.compare(password, etudiant.Password);
      
      if (isMatch) {
        const token = jwt.sign(
          { 
            cin: etudiant.CIN, 
            role: 'etudiant',
            email: etudiant.email
          },
          process.env.JWT_SECRET || 'dev-secret-only',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          token,
          role: "etudiant",
          cin: etudiant.CIN,
          email: etudiant.email
        });
      }
    }

    return res.status(401).json({ 
      success: false,
      message: "Email ou mot de passe incorrect" 
    });

  } catch (error) {
    console.error("Erreur connexion:", {
      message: error.message,
      stack: error.stack,
      request: req.body
    });
    
    return res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? `Erreur serveur: ${error.message}`
        : "Erreur lors de la connexion"
    });
  }
});

app.post("/enseignants", async (req, res) => {
  const { 
    Cin, 
    Nom_et_prénom, 
    Email, 
    Password, 
    Numero_tel, 
    Classement, 
    Description 
  } = req.body;

  const errors = {};
  const passwordFeedback = {
    requirements: {
      minLength: false,
      hasUpper: false,
      hasLower: false,
      hasNumber: false,
      hasSpecial: false
    },
    strength: 0
  };

  if (!Cin) {
    errors.Cin = "Le CIN est requis.";
  } else if (!/^[01]\d{7}$/.test(Cin)) {
    errors.Cin = "Le CIN doit contenir exactement 8 chiffres commençant par 0 ou 1.";
  }

  if (!Nom_et_prénom?.trim()) {
    errors.Nom_et_prénom = "Le nom est requis.";
  }

  if (!Email?.trim()) {
    errors.email = "L'email est requis.";
  } else if (!/\S+@\S+\.\S+/.test(Email)) {
    errors.email = "L'email est invalide.";
  }

  if (!Numero_tel) {
    errors.Numero_tel = "Le numéro de téléphone est requis.";
  } else if (!/^\d{8}$/.test(Numero_tel)) {
    errors.Numero_tel = "Le numéro doit contenir exactement 8 chiffres.";
  }

  if (!Password) {
    errors.password = "Le mot de passe est requis.";
  } else {
    passwordFeedback.requirements = {
      minLength: Password.length >= 10,
      hasUpper: /[A-Z]/.test(Password),
      hasLower: /[a-z]/.test(Password),
      hasNumber: /[0-9]/.test(Password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(Password)
    };
    passwordFeedback.strength = Object.values(passwordFeedback.requirements).filter(Boolean).length;

    if (passwordFeedback.strength < 3) {
      errors.password = "Le mot de passe est trop faible.";
    }
  }

  if (!Classement?.trim()) {
    errors.Classement = "Le classement est requis.";
  }

  if (!Description?.trim()) {
    errors.Description = "La description est requise.";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      success: false,
      errors,
      passwordFeedback
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM enseignants WHERE Cin = ? OR Email = ?",
      [Cin, Email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: "Un enseignant avec ce CIN ou cet email existe déjà." 
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(Password, saltRounds);

    await pool.query(
      `INSERT INTO enseignants 
      (Cin, Nom_et_prénom, Email, Numero_tel, Password, Classement, Description) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        Cin,
        Nom_et_prénom.trim(),
        Email.trim(),
        Numero_tel,
        hashedPassword,
        Classement.trim(),
        Description.trim()
      ]
    );

    res.status(201).json({ 
      success: true,
      message: "Inscription réussie",
      data: { Cin, Nom_et_prénom, Email }
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur lors de l'inscription",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.post("/etudiant", async (req, res) => {
  const { 
    Cin, 
    Nom_et_prénom, 
    Téléphone, 
    email, 
    password, 
    confirmPassword,
    filiere,  
    classe
  } = req.body;

  const errors = {};
  if (!Cin) errors.Cin = "Le CIN est requis";
  if (!Nom_et_prénom) errors.Nom_et_prénom = "Le nom est requis";
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  try {
    const [existing] = await pool.query(
      "SELECT * FROM etudiant WHERE Cin = ? OR email = ?",
      [Cin, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Un étudiant avec ce CIN ou cet email existe déjà"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

    await pool.query(
      `INSERT INTO etudiant 
      (Cin, Nom_et_prénom, Téléphone, email, password, Confirmpassword, Filière, Classe) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [Cin, Nom_et_prénom, Téléphone, email, hashedPassword, hashedConfirmPassword, filiere, classe]
    );

    res.status(201).json({
      success: true,
      message: "Inscription réussie"
    });

  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get("/api/utilisateurs", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM vue_utilisateurs");
    res.json(rows);
  } catch (err) {
    console.error("Erreur SQL :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.delete('/api/utilisateurs/:cin', async (req, res) => {
  const { cin } = req.params;
  const { role } = req.query;

  try {
    if (role === 'enseignant') {
      await pool.query('DELETE FROM enseignants WHERE Cin = ?', [cin]);
    } else if (role === 'étudiant') {
      await pool.query('DELETE FROM etudiant WHERE Cin = ?', [cin]);
    } else {
      return res.status(400).json({ message: 'Rôle non valide' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Erreur suppression :', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

app.put("/api/utilisateurs/:cin", async (req, res) => {
  const { cin } = req.params;
  const { nom, email, formation, role } = req.body;

  try {
    if (role === "enseignant") {
      await pool.query(
        "UPDATE enseignants SET Nom_et_prénom = ?, Email = ? WHERE CIN = ?",
        [nom, email, cin]
      );
    } else if (role === "étudiant") {
      await pool.query(
        "UPDATE etudiant SET Nom_et_prénom = ?, email = ?, filière = ? WHERE CIN = ?",
        [nom, email, formation, cin]
      );
    }
    res.json({ message: "Utilisateur mis à jour" });
  } catch (err) {
    console.error("Erreur modification :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.post('/api/register', async (req, res) => {
  console.log('Données reçues:', req.body);
  
  try {
    const { nom, cin, email, tele, sexe, niveauEtude } = req.body;
    const errors = [];
    if (!nom?.trim()) errors.push('Le nom est requis');
    if (!cin) errors.push('Le CIN est requis');
    if (!email?.trim()) errors.push('L\'email est requis');
    if (!tele) errors.push('Le téléphone est requis');
    if (!sexe) errors.push('Le sexe est requis');
    if (!niveauEtude) errors.push('Le niveau d\'étude est requis');

    if (errors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation échouée',
        errors
      });
    }
    const connection = await pool.getConnection();
    
    try {
      const [result] = await connection.execute(
        'INSERT INTO formulaire (Nom_complet, CIN, Email, Numéro_téléphone, Sexe, Niveau_étude) VALUES (?, ?, ?, ?, ?, ?)',
        [
          nom.trim(),
          Number(cin),
          email.trim(),
          Number(tele),
          sexe,
          niveauEtude
        ]
      );
      
      res.status(201).json({ 
        success: true, 
        message: 'Inscription réussie',
        id: result.insertId
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur serveur:', error);
    
    let errorMessage = 'Erreur lors de l\'inscription';
    if (error.code === 'ER_DUP_ENTRY') {
      errorMessage = 'Ce CIN ou cet email est déjà enregistré';
    } else if (error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      errorMessage = 'Format de données incorrect pour un champ numérique';
    }
    
    res.status(500).json({ 
      success: false, 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const authenticate = (allowedRoles) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Token manquant" });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Accès non autorisé pour ce rôle" 
      });
    }

    let user;
    switch(decoded.role) {
      case 'admin':
        [user] = await pool.query('SELECT * FROM admin WHERE Email = ?', [decoded.email]);
        break;
      case 'enseignant':
        [user] = await pool.query('SELECT * FROM enseignants WHERE CIN = ?', [decoded.cin]);
        break;
      case 'etudiant':
        [user] = await pool.query('SELECT * FROM etudiant WHERE CIN = ?', [decoded.cin]);
        break;
      case 'Agent':
      case 'Superviseur':
      case 'Administrateur':
        [user] = await pool.query('SELECT * FROM agents WHERE id = ?', [decoded.id]);
        break;
      default:
        throw new Error('Rôle invalide');
    }

    if (!user.length) throw new Error('Utilisateur non trouvé');
    
    req.user = { ...decoded, details: user[0] };
    next();
  } catch (error) {
    console.error(`Erreur d'authentification: ${error.message}`);
    res.status(401).json({
      success: false,
      message: error.message.includes('jwt expired') 
        ? 'Session expirée' 
        : 'Authentification échouée'
    });
  }
};

const authenticatee = (allowedRoles) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Token manquant ou mal formaté" 
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-only');
    
    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Accès non autorisé pour ce rôle" 
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Erreur de vérification du token:", error.message);
    let message = "Token invalide";
    if (error.name === 'TokenExpiredError') message = "Session expirée";
    if (error.name === 'JsonWebTokenError') message = "Token malformé";
    res.status(401).json({ 
      success: false, 
      message 
    });
  }
};

const authenticateAgent = (allowedRoles = ['Agent', 'Superviseur', 'Administrateur']) => {
  return authenticate(allowedRoles);
};

const authenticateAdmin = authenticate(['admin']);
const authenticateTeacher = authenticate(['enseignant']);
const authenticateStudent = authenticate(['etudiant']);

app.get("/api/enseignants", authenticate(['enseignant']), async (req, res) => {
  try {
    const { cin, email } = req.query;
    
    if (!cin && !email) {
      return res.status(400).json({ 
        success: false,
        message: "Paramètres manquants: cin ou email requis" 
      });
    }

    const [results] = await pool.query(
      `SELECT 
        Cin, Nom_et_prénom, Email, 
        Numero_tel, Classement, Description,
        ProfileImage
       FROM enseignants 
       WHERE Cin = ? OR Email = ? 
       LIMIT 1`,
      [cin || null, email || null]
    );

    if (results.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Enseignant non trouvé" 
      });
    }

    const teacherData = results[0];
    res.json({ 
      success: true,
      data: {
        ...results[0],
        ProfileImage: results[0].ProfileImage 
          ? `http://localhost:5000${results[0].ProfileImage}`
          : null
      }
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/profiles');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); 
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile-${Date.now()}${ext}`;
    cb(null, uniqueName); 
  }
});

const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/^image\/(jpeg|png|jpg)$/)) {
      cb(null, true); 
    } else {
      cb(new Error('Seules les images (JPEG/PNG) sont autorisées !'), false);
    }
  }
});

const scheduleStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads", "emplois");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `emploi-${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const uploadSchedule = multer({
  storage: scheduleStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF et Excel sont autorisés'), false);
    }
  }
});

const uploadDirs = [
  path.join(__dirname, 'uploads', 'profiles'),
  path.join(__dirname, 'uploads', 'documents'),
  path.join(__dirname, 'uploads', 'emplois')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/emplois/enseignant/:cin', async (req, res) => {
  try {
    const { cin } = req.params;

    const [emplois] = await pool.query(`
      SELECT *
      FROM emplois_du_temps 
      WHERE enseignant_id = ? AND type = 'enseignant' AND published = 1
      ORDER BY created_at DESC 
      LIMIT 1
    `, [cin]);

    res.json({ success: true, data: emplois });
  } catch (err) {
    console.error('Erreur emploi enseignant:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get('/api/emplois/:id/parsed', async (req, res) => {
  try {
    const [emploi] = await pool.query(
      'SELECT fichier_path FROM emplois_du_temps WHERE id = ?',
      [req.params.id]
    );

    if (!emploi[0]?.fichier_path) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé' });
    }

    const filePath = path.join(__dirname, emploi[0].fichier_path);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headers = data[0];
    const rows = data.slice(1).map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i]]))
    );

    res.json({ success: true, data: { headers, rows } });
  } catch (error) {
    console.error("Erreur parsing:", error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post("/api/emplois", uploadSchedule.single("fichier"), async (req, res) => {
  try {
    const { type, enseignant_id } = req.body;
    const fichier_path = req.file ? `/uploads/emplois/${req.file.filename}` : null;

    if (type === 'enseignant') {
      if (!enseignant_id || !fichier_path) {
        return res.status(400).json({
          success: false,
          message: "Pour un emploi enseignant, le fichier et l'enseignant sont requis"
        });
      }
    } else {
      const { filiere_id, classe_id, semestre_id } = req.body;
      if (!filiere_id || !classe_id || !semestre_id || !fichier_path) {
        return res.status(400).json({
          success: false,
          message: "Pour un emploi étudiant, tous les champs sont requis"
        });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO emplois_du_temps 
      (type, fichier_path, enseignant_id, filiere_id, classe_id, semestre_id) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        type,
        fichier_path,
        type === 'enseignant' ? enseignant_id : null,
        type === 'etudiant' ? req.body.filiere_id : null,
        type === 'etudiant' ? req.body.classe_id : null,
        type === 'etudiant' ? req.body.semestre_id : null
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("Erreur SQL:", error);
    res.status(500).json({
      success: false,
      message: error.sqlMessage || "Erreur serveur"
    });
  }
});

app.get("/api/emplois/classe/:classeNom", async (req, res) => {
  try {
    const { classeNom } = req.params;
    const { type } = req.query;

    const [emplois] = await pool.query(`
      SELECT e.*, 
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero,
             DATE_FORMAT(e.published_at, '%Y-%m-%d %H:%i:%s') AS published_at
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      WHERE e.published = TRUE 
        AND c.nom = ?
        AND e.type = ?
      ORDER BY e.created_at DESC
    `, [classeNom, type]);

    res.json({
      success: true,
      data: emplois,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.put("/api/emplois/:id/publish", async (req, res) => {
    try {
    const [result] = await pool.query(
      `UPDATE emplois_du_temps 
       SET published = 1, 
           published_at = NOW() 
       WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Emploi du temps non trouvé"
      });
    }

    res.json({
      success: true,
      message: "Emploi du temps publié avec succès"
    });
  } catch (error) {
    console.error("Erreur lors de la publication:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get("/api/emplois/:id/download", async (req, res) => {
  try {
    const { id } = req.params;

    const [emploi] = await pool.query(
      "SELECT fichier_path FROM emplois_du_temps WHERE id = ?",
      [id]
    );

    if (!emploi.length) {
      return res.status(404).json({ message: "Emploi non trouvé" });
    }

    const filePath = path.join(__dirname, emploi[0].fichier_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier introuvable sur le serveur" });
    }

    res.download(filePath, err => {
      if (err) console.error("Erreur de téléchargement:", err);
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.get("/api/filieres", async (req, res) => {
  try {
    const [filieres] = await pool.query("SELECT * FROM filieres ORDER BY nom");
    res.json({
      success: true,
      data: filieres,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

const uploadDir = path.join(__dirname, "uploads", "emplois");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.get("/api/classes", async (req, res) => {
  try {
    const [classes] = await pool.query("SELECT * FROM classes ORDER BY nom");
    res.json({
      success: true,
      data: classes,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.get('/api/semestres', async (req, res) => {
  try {
    const { classe_id } = req.query;
    
    let query = 'SELECT * FROM semestres';
    const params = [];
    
    if (classe_id) {
      query += ' WHERE classe_id = ?';
      params.push(classe_id);
    }
    
    query += ' ORDER BY numero';
    
    const [semestres] = await pool.query(query, params);
    res.json({ success: true, data: semestres });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.use("/uploads", express.static(uploadDir));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.get("/api/etudiant/:cin/emploi-du-temps", async (req, res) => {});

app.get('/api/teachers/profile',  authenticate(['enseignant']), async (req, res) => {
  try {
    const [results] = await pool.query(
      'SELECT CIN, Nom_et_prénom, Email, Numero_tel, Classement, Description, profile_image FROM enseignants WHERE CIN = ?',
      [req.user.cin]
    );
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Enseignant non trouvé' });
    }

    res.json(results[0]);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.post('/api/teachers/upload-profile', upload.single('profile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucun fichier téléchargé' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const imagePath = `/uploads/profiles/${req.file.filename}`;
    
    await pool.query(
      'UPDATE enseignants SET profile_image = ? WHERE CIN = ?',
      [imagePath, decoded.cin]
    );

    res.json({ 
      success: true,
      imageUrl: imagePath
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.post('/api/etudiant', (req, res) => {
  console.log(req.body);
  res.status(201).json({ message: "Inscription réussie" });
});

app.get("/api/etudiant/:cin", async (req, res) => {
  const { cin } = req.params;
  try {
    const [etudiant] = await pool.query(
      `
      SELECT 
        e.CIN, 
        e.Nom_et_prénom, 
        e.Téléphone, 
        e.Email,
        e.Filière AS filiere_id,
        e.Classe AS classe_id,
        f.nom AS filiere_nom,
        c.nom AS classe_nom,
        e.ProfileImage
      FROM etudiant e
      LEFT JOIN filieres f ON e.Filière = f.id
      LEFT JOIN classes c ON e.Classe = c.id
      WHERE e.CIN = ?
    `,
      [cin]
    );

    if (etudiant.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Étudiant non trouvé" });
    }

    res.json({
      success: true,
      data: {
        ...etudiant[0],
        Filière: etudiant[0].filiere_nom || etudiant[0].filiere_id,
        Classe: etudiant[0].classe_nom || etudiant[0].classe_id,
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post('/api/etudiant/upload-profile',
  authenticate(['etudiant']), 
  uploadProfile.single('profile'), 
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "Aucun fichier reçu." });
      }

      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const cin = decoded.cin;
      const imagePath = `/uploads/profiles/${req.file.filename}`;

      await pool.query(
        'UPDATE etudiant SET ProfileImage = ? WHERE CIN = ?',
        [imagePath, cin]
      );

      res.json({
        success: true,
        imageUrl: imagePath 
      });

    } catch (error) {
      console.error("Erreur upload:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de l'enregistrement de la photo.",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 

app.post('/api/filieres', async (req, res) => {
  try {
    const { nom } = req.body;
    
    if (!nom) {
      return res.status(400).json({ 
        success: false,
        message: 'Le nom de la filière est requis' 
      });
    }

    const [result] = await pool.execute(
      'INSERT INTO filieres (nom) VALUES (?)',
      [nom]
    );

    res.status(201).json({
      success: true,
      id: result.insertId,
      nom,
      message: 'Filière créée avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la création de la filière:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Une filière avec ce nom existe déjà'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur lors de la création de la filière',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.put('/api/filieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom } = req.body;

    if (!nom) {
      return res.status(400).json({ error: 'Le nom de la filière est requis' });
    }

    const [result] = await pool.execute(
      'UPDATE filieres SET nom = ? WHERE id = ?',
      [nom, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Filière non trouvée' });
    }

    res.json({ id, nom, message: 'Filière mise à jour avec succès' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la filière:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/filieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute(
      'DELETE FROM filieres WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Filière non trouvée' });
    }

    res.json({ message: 'Filière supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la filière:', error);
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ 
        error: 'Impossible de supprimer : des classes sont associées à cette filière' 
      });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const { nom, filiere_id } = req.body;

    if (!nom || !filiere_id) {
      return res.status(400).json({ 
        success: false,
        error: 'Le nom et l\'ID de la filière sont requis' 
      });
    }
    const [result] = await pool.query(
      'INSERT INTO classes (nom, filiere_id) VALUES (?, ?)',
      [nom, filiere_id]
    );

    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      data: {
        id: result.insertId,
        nom,
        filiere_id
      }
    });

  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
  } else {
    console.log('Connecté à la base de données MySQL');
    connection.release();
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.id, c.nom, f.nom as filiere_nom, f.id as filiere_id 
      FROM classes c
      JOIN filieres f ON c.filiere_id = f.id
    `);
    res.json(classes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.put('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, filiere_id } = req.body;

    if (!nom || !filiere_id) {
      return res.status(400).json({ error: 'Nom et filière sont requis' });
    }
    const [result] = await pool.query(
      'UPDATE classes SET nom = ?, filiere_id = ? WHERE id = ?',
      [nom, filiere_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Classe non trouvée' });
    }

    res.json({ success: true, message: 'Classe mise à jour' });
  } catch (error) {
    console.error('Erreur modification classe:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
   
    const [classe] = await pool.query('SELECT id FROM classes WHERE id = ?', [id]);
    if (!classe.length) {
      return res.status(404).json({ 
        success: false,
        message: 'Classe non trouvée' 
      });
    }
    await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    
    res.json({ 
      success: true,
      message: 'Classe supprimée avec succès' 
    });

  } catch (error) {
    console.error('Erreur suppression:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer : des éléments sont liés à cette classe'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/filieres/:filiereId/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(
      'SELECT id, nom FROM classes WHERE filiere_id = ?',
      [req.params.filiereId]
    );
    res.json({
      success: true,
      data: classes
    });
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/classes/:classId/semestres', async (req, res) => {
  try {
    const [semestres] = await pool.query(
      'SELECT id, numero FROM semestres WHERE classe_id = ?',
      [req.params.classId]
    );
    res.json({
      success: true,
      data: semestres
    });
  } catch (error) {
    console.error('Error fetching semesters:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/semestres/:semesterId/matieres', async (req, res) => {
  try {
    const [matieres] = await pool.query(
      'SELECT id, nom FROM matieres WHERE semestre_id = ?',
      [req.params.semesterId]
    );
    res.json({
      success: true,
      data: matieres
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/classes/:classeId/matieres', async (req, res) => {
  try {
    const [matieres] = await pool.query(`
      SELECT m.id, m.nom 
      FROM matieres m
      JOIN semestres s ON m.semestre_id = s.id
      WHERE s.classe_id = ?
    `, [req.params.classeId]);
    res.json(matieres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/semestres', async (req, res) => {
  try {
    const { numero, classe_id } = req.body;
    if (!numero || !classe_id) {
      return res.status(400).json({
        success: false,
        message: 'Le numéro et la classe sont obligatoires'
      });
    }
    const [classe] = await pool.query(
      'SELECT id FROM classes WHERE id = ?', 
      [classe_id]
    );

    if (!classe.length) {
      return res.status(400).json({
        success: false,
        message: 'Classe non trouvée'
      });
    }
    const [result] = await pool.query(
      'INSERT INTO semestres (numero, classe_id) VALUES (?, ?)',
      [numero, classe_id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        numero,
        classe_id
      }
    });

  } catch (error) {
    console.error('Erreur création semestre:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Ce semestre existe déjà pour cette classe'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/classes/:classeId/semestres', async (req, res) => {
  try {
    const [semestres] = await pool.query(
      'SELECT * FROM semestres WHERE classe_id = ?',
      [req.params.classeId]
    );
    res.json(semestres);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.delete('/api/semestres/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [semestre] = await pool.query('SELECT id FROM semestres WHERE id = ?', [id]);
    if (!semestre.length) {
      return res.status(404).json({ success: false, message: "Semestre non trouvé" });
    }
    await pool.query('DELETE FROM semestres WHERE id = ?', [id]);

    res.json({ success: true, message: "Semestre supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post('/api/matieres', async (req, res) => {
  try {
    const { nom, credits, enseignant_id, semestre_id } = req.body;

    if (!nom || !semestre_id) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le semestre sont obligatoires'
      });
    }

    const [semestre] = await pool.query(
      'SELECT id FROM semestres WHERE id = ?',
      [semestre_id]
    );

    if (!semestre.length) {
      return res.status(400).json({
        success: false,
        message: 'Semestre non trouvé'
      });
    }

    if (enseignant_id) {
      const [enseignant] = await pool.query(
        'SELECT Cin FROM enseignants WHERE Cin = ?',
        [enseignant_id]
      );
      
      if (!enseignant.length) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    const [result] = await pool.query(
      'INSERT INTO matieres (nom, credits, enseignant_id, semestre_id) VALUES (?, ?, ?, ?)',
      [nom, credits, enseignant_id, semestre_id]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        ...req.body
      }
    });

  } catch (error) {
    console.error('Erreur création matière:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà pour ce semestre'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/matieres', async (req, res) => {
  try {
    const [matieres] = await pool.query(`
      SELECT 
        m.id, 
        m.nom, 
        m.credits, 
        m.enseignant_id,
        m.semestre_id,
        s.numero AS semestre_numero,
        c.nom AS classe_nom,
        e.Nom_et_prénom AS enseignant
      FROM matieres m
      LEFT JOIN semestres s ON m.semestre_id = s.id
      LEFT JOIN classes c ON s.classe_id = c.id
      LEFT JOIN enseignants e ON m.enseignant_id = e.Cin
    `);
    
    res.json({
      success: true,
      data: matieres
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.put('/api/matieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, credits, enseignant_id, semestre_id } = req.body;

    if (!nom || !semestre_id) {
      return res.status(400).json({
        success: false,
        message: 'Le nom et le semestre sont obligatoires'
      });
    }

    const [matiere] = await pool.query(
      'SELECT id FROM matieres WHERE id = ?',
      [id]
    );

    if (!matiere.length) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    const [semestre] = await pool.query(
      'SELECT id FROM semestres WHERE id = ?',
      [semestre_id]
    );

    if (!semestre.length) {
      return res.status(400).json({
        success: false,
        message: 'Semestre non trouvé'
      });
    }

    if (enseignant_id) {
      const [enseignant] = await pool.query(
        'SELECT Cin FROM enseignants WHERE Cin = ?',
        [enseignant_id]
      );
      
      if (!enseignant.length) {
        return res.status(400).json({
          success: false,
          message: 'Enseignant non trouvé'
        });
      }
    }

    await pool.query(
      'UPDATE matieres SET nom = ?, credits = ?, enseignant_id = ?, semestre_id = ? WHERE id = ?',
      [nom, credits, enseignant_id, semestre_id, id]
    );

    res.json({
      success: true,
      message: 'Matière mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur modification matière:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        message: 'Cette matière existe déjà pour ce semestre'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.delete('/api/matieres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [matiere] = await pool.query(
      'SELECT id FROM matieres WHERE id = ?',
      [id]
    );

    if (!matiere.length) {
      return res.status(404).json({
        success: false,
        message: 'Matière non trouvée'
      });
    }

    await pool.query(
      'DELETE FROM matieres WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Matière supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression matière:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Impossible de supprimer : des éléments sont liés à cette matière'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});


app.post('/api/evenements', async (req, res) => {
  try {
    const { titre, date, lieu, type, description } = req.body;

    if (!titre || !date || !lieu || !type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, date, lieu et type sont obligatoires'
      });
    }

    const eventDate = new Date(date);

    const [result] = await pool.query(
      'INSERT INTO evenements (titre, date, lieu, type, description) VALUES (?, ?, ?, ?, ?)',
      [titre, eventDate, lieu, type, description || null]
    );

    const eventId = result.insertId;
    const createdAt = new Date();
    const message = `Nouvel événement "${titre}" prévu le ${eventDate.toLocaleDateString()} à ${lieu}`;

    const notifications = [
      [null, 'enseignants', 'evenement', message, eventId, createdAt],
      [null, 'etudiants', 'evenement', message, eventId, createdAt]
    ];

    await pool.query(
      `INSERT INTO notifications (user_id, audience, type, message, reference_id, created_at) VALUES ?`,
      [notifications]
    );

    io.to("enseignants").emit("newNotification", {
      audience: "enseignants",
      type: "evenement",
      message,
      reference_id: eventId,
      created_at: createdAt
    });

    io.to("etudiants").emit("newNotification", {
      audience: "etudiants",
      type: "evenement",
      message,
      reference_id: eventId,
      created_at: createdAt
    });

    res.status(201).json({
      success: true,
      data: {
        id: eventId,
        titre,
        date,
        lieu,
        type,
        description
      }
    });

  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/evenements', async (req, res) => {
  try {
    const [evenements] = await pool.query(
      'SELECT id, titre, date, lieu, type, description FROM evenements ORDER BY date DESC'
    );
    res.json({ success: true, data: evenements });
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.put('/api/evenements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, date, lieu, type, description } = req.body;

    if (!titre || !date || !lieu || !type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, date, lieu et type sont obligatoires'
      });
    }

    const [result] = await pool.query(
      'UPDATE evenements SET titre = ?, date = ?, lieu = ?, type = ?, description = ? WHERE id = ?',
      [titre, new Date(date), lieu, type, description || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Événement mis à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur modification événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const { filiere } = req.query;

    if (!filiere || isNaN(filiere)) {
      return res.status(400).json({
        success: false,
        message: "ID de filière invalide"
      });
    }

    const [classes] = await pool.query(`
      SELECT c.id, c.nom 
      FROM classes c
      JOIN filieres f ON c.filiere_id = f.id
      WHERE f.id = ?
      ORDER BY c.nom
    `, [filiere]);

    res.json({
      success: true,
      data: classes
    });

  } catch (error) {
    console.error('Erreur API classes:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});


app.get('/api/student-documents', authenticateStudent, async (req, res) => {
  try {
    const { filiere, classe } = req.query;
    const [subjects] = await pool.query(`
      SELECT m.id, m.nom, s.numero AS semestre
      FROM matieres m
      JOIN semestres s ON m.semestre_id = s.id
      JOIN classes c ON s.classe_id = c.id
      JOIN filieres f ON c.filiere_id = f.id
      WHERE f.nom = ? AND c.nom = ?
    `, [filiere, classe]);

    const [documents] = await pool.query(`
     SELECT d.id, d.title, d.file_name, d.diffusion_date AS date, 
       d.file_size AS size, d.file_type AS type, d.matiere_id,
       m.nom AS matiere, s.numero AS semestre
FROM documents d
JOIN matieres m ON d.matiere_id = m.id
JOIN semestres s ON m.semestre_id = s.id
JOIN classes c ON s.classe_id = c.id
JOIN filieres f ON c.filiere_id = f.id
WHERE f.nom IS NULL AND c.nom IS NULL;

    `, [filiere, classe]);

    res.json({
      success: true,
      subjects,
      documents: documents.map(doc => ({
        ...doc,
        viewed: false 
      }))
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

const getEmplois = async () => {
  try {
    const [emplois] = await pool.query(`
      SELECT e.*, 
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
    `);
    return emplois;
  } catch (err) {
    console.error('Erreur récupération emplois:', err);
    throw err;
  }
};

app.get("/api/documents/:id/download", async (req, res) => {
  try {
    const { id } = req.params;
    const [document] = await pool.query(
      "SELECT file_path, file_name FROM documents WHERE id = ?",
      [id]
    );

    if (!document.length) {
      return res.status(404).json({
        success: false,
        message: "Document non trouvé",
      });
    }

    const filePath = path.join(__dirname, document[0].file_path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "Fichier introuvable sur le serveur",
      });
    }

    res.download(filePath, document[0].file_name);
  } catch (error) {
    console.error("Erreur lors du téléchargement:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.get("/api/cours-etudiant", authenticate(['etudiant']), async (req, res) => {
  try {
    const { filiere, classe } = req.query;
    if (!filiere || !classe) {
      return res.status(400).json({
        success: false,
        message: "Les paramètres 'filiere' et 'classe' sont requis"
      });
    }
    const [classeData] = await pool.query(
      "SELECT id FROM classes WHERE nom = ? LIMIT 1",
      [classe]
    );

    if (!classeData.length) {
      return res.status(404).json({
        success: false,
        message: "Classe non trouvée"
      });
    }

    const classeId = classeData[0].id;

    const [semestres] = await pool.query(
      "SELECT id, numero FROM semestres WHERE classe_id = ?",
      [classeId]
    );
    const result = await Promise.all(
      semestres.map(async (semestre) => {
        const [matieres] = await pool.query(
          `SELECT m.id, m.nom, m.credits, 
                  e.Nom_et_prénom AS enseignant
           FROM matieres m
           LEFT JOIN enseignants e ON m.enseignant_id = e.CIN
           WHERE m.semestre_id = ?`,
          [semestre.id]
        );

        return {
          semestre: semestre.numero,
          matieres,
        };
      })
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

router.get('/filieres', async (req, res) => {
  try {
    const [filieres] = await connection.query('SELECT * FROM filieres');
    res.json(filieres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/classes', async (req, res) => {$
  try {
    const [classes] = await connection.query('SELECT * FROM classes');
    res.json(classes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/semestres', async (req, res) => {
  try {
    const semestres = await db.query(`
      SELECT s.id, s.numero, c.nom as classe_nom 
      FROM semestres s
      JOIN classes c ON s.classe_id = c.id
    `);
    res.json({ data: semestres });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/filieres/:filiereId/classes', async (req, res) => {
  try {
    const classes = await db.query(
      'SELECT * FROM classes WHERE filiere_id = $1', 
      [req.params.filiereId]
    );
    res.json(classes.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/test-filieres', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:3001/api/filieres');
    res.json(response.data);
  } catch (error) {
    console.error('Erreur Axios:', error);
    res.status(500).send('Erreur serveur');
  }
});

app.get("/api/emplois", async (req, res) => {
  try {
    const [emplois] = await pool.query(`
      SELECT e.*, 
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      ORDER BY e.created_at DESC
    `);

    console.log("Emplois récupérés:", emplois); 
    
    res.json({
      success: true,
      data: emplois 
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get("/api/teaching-data", async (req, res) => {
  try {
    const [filieres] = await pool.query(
      "SELECT id, nom FROM filieres ORDER BY nom"
    );
    const [classes] = await pool.query(
      "SELECT id, nom, filiere_id FROM classes ORDER BY nom"
    );
    const [semestres] = await pool.query(
      "SELECT id, numero, classe_id FROM semestres ORDER BY numero"
    );
    const [matieres] = await pool.query(`
      SELECT m.id, m.nom, m.semestre_id, s.numero AS semestre_numero
      FROM matieres m
      LEFT JOIN semestres s ON m.semestre_id = s.id
    `);

    res.json({
      success: true,
      data: {
        filieres,
        classes,
        semestres,
        matieres,
      },
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

const documentsDir = path.join(__dirname, 'uploads', 'documents');
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'doc-' + uniqueSuffix + ext);
  }
});

const uploadDocument = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/vnd.ms-excel', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-powerpoint', 
      'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF, Word, Excel et PowerPoint sont autorisés'), false);
    }
  }
});




fileFilter: (req, file, cb) => {
  const filetypes = /pdf|doc|docx|ppt|pptx|xls|xlsx|txt|zip/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.includes(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Type de fichier non autorisé"), false);
  }
}

app.post("/api/diffuseCours", uploadDocument.single('file'), async (req, res) => {
  try {
    const { 
      title, 
      enseignant_id, 
      filiere_id, 
      classe_id, 
      matiere_id, 
      date_diffusion 
    } = req.body;

    const requiredFields = {
      title: 'Titre',
      enseignant_id: 'ID Enseignant',
      filiere_id: 'Filière',
      classe_id: 'Classe', 
      matiere_id: 'Matière',
      date_diffusion: 'Date de diffusion'
    };

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      if (!req.body[field]) missingFields.push(label);
    }

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs manquants: ${missingFields.join(', ')}`
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Aucun fichier téléchargé"
      });
    }

    const [enseignant] = await pool.query('SELECT CIN FROM enseignants WHERE CIN = ?', [enseignant_id]);
    if (!enseignant.length) {
      return res.status(400).json({
        success: false,
        message: "Enseignant non trouvé"
      });
    }

    const [filiere] = await pool.query('SELECT id FROM filieres WHERE id = ?', [filiere_id]);
    if (!filiere.length) {
      return res.status(400).json({
        success: false,
        message: "Filière non trouvée"
      });
    }

    const [classe] = await pool.query('SELECT id FROM classes WHERE id = ? AND filiere_id = ?', [classe_id, filiere_id]);
    if (!classe.length) {
      return res.status(400).json({
        success: false,
        message: "Classe non trouvée ou n'appartient pas à la filière"
      });
    }

    const [matiere] = await pool.query('SELECT id FROM matieres WHERE id = ?', [matiere_id]);
    if (!matiere.length) {
      return res.status(400).json({
        success: false,
        message: "Matière non trouvée"
      });
    }

    const filePath = path.join('/uploads/documents', req.file.filename).replace(/\\/g, '/');
    const [result] = await pool.query(
      `INSERT INTO documents 
      (title, enseignant_id, filiere_id, classe_id, matiere_id, diffusion_date, file_path, file_name) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        enseignant_id,
        filiere_id,
        classe_id,
        matiere_id,
        date_diffusion,
        filePath,
        req.file.originalname
      ]
    );

    res.status(201).json({
      success: true,
      message: "Document diffusé avec succès",
      documentId: result.insertId,
      filePath: filePath
    });

  } catch (error) {
    console.error("Erreur dans /api/diffuseCours:", error);
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : "Erreur lors de la diffusion du document"
    });
  }
});

app.get('/api/documentsMatiere', async (req, res) => {
  try {
    const { filiere_id, classe_id, matiere_id } = req.query;
    let sql = 'SELECT * FROM documents';
    const conditions = [];
    const params = [];

    if (filiere_id) {
      conditions.push('filiere_id = ?');
      params.push(filiere_id);
    }
    if (classe_id) {
      conditions.push('classe_id = ?');
      params.push(classe_id);
    }
    if (matiere_id) {
      conditions.push('matiere_id = ?');
      params.push(matiere_id);
    }

    if (conditions.length > 0) {
      sql += ' WHERE ' + conditions.join(' AND ');
    }
    const [rows] = await pool.query(sql, params);

    res.json({ success: true, documents: rows });
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get(
  "/api/teacher-documents",
  authenticate(["enseignant"]),
  async (req, res) => {
    try {
      const [documents] = await pool.query(
        `
      SELECT d.id, d.title, d.file_name, d.file_type, d.file_size, 
             d.diffusion_date, d.file_path,
             f.nom as filiere_nom, c.nom as classe_nom, m.nom as matiere_nom
      FROM documents d
      JOIN filieres f ON d.filiere_id = f.id
      JOIN classes c ON d.classe_id = c.id
      JOIN matieres m ON d.matiere_id = m.id
      WHERE d.enseignant_id = ?
      ORDER BY d.diffusion_date DESC
    `,
        [req.user.cin]
      );

      res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error("Erreur récupération documents:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }
  }
);

app.get('/api/filieres', async (req, res) => {
  try {
    const [filieres] = await pool.query('SELECT id, nom FROM filieres');
    res.json(filieres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const [classes] = await pool.query(`
      SELECT c.id, c.nom, f.nom as filiere_nom, f.id as filiere_id 
      FROM classes c
      JOIN filieres f ON c.filiere_id = f.id
    `);
    res.json({
      success: true,
      data: classes
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: 'Erreur serveur' 
    });
  }
});

app.get('/api/enseignants/list', async (req, res) => {
  try {
    const [enseignants] = await pool.query('SELECT CIN, Nom_et_prénom FROM enseignants');
    res.json({ 
      success: true,
      data: enseignants  
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get("/api/emplois/enseignant/:cin", authenticate(['enseignant']), async (req, res) => {
  try {
    const { cin } = req.params;

    const [emplois] = await pool.query(`
      SELECT 
        e.id,
        f.nom AS filiere_nom,
        c.nom AS classe_nom,
        s.numero AS semestre_numero,
        e.fichier_path,
        e.published_at
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      WHERE e.enseignant_id = ? AND e.type = 'enseignant' AND e.published = TRUE
      ORDER BY e.published_at DESC
    `, [cin]);

    res.json({
      success: true,
      data: emplois
    });

  } catch (error) {
    console.error("Erreur récupération emploi enseignant :", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get('/api/emplois/enseignant/:cin/download', async (req, res) => {
  try {
    const { cin } = req.params;
    
    const [emploi] = await pool.query(
      'SELECT fichier_path FROM emplois_du_temps WHERE enseignant_id = ? AND published = 1 ORDER BY created_at DESC LIMIT 1',
      [cin]
    );

    if (!emploi.length) {
      return res.status(404).json({ success: false, message: "Emploi non trouvé" });
    }

    const filePath = path.join(__dirname, emploi[0].fichier_path);
    res.download(filePath);
    
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get("/api/etudiant/emplois", async (req, res) => {
  try {
    const { filiere, classe } = req.query;
    
    const [emplois] = await pool.query(`
      SELECT e.*, 
        f.nom AS filiere_nom,
        c.nom AS classe_nom,
        s.numero AS semestre_numero
      FROM emplois_du_temps e
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      WHERE e.type = 'etudiant'
        AND f.nom = ?
        AND c.nom = ?
        AND e.published = 1
      ORDER BY e.created_at DESC
    `, [filiere, classe]);

    res.json({ 
      success: true,
      data: emplois
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get('/api/emplois/:id/parsed', async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT fichier_path FROM emplois_du_temps WHERE id = ?',
      [id]
    );

    if (!rows.length || !rows[0].fichier_path) {
      return res.status(404).json({ success: false, message: "Fichier introuvable" });
    }

    const filePath = path.join(__dirname, rows[0].fichier_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Fichier manquant sur le serveur" });
    }

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' });

    res.json({ success: true, data });
  } catch (error) {
    console.error("Erreur parsing emploi:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

router.get('/auth/verify', authenticateAdmin, (req, res) => {
  res.json({ 
    valid: true,
    user: {
      email: req.user.email,
      role: req.user.role
    }
  });
});

app.get('/api/enseignants', async (req, res) => {
  try {
    const [enseignants] = await pool.query(
      'SELECT CIN, Nom_et_prénom FROM enseignants ORDER BY Nom_et_prénom'
    );
    res.json({
      success: true,
      data: enseignants
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [admin] = await pool.query("SELECT * FROM admin WHERE Email = ?", [email]);
    if (admin.length && password === admin[0].password) {
      const token = jwt.sign({ email, role: 'admin' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        token,
        user: { email, role: 'admin' }
      });
    }
    const [agent] = await pool.query("SELECT * FROM agents WHERE email = ?", [email]);
    if (agent.length && password === agent[0].password) {
      const user = agent[0];
      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          departement: user.departement
        }
      });
    }

    return res.status(401).json({ success: false, message: "Identifiants incorrects" });

  } catch (err) {
    console.error("Erreur login unifié :", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post('/api/examens',  async (req, res) => {
  try {
    const {
      matiere_id,
      filiere_id,
      classe_id,
      semestre_id,
      date,
      heure_debut,
      heure_fin,
      salle,
      enseignant_id,
      type
    } = req.body;

    if (!matiere_id || !filiere_id || !classe_id || !semestre_id || !date || 
        !heure_debut || !heure_fin || !salle || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs obligatoires doivent être remplis' 
      });
    }
    const examDate = new Date(`${date}T${heure_debut}`);
    if (examDate < new Date()) {
      return res.status(400).json({ 
        success: false, 
        message: 'La date et heure de l\'examen doivent être dans le futur' 
      });
    }
    const [result] = await pool.query(
      `INSERT INTO examens 
      (matiere_id, filiere_id, classe_id, semestre_id, date, heure_debut, heure_fin, salle, enseignant_id, type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        matiere_id,
        filiere_id,
        classe_id,
        semestre_id,
        date,
        heure_debut,
        heure_fin,
        salle,
        enseignant_id || null,
        type
      ]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Examen créé avec succès',
      examen_id: result.insertId 
    });

  } catch (error) {
    console.error('Erreur création examen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la création de l\'examen',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/examens', async (req, res) => {
  console.log("Reçu requête GET /api/examens"); 
  
  try {
    const [rows] = await pool.query(`
      SELECT e.*, m.nom AS matiere_nom 
      FROM examens e
      LEFT JOIN matieres m ON e.matiere_id = m.id
    `);
    
    console.log("Données récupérées:", rows); 
    res.json({
      success: true,
      data: rows,
      message: `${rows.length} examens trouvés`
    });
    
  } catch (error) {
    console.error("Erreur complète:", error); 
    res.status(500).json({
      success: false,
      message: "Échec de la récupération",
      error: error.message
    });
  }
});

app.put('/api/examens/:id/publish', async (req, res) => {
  try {
    const { id } = req.params;
    const { cible } = req.body;

    if (!['enseignants', 'etudiants', 'tous'].includes(cible)) {
      return res.status(400).json({ success: false, message: 'Cible de diffusion invalide' });
    }
    const [examens] = await pool.query(`SELECT * FROM examens WHERE id = ?`, [id]);

    if (examens.length === 0) {
      return res.status(404).json({ success: false, message: 'Examen non trouvé' });
    }

    const examen = examens[0];

    const updates = {
      diffusion_at: new Date(),
      diffusion_enseignants: (cible === 'enseignants' || cible === 'tous'),
      diffusion_etudiants: (cible === 'etudiants' || cible === 'tous')
    };

    await pool.query(
      `UPDATE examens SET 
        diffusion_enseignants = ?,
        diffusion_etudiants = ?,
        diffusion_at = ?
       WHERE id = ?`,
      [
        updates.diffusion_enseignants,
        updates.diffusion_etudiants,
        updates.diffusion_at,
        id
      ]
    );

    const notifications = [];
    const createdAt = new Date();

    if (updates.diffusion_enseignants) {
      notifications.push([
        null,                  
        'enseignants',         
        'examen',              
        `Nouvel examen publié pour les enseignants le ${examen.date} à ${examen.heure_debut}`,
        id,                    
        createdAt
      ]);
    }

    if (updates.diffusion_etudiants) {
      notifications.push([
        null,
        'etudiants',
        'examen',
        `Nouvel examen publié pour les étudiants le ${examen.date} à ${examen.heure_debut}`,
        id,
        createdAt
      ]);
    }
    io.to("enseignants").emit("newNotification", {
      message: "Un nouveau cours a été publié.",
      audience: "enseignants",
      created_at: new Date(),
    });
    
    if (notifications.length > 0) {
      await pool.query(
        `INSERT INTO notifications (user_id, audience, type, message, reference_id, created_at)
         VALUES ?`,
        [notifications]
      );
    }
if (updates.diffusion_enseignants) {
  io.emit('notification', {
    audience: 'enseignants',
    type: 'examen',
    message: `Nouvel examen publié pour les enseignants le ${examen.date} à ${examen.heure_debut}`,
    reference_id: id,
    created_at: createdAt
  });
}



    res.json({ success: true, message: `Examen diffusé avec succès aux ${cible}` });

  } catch (error) {
    console.error('Erreur publication examen:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de la publication de l\'examen' });
  }
});

app.put('/api/examens/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      matiere_id,
      filiere_id,
      classe_id,
      semestre_id,
      date,
      heure_debut,
      heure_fin,
      salle,
      enseignant_id,
      type
    } = req.body;

    const [examen] = await pool.query('SELECT id FROM examens WHERE id = ?', [id]);
    if (!examen.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen non trouvé' 
      });
    }

    const [result] = await pool.query(
      `UPDATE examens SET 
        matiere_id = ?,
        filiere_id = ?,
        classe_id = ?,
        semestre_id = ?,
        date = ?,
        heure_debut = ?,
        heure_fin = ?,
        salle = ?,
        enseignant_id = ?,
        type = ?
       WHERE id = ?`,
      [
        matiere_id,
        filiere_id,
        classe_id,
        semestre_id,
        date,
        heure_debut,
        heure_fin,
        salle,
        enseignant_id || null,
        type,
        id
      ]
    );

    res.json({ 
      success: true, 
      message: 'Examen mis à jour avec succès' 
    });

  } catch (error) {
    console.error('Erreur modification examen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la modification de l\'examen' 
    });
  }
});

app.delete('/api/examens/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const [examen] = await pool.query('SELECT id FROM examens WHERE id = ?', [id]);
    if (!examen.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Examen non trouvé' 
      });
    }

    await pool.query('DELETE FROM examens WHERE id = ?', [id]);

    res.json({ 
      success: true, 
      message: 'Examen supprimé avec succès' 
    });

  } catch (error) {
    console.error('Erreur suppression examen:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la suppression de l\'examen' 
    });
  }
});

app.get('/api/examens/enseignants', authenticate(['enseignant']), async (req, res) => {
  try {
    const [examens] = await pool.query(`
      SELECT e.*, 
             m.nom AS matiere_nom,
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM examens e
      LEFT JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      WHERE e.diffusion_enseignants = TRUE
        AND e.date >= CURDATE()
      ORDER BY e.date ASC, e.heure_debut ASC
    `);

    res.json({ 
      success: true, 
      data: examens 
    });

  } catch (error) {
    console.error('Erreur récupération examens enseignants:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des examens' 
    });
  }
});

app.get('/api/examens/etudiants', authenticate(['etudiant']), async (req, res) => {
  try {
    const [etudiant] = await pool.query(
      'SELECT Filière AS filiere_id, Classe AS classe_id FROM etudiant WHERE CIN = ?',
      [req.user.cin]
    );

    if (!etudiant.length) {
      return res.status(404).json({ 
        success: false, 
        message: 'Étudiant non trouvé' 
      });
    }

    const { filiere_id, classe_id } = etudiant[0];

    const [examens] = await pool.query(`
      SELECT e.*, 
             m.nom AS matiere_nom,
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero,
             en.Nom_et_prénom AS enseignant_nom
      FROM examens e
      LEFT JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      LEFT JOIN enseignants en ON e.enseignant_id = en.CIN
      WHERE e.diffusion_etudiants = TRUE
        AND e.filiere_id = ?
        AND e.classe_id = ?
        AND e.date >= CURDATE()
      ORDER BY e.date ASC, e.heure_debut ASC
    `, [filiere_id, classe_id]);

    res.json({ 
      success: true, 
      data: examens 
    });

  } catch (error) {
    console.error('Erreur récupération examens étudiants:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur lors de la récupération des examens' 
    });
  }
});

app.get("/api/examens/etudiant/:cin", async (req, res) => {
  const { cin } = req.params;
  
  try {
    const [etudiant] = await pool.query(
      `SELECT e.Filière AS filiere_id, e.Classe AS classe_id, 
              f.nom AS filiere_nom, c.nom AS classe_nom
       FROM etudiant e
       LEFT JOIN filieres f ON e.Filière = f.id
       LEFT JOIN classes c ON e.Classe = c.id
       WHERE e.CIN = ?`,
      [cin]
    );

    if (!etudiant.length) {
      return res.status(404).json({ success: false, message: "Étudiant non trouvé" });
    }

    const studentInfo = etudiant[0];
    const [examens] = await pool.query(`
      SELECT e.*, 
             m.nom AS matiere_nom,
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero,
             en.Nom_et_prénom AS enseignant_nom
      FROM examens e
      LEFT JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN filieres f ON e.filiere_id = f.id
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN semestres s ON e.semestre_id = s.id
      LEFT JOIN enseignants en ON e.enseignant_id = en.CIN
      WHERE e.filiere_id = ? 
        AND e.classe_id = ?
        AND e.diffusion_etudiants = TRUE
        AND e.date >= CURDATE()
      ORDER BY e.date ASC, e.heure_debut ASC
    `, [studentInfo.filiere_id, studentInfo.classe_id]);

    res.status(200).json({ 
      success: true, 
      data: examens 
    });
  } catch (error) {
    console.error('Erreur récupération examens étudiant :', error);
    res.status(500).json({ 
      success: false, 
      message: "Erreur serveur",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/api/examens/enseignant/:cin', authenticate(['enseignant']), async (req, res) => {
  try {
    const { cin } = req.params;

    const [examens] = await pool.query(`
      SELECT e.*, 
             m.nom AS matiere_nom,
             f.nom AS filiere_nom,
             c.nom AS classe_nom,
             s.numero AS semestre_numero
      FROM examens e
      JOIN matieres m ON e.matiere_id = m.id
      JOIN filieres f ON e.filiere_id = f.id
      JOIN classes c ON e.classe_id = c.id
      JOIN semestres s ON e.semestre_id = s.id
      WHERE e.enseignant_id = ?
        AND e.diffusion_enseignants = TRUE
        AND e.date >= CURDATE()
      ORDER BY e.date ASC, e.heure_debut ASC
    `, [cin]);

    res.json({ 
      success: true, 
      data: examens 
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

app.get("/api/test-token", (req, res) => {
  console.log("Headers reçus:", req.headers);
  res.json({
    receivedAuth: req.headers.authorization,
    serverSecret: process.env.JWT_SECRET || "dev-secret-only",
  });
});

app.post("/api/support-request", async (req, res) => {
  try {
    const { email, message } = req.body;
    console.log("Tentative d'enregistrement:", { email, message });

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email et message sont obligatoires",
      });
    }
    let userType = "etudiant"; 
    const [enseignant] = await pool.query(
      "SELECT Email FROM enseignants WHERE Email = ?",
      [email]
    );

    if (enseignant.length > 0) {
      userType = "enseignant";
    }

    const [result] = await pool.query(
      "INSERT INTO notifications (user_email, user_type, message) VALUES (?, ?, ?)",
      [email, userType, message]
    );

    console.log("Notification enregistrée avec ID:", result.insertId);

    res.status(201).json({
      success: true,
      message: "Problème signalé avec succès",
    });
  } catch (error) {
    console.error("Erreur détaillée:", {
      message: error.message,
      stack: error.stack,
      sqlMessage: error.sqlMessage,
    });

    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? `Erreur SQL: ${error.sqlMessage || error.message}`
          : "Erreur serveur",
    });
  }
});

app.get("/api/admin/notifications", authenticateAdmin, async (req, res) => {
  try {
    const { unread } = req.query;

    let query = `
      SELECT n.*, 
        CASE 
          WHEN n.user_type = 'etudiant' THEN e.Nom_et_prénom
          WHEN n.user_type = 'enseignant' THEN en.Nom_et_prénom
          ELSE 'Admin'
        END AS user_name
      FROM notifications n
      LEFT JOIN etudiant e ON n.user_email = e.email AND n.user_type = 'etudiant'
      LEFT JOIN enseignants en ON n.user_email = en.Email AND n.user_type = 'enseignant'
    `;

    if (unread === "true") {
      query += " WHERE n.read_status = FALSE";
    }

    query += " ORDER BY n.created_at DESC";

    const [notifications] = await pool.query(query);
    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

app.patch(
  "/api/admin/notifications/:id/read",
  authenticateAdmin,
  async (req, res) => {
    try {
      await pool.query(
        "UPDATE notifications SET read_status = TRUE WHERE id = ?",
        [req.params.id]
      );
      res.json({ success: true });
    } catch (error) {
      console.error("Erreur:", error);
      res.status(500).json({
        success: false,
        message: "Erreur serveur",
      });
    }
  }
);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let adminSockets = [];

io.on("connection", (socket) => {
  socket.on("registerAsAdmin", () => {
    if (!adminSockets.includes(socket.id)) {
      adminSockets.push(socket.id);
    }
  });
  socket.on('registerUser', ({ audience }) => {
    socket.join([audience, 'tous']);
  });
  
  function emitNotification(notification) {
    io.to(notification.audience).emit('newNotification', notification);
    io.to('tous').emit('newNotification', notification);
  }

  socket.on("disconnect", () => {
    adminSockets = adminSockets.filter((id) => id !== socket.id);
  
  });
});

app.get('/api/notifications/unread', async (req, res) => {
  const { cin } = req.user; 
  
  try {
    const [notifications] = await pool.query(`
      SELECT n.* 
      FROM notifications n
      LEFT JOIN notification_read_status nr ON n.id = nr.notification_id AND nr.user_cin = ?
      WHERE (n.audience = ? OR n.audience = 'tous')
      AND (nr.read_status IS NULL OR nr.read_status = FALSE)
      AND (n.expiration_date IS NULL OR n.expiration_date > NOW())
      ORDER BY n.created_at DESC
    `, [cin, 'etudiants']);
    
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.post("/api/reclamations", async (req, res) => {
  try {
    const { email, message, userType } = req.body;

    if (!email || !message) {
      return res.status(400).json({ success: false, message: "Email et message sont obligatoires" });
    }

    const [result] = await pool.query(
      "INSERT INTO reclamations (email, message, user_type) VALUES (?, ?, ?)",
      [email, message, userType || "autre"]
    );

    adminSockets.forEach((socketId) => {
      io.to(socketId).emit("newReclamation", {
        id: result.insertId,
        email,
        message,
        userType: userType || "autre",
        timestamp: new Date(),
      });
    });

    res.status(201).json({
      success: true,
      message: "Réclamation enregistrée avec succès",
      reclamationId: result.insertId,
    });
  } catch (error) {
    console.error("Erreur enregistrement réclamation:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

httpServer.listen(5000, () => {
  console.log("Serveur démarré sur http://localhost:5000");
});

app.get("/api/admin/reclamations", authenticateAdmin, async (req, res) => {
  try {
    const [reclamations] = await pool.query(`
      SELECT r.*, 
        CASE 
          WHEN r.user_type = 'etudiant' THEN e.Nom_et_prénom
          WHEN r.user_type = 'enseignant' THEN en.Nom_et_prénom
          ELSE 'Autre'
        END AS user_name
      FROM reclamations r
      LEFT JOIN etudiant e ON r.email = e.email AND r.user_type = 'etudiant'
      LEFT JOIN enseignants en ON r.email = en.Email AND r.user_type = 'enseignant'
      ORDER BY r.created_at DESC
    `);

    res.json({
      success: true,
      data: reclamations
    });

  } catch (error) {
    console.error("Erreur récupération réclamations:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.put("/api/admin/reclamations/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.query(
      "UPDATE reclamations SET status = ? WHERE id = ?",
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Réclamation non trouvée"
      });
    }

    res.json({
      success: true,
      message: "Statut mis à jour"
    });

  } catch (error) {
    console.error("Erreur mise à jour statut:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get('/agents', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM agents');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des agents' });
  }
});

app.post('/agents', async (req, res) => {
  const { nom, prenom, email, password, departement, role } = req.body;

  if (!nom || !prenom || !email || !password || !departement || !role) {
    return res.status(400).json({ error: 'Champs obligatoires manquants' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO agents (nom, prenom, email, password, departement, role) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashedPassword, departement, role]
    );
    res.status(201).json({ id: result.insertId, message: 'Agent ajouté avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'agent' });
  }
});

app.delete('/agents/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM agents WHERE id = ?', [id]);
    res.json({ message: 'Agent supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

app.put('/agents/:id', async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, password, departement, role } = req.body;

  if (!nom || !prenom || !email || !departement || !role) {
    return res.status(400).json({ error: 'Champs requis manquants' });
  }

  try {
    let query, params;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `
        UPDATE agents 
        SET nom = ?, prenom = ?, email = ?, password = ?, departement = ?, role = ? 
        WHERE id = ?
      `;
      params = [nom, prenom, email, hashedPassword, departement, role, id];
    } else {
      query = `
        UPDATE agents 
        SET nom = ?, prenom = ?, email = ?, departement = ?, role = ? 
        WHERE id = ?
      `;
      params = [nom, prenom, email, departement, role, id];
    }

    const [result] = await pool.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agent non trouvé' });
    }

    res.json({ message: 'Agent mis à jour avec succès' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'agent' });
  }
});

app.post('/api/agents/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM agents WHERE email = ?', [email]);
    const agent = rows[0];

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent introuvable' });
    }

    const passwordMatch = await bcrypt.compare(password, agent.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: agent.id,
        email: agent.email,
        role: agent.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      agent: {
        id: agent.id,
        nom: agent.nom,
        prenom: agent.prenom,
        email: agent.email,
        role: agent.role,
        departement: agent.departement
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

app.get("/api/agents/profile", authenticate(['Agent', 'Superviseur', 'Administrateur']), async (req, res) => {
  try {
    const [agent] = await pool.query(
      "SELECT id, nom, prenom, email, role, departement FROM agents WHERE id = ?",
      [req.user.id]
    );

    if (!agent.length) {
      return res.status(404).json({
        success: false,
        message: "Agent non trouvé"
      });
    }

    res.json({
      success: true,
      data: agent[0]
    });

  } catch (error) {
    console.error("Erreur récupération profil agent:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get('/api/stats/users', async (req, res) => {
  try {
    const [etudiants] = await pool.query('SELECT COUNT(*) as count FROM etudiant');
    const [enseignants] = await pool.query('SELECT COUNT(*) as count FROM enseignants');
    const [agents] = await pool.query('SELECT COUNT(*) as count FROM agents');
    
    res.json({
      etudiants: etudiants[0].count,
      enseignants: enseignants[0].count,
      agents: agents[0].count,
      total: etudiants[0].count + enseignants[0].count + agents[0].count
    });
  } catch (err) {
    console.error("Erreur stats utilisateurs:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/formations', async (req, res) => {
  try {
    const [filieres] = await pool.query('SELECT COUNT(*) as count FROM filieres');
    const [classes] = await pool.query('SELECT COUNT(*) as count FROM classes');
    const [matieres] = await pool.query('SELECT COUNT(*) as count FROM matieres');
    
    const [details] = await pool.query(`
      SELECT f.id, f.nom, 
             COUNT(DISTINCT c.id) as classes,
             COUNT(DISTINCT m.id) as matieres
      FROM filieres f
      LEFT JOIN classes c ON f.id = c.filiere_id
      LEFT JOIN semestres s ON c.id = s.classe_id
      LEFT JOIN matieres m ON s.id = m.semestre_id
      GROUP BY f.id
    `);
    
    res.json({
      filieres: filieres[0].count,
      classes: classes[0].count,
      matieres: matieres[0].count,
      details
    });
  } catch (err) {
    console.error("Erreur stats formations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/documents', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM documents');
    
    const [types] = await pool.query(`
      SELECT 
        CASE 
          WHEN file_type LIKE 'application/pdf' THEN 'PDF'
          WHEN file_type LIKE 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' THEN 'Word'
          ELSE 'Autre'
        END as type,
        COUNT(*) as count
      FROM documents
      GROUP BY type
    `);
    
    res.json({
      total: total[0].count,
      types
    });
  } catch (err) {
    console.error("Erreur stats documents:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/emplois', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM emplois_du_temps');
    const [etudiants] = await pool.query('SELECT COUNT(*) as count FROM emplois_du_temps WHERE type = "etudiant"');
    const [enseignants] = await pool.query('SELECT COUNT(*) as count FROM emplois_du_temps WHERE type = "enseignant"');
    const [nonPublies] = await pool.query('SELECT COUNT(*) as count FROM emplois_du_temps WHERE published = 0');
    
    res.json({
      total: total[0].count,
      etudiants: etudiants[0].count,
      enseignants: enseignants[0].count,
      nonPublies: nonPublies[0].count
    });
  } catch (err) {
    console.error("Erreur stats emplois:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/examens', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM examens');
    const [types] = await pool.query(`
      SELECT type as name, COUNT(*) as value 
      FROM examens 
      GROUP BY type
    `);
    
    res.json({
      total: total[0].count,
      types
    });
  } catch (err) {
    console.error("Erreur stats examens:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/evenements', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM evenements');
    const [prochains] = await pool.query(`
      SELECT * FROM evenements 
      WHERE date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
      ORDER BY date ASC
      LIMIT 4
    `);
    
    res.json({
      total: total[0].count,
      prochains
    });
  } catch (err) {
    console.error("Erreur stats événements:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

app.get('/api/stats/reclamations', async (req, res) => {
  try {
    const [total] = await pool.query('SELECT COUNT(*) as count FROM reclamations');
    const [status] = await pool.query(`
      SELECT status as name, COUNT(*) as value 
      FROM reclamations 
      GROUP BY status
    `);
    
    res.json({
      total: total[0].count,
      status
    });
  } catch (err) {
    console.error("Erreur stats réclamations:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

const fetchMatieres = async () => {
  try {
    const res = await axios.get("http://localhost:5000/api/matieres");
    const data = res.data.data || res.data;
    const enrichedData = data.map(matiere => ({
      ...matiere,
      semestre_data: semestres.find(s => s.id === matiere.semestre_id)
    }));
    
    setMatieres(enrichedData);
  } catch (error) {
    console.error("Erreur chargement:", error);
    setSnackbar({
      open: true,
      message: error.response?.data?.message || "Erreur lors du chargement",
      severity: "error"
    });
  }
};

app.get("/api/agents/profile", authenticate(['Agent', 'Superviseur', 'Administrateur']), async (req, res) => {
  try {
    const [agent] = await pool.query(
      "SELECT id, nom, prenom, email, role, departement FROM agents WHERE id = ?",
      [req.user.id]
    );

    if (!agent.length) {
      return res.status(404).json({
        success: false,
        message: "Agent non trouvé"
      });
    }

    res.json({
      success: true,
      data: agent[0]
    });

  } catch (error) {
    console.error("Erreur récupération profil agent:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get('/api/enseignant/documents/:enseignantId', async (req, res) => {
  try {
    const { enseignantId } = req.params;

    const [documents] = await pool.query(`
      SELECT 
        d.id,
        d.title,
        d.file_name,
        d.file_type,
        d.file_size,
        d.diffusion_date,
        d.file_path,
        f.nom AS filiere_nom,
        c.nom AS classe_nom,
        m.nom AS matiere_nom
      FROM documents d
      JOIN filieres f ON d.filiere_id = f.id
      JOIN classes c ON d.classe_id = c.id
      JOIN matieres m ON d.matiere_id = m.id
      WHERE d.enseignant_id = ?
      ORDER BY d.diffusion_date DESC
    `, [enseignantId]);

    res.json({
      success: true,
      data: documents.map(doc => ({
        ...doc,
        diffusion_date: new Date(doc.diffusion_date).toLocaleDateString()
      }))
    });

  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get('/api/teacher-documents', authenticatee(['enseignant']), async (req, res) => {
  try {
    const [documents] = await pool.query(`
      SELECT d.*, f.nom AS filiere_nom, c.nom AS classe_nom, m.nom AS matiere_nom
      FROM documents d
      JOIN filieres f ON d.filiere_id = f.id
      JOIN classes c ON d.classe_id = c.id
      JOIN matieres m ON d.matiere_id = m.id
      WHERE d.enseignant_id = ?
      ORDER BY d.diffusion_date DESC
    `, [req.user.cin]);

    res.json({ success: true, data: documents });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.delete('/api/documents/:id', authenticatee(['enseignant']), async (req, res) => {
  try {
    const { id } = req.params;
    const [document] = await pool.query(
      'SELECT file_path FROM documents WHERE id = ? AND enseignant_id = ?',
      [id, req.user.cin]
    );

    if (!document.length) {
      return res.status(404).json({ success: false, message: "Document non trouvé" });
    }
    if (document[0].file_path) {
      const filePath = path.join(__dirname, document[0].file_path);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    
    res.json({ success: true, message: "Document supprimé" });
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

app.get("/api/inscriptions", async (req, res) => {
  try {
    const [inscriptions] = await pool.query("SELECT * FROM formulaire");
    res.json({
      success: true,
      data: inscriptions
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get("/api/inscriptions-with-events", async (req, res) => {
  try {
    const query = `
      SELECT f.*, e.titre AS event_titre
      FROM formulaire f
      LEFT JOIN evenements e ON f.event_id = e.id
    `;
    const [inscriptions] = await pool.query(query);
    res.json({
      success: true,
      data: inscriptions
    });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

app.get("/api/protected-route",  authenticate(['enseignant']), async (req, res) => {
  res.json({ message: "Accès autorisé" });
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur en écoute sur http://localhost:${PORT}`);
}).on('error', (err) => {});