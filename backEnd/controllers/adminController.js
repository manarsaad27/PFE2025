const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getUsers = async (req, res) => {
  try {
    const { role, faculty, search } = req.query;
    let query = 'SELECT id, first_name, last_name, email, role, faculty_id FROM users';
    const conditions = [];
    const params = [];
    
    if (role) {
      conditions.push('role = ?');
      params.push(role);
    }
    
    if (faculty) {
      conditions.push('faculty_id = ?');
      params.push(faculty);
    }
    
    if (search) {
      conditions.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
      params.push('%${search}%', '%${search}%', '%${search}%');
    }
    
    if (conditions.length) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const [users] = await pool.query(query, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, faculty } = req.body;
    
    // Vérifier si l'email existe déjà
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?', 
      [email]
    );
    
    if (existing.length) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insérer le nouvel utilisateur
    const [result] = await pool.query(
      'INSERT INTO users (email, password, role, first_name, last_name, faculty_id) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, role, firstName, lastName, faculty]
    );
    
    res.status(201).json({ 
      message: 'Utilisateur créé',
      userId: result.insertId 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};