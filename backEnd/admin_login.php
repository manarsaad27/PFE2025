<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$servername = "localhost";
$username = "votre_utilisateur_db";
$password = "votre_mot_de_passe_db";
$dbname = "mon_pfe";

// Créer la connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]));
}

// Récupérer les données POST
$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// Requête préparée pour plus de sécurité
$stmt = $conn->prepare("SELECT * FROM admin WHERE Email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $admin = $result->fetch_assoc();
    
    // Vérifier le mot de passe (dans votre cas, il semble stocké en clair - À CHANGER)
    if ($password === $admin['password']) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Identifiants incorrects']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Identifiants incorrects']);
}

$stmt->close();
$conn->close();
?>