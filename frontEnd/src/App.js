import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
//import { AuthProvider} from "./hooks/useAuth.js";
import ProtectedRoute from './pages/Auth/ProtectedRoute.js';
import AgentDashboard from "./pages/Admin/AgentDashboard.jsx";
// Routes Admin
import AdminLayout from './pages/Admin/AdminLayout.js';
import AdminDashboard from './pages/Admin/Dashboard.jsx';
import AdminLogin from './pages/Auth/Login.jsx';
import AdminAgents from "./pages/Admin/AdminAgents.jsx";
import AgentLogin from "./pages/Auth/AgentLogin.jsx";
import AgentLayout from "./pages/Admin/AgentLayout.jsx";
import GestionUtilisateurs from './pages/Admin/GestionUtilisateurs.jsx';
import GestionDocuments from './pages/Admin/GestionDocuments.jsx';
import GestionCours from './pages/Admin/GestionCours.jsx';
import GestionEvenements from './pages/Admin/GestionEvenements.jsx';
import GestionFilieres from './pages/Admin/Filière.js';
import GestionClasses from './pages/Admin/Classe.js';
import GestionMatieres from './pages/Admin/Matière.js';
import GestionSemestres from './pages/Admin/Semestre.js';
import Parametres from './pages/Admin/Parametres.jsx';
import Statistiques from './pages/Admin/Statistiques.jsx';
import StudentDoc from "./pages/Student/studentDoc.js";
import TeacherUploadDocument from "./pages/Enseignant/teacherUploadDoc.js";
import Emploi from "./pages/Admin/Emploi.js";
import AdminExams from "./pages/Admin/AdminExam.js";
import "./pages/Student/studentDoc.css";
import { useSessionTimeout } from './hooks/useSessionTimeout.js';
// Routes publiques
import Connexion from "./pages/Auth/connexion.js";
import Inscription from "./pages/Auth/inscription.js";
import InscriptionEN from "./pages/Auth/inscriptionEN.js";
import Enseignant from "./pages/Enseignant/enseignant.js";
import EventForm from "./components/commun/eventForm.js";
import Home from "./components/commun/Home.js";
import Teacher from "./pages/Enseignant/teacher.js";
import Etudiant from "./pages/Student/etudiant.js";
import TeacherProfil from "./pages/Enseignant/teacherProfil.js";
import EtudiantProfil from "./pages/Student/etudiantProfil.js";
import { AuthProvider } from "./hooks/AuthContext.js";


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppWrapper />
      </AuthProvider>
    </Router>
  );
}

function AppWrapper() {
  const { showWarning } = useSessionTimeout(60);

  return (
    <>
      {showWarning && (
        <div className="warning-banner">
          Vous serez déconnecté dans 1 minute...
        </div>
      )}
      <AppContent />
    </>
  );
}

function AppContent() {
  const location = useLocation();

  const AdminRoute = ({ children }) => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    return isAdmin ? children : <Navigate to="/admin/login" />;
  };

  const isAdminRoute = location.pathname.startsWith("/admin");
  const shouldShowHeader = location.pathname === "/" && !isAdminRoute;
  const shouldShowFooter = !isAdminRoute;

  return (
    <div className="app">
      {shouldShowHeader && <Header />}

      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscription" element={<Inscription />} />
        <Route path="/inscriptionEN" element={<InscriptionEN />} />
        <Route path="/enseignant" element={<Enseignant />} />
        <Route path="/eventForm" element={<EventForm />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/etudiant" element={<Etudiant/>} />
        <Route path="/studentdoc" element={<StudentDoc />} />
        <Route path="/teacherProfil" element={<TeacherProfil />} />
        <Route path="/etudiantProfil" element={<EtudiantProfil />} />
        <Route path="/teacheruploaddoc" element={<TeacherUploadDocument />} />
        
        {/* Route login admin (hors layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Route login agent (hors layout admin) */}
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
  <Route path="/agent" element={<AgentLayout />}></Route>

        {/* Routes admin imbriquées */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="utilisateurs" element={<GestionUtilisateurs />} />
          <Route path="documents" element={<GestionDocuments />} />
          <Route path="statistiques" element={<Statistiques />} />
          <Route path="cours" element={<GestionCours />} />
          <Route path="filière" element={<GestionFilieres />} />
          <Route path="classe" element={<GestionClasses />} />
          <Route path="matière" element={<GestionMatieres />} />
          <Route path="semestre" element={<GestionSemestres />} />
          <Route path="evenements" element={<GestionEvenements />} />
          <Route path="parametres" element={<Parametres />} />
          <Route path="schedules" element={<Emploi />} />
          <Route path="examens" element={<AdminExams />} />
        </Route>

        {/* Routes agent */}
        <Route 
          path="/agent" 
          element={
            <ProtectedRoute allowedRoles={['Agent', 'Superviseur', 'Administrateur']}>
              <AgentLayout />
            </ProtectedRoute>
          }
        />
      </Routes>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;