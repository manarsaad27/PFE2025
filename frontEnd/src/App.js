import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/layout/Header/header.js";
import Footer from "./components/layout/Footer/footer.js";
import "./styles.css";
import ProtectedRoute from './pages/Auth/ProtectedRoute.js';
import AgentDashboard from "./pages/Admin/AgentDashboard.js";

import AdminLayout from './pages/Admin/AdminLayout.js';
import AdminDashboard from './pages/Admin/Dashboard.js';
import AdminLogin from './pages/Auth/Login.js';
import AdminAgents from "./pages/Admin/AdminAgents.js";
import AgentLogin from "./pages/Auth/AgentLogin.js";
import AgentLayout from "./pages/Admin/AgentLayout.js";
import GestionUtilisateurs from './pages/Admin/GestionUtilisateurs.js';
import GestionDocuments from './pages/Admin/GestionDocuments.js';
import GestionCours from './pages/Admin/GestionCours.js';
import GestionEvenements from './pages/Admin/GestionEvenements.js';
import GestionFilieres from './pages/Admin/Filière.js';
import GestionClasses from './pages/Admin/Classe.js';
import GestionMatieres from './pages/Admin/Matière.js';
import GestionSemestres from './pages/Admin/Semestre.js';
import Statistiques from './pages/Admin/Statistiques.js';
import StudentDoc from "./pages/Student/studentDoc.js";
import TeacherUploadDocument from "./pages/Enseignant/teacherUploadDoc.js";
import Emploi from "./pages/Admin/Emploi.js";
import AdminExams from "./pages/Admin/AdminExam.js";
import "./pages/Student/studentDoc.css";
import { useSessionTimeout } from './hooks/useSessionTimeout.js';

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


import GestionClassesAgent from "./pages/Agent/ClasseAgent.js";
import GestionUtilisateursAgent from "./pages/Agent/GestionUtilisateursAgent.js";
import GestionDocumentAgent from "./pages/Agent/GestionDocumentsAgent.js";
import DashboardStatsAgent from "./pages/Agent/StatistiquesAgent.js";
import GestionEvenementsAgent from "./pages/Agent/GestionEvenementsAgent.js";
import GestionFilieresAgent from "./pages/Agent/FilièreAgent.js";
import GestionMatieresAgent from "./pages/Agent/MatièreAgent.js";
import GestionSemestresAgent from "./pages/Agent/SemestreAgent.js";
import EmploiAgent from "./pages/Agent/EmploiAgent.js";
import AdminExamsAgent from "./pages/Agent/ExamAgent.js";



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
      
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/agent/login" element={<AgentLogin />} />
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
  

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
          <Route path="schedules" element={<Emploi />} />
          <Route path="examens" element={<AdminExams />} />
        </Route>

        
        
<Route 
  path="/agent" 
  element={
    <ProtectedRoute allowedRoles={['Agent', 'Superviseur', 'Administrateur']}>
      <AgentLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<AgentDashboard />} />
  <Route path="dashboard" element={<AgentDashboard />} />
  <Route path="utilisateurs" element={<GestionUtilisateursAgent />} />
  <Route path="documents" element={<GestionDocumentAgent />} />
  <Route path="statistiques" element={<DashboardStatsAgent />} />
  <Route path="evenements" element={<GestionEvenementsAgent />} />
  <Route path="filière" element={<GestionFilieresAgent />} />
  <Route path="classe" element={<GestionClassesAgent />} />
  <Route path="matière" element={<GestionMatieresAgent />} />
  <Route path="semestre" element={<GestionSemestresAgent />} />
  <Route path="schedules" element={<EmploiAgent />} />
  <Route path="examens" element={<AdminExamsAgent />} />
</Route>

<Route path="/agent/login" element={<AgentLogin />} />
      </Routes>

      {shouldShowFooter && <Footer />}
    </div>
  );
}

export default App;