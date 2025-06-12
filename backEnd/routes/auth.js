import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js'; // Assurez-vous d'avoir ce fichier

const router = express.Router();

// Connexion Admin
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Vérifier si l'admin existe
    const [admin] = await db.execute("SELECT * FROM admin WHERE Email = ?", [email]);
    if (!admin.length) {
      return res.status(401).json({ success: false, message: "Email incorrect" });
    }

    // 2. Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, admin[0].password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect" });
    }

    // 3. Générer un token JWT
   const token = jwt.sign(
  { 
    email: admin[0].Email,
    role: 'admin' // ⚠️ Doit correspondre à ce que vérifie authenticateAdmin
  }, 
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
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

export default router;