import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  InputBase,
  Avatar,
  Divider,
  CircularProgress,
  Grid,
  Fade,
  Grow,
  Slide,
  styled,
} from "@mui/material";
import {
  ChevronLeft,
  Description,
  Download,
  MenuBook,
  CalendarMonth,
  FilterAlt,
  Search,
  LightMode,
  DarkMode,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";

const GlassPaper = styled(Paper)(({ theme }) => ({
  background:
    theme.palette.mode === "dark"
      ? "rgba(30, 30, 30, 0.85)"
      : "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(12px)",
  borderRadius: "18px",
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 8px 32px rgba(0,0,0,0.3)"
      : "0 8px 32px rgba(0,0,0,0.08)",
  border:
    theme.palette.mode === "dark"
      ? "1px solid rgba(255,255,255,0.1)"
      : "1px solid rgba(255,255,255,0.2)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 12px 40px rgba(0,0,0,0.5)"
        : "0 12px 40px rgba(0,0,0,0.12)",
  },
}));

const SubjectButton = styled(ListItem)(({ theme, selected }) => ({
  borderRadius: "12px",
  padding: "8px 12px",
  marginBottom: "4px",
  cursor: "pointer",
  transition: "all 0.2s ease",
  backgroundColor: selected
    ? theme.palette.mode === "dark"
      ? "rgba(101, 87, 255, 0.3)"
      : "rgba(101, 87, 255, 0.1)"
    : "transparent",
  "&:hover": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(101, 87, 255, 0.2)"
        : "rgba(101, 87, 255, 0.05)",
  },
}));

const GradientButton = styled(Button)({
  background: "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)",
  color: "white",
  fontWeight: "bold",
  padding: "8px 20px",
  borderRadius: "12px",
  textTransform: "none",
  boxShadow: "0 4px 12px rgba(101, 87, 255, 0.3)",
  "&:hover": {
    background: "linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)",
    boxShadow: "0 6px 16px rgba(101, 87, 255, 0.4)",
  },
});

const StudentDoc = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [studentInfo, setStudentInfo] = useState({
    filiere: "",
    classe: "",
    semestres: {},
    filiereId: "",
    classeId: "",
    filiere_nom: ""
  });
  const [darkMode, setDarkMode] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const studentCin = localStorage.getItem("studentCin");

  // Variables dérivées
  const availableSemesters = Object.keys(studentInfo.semestres);
  const subjectsForSemester = selectedSemester
    ? studentInfo.semestres[selectedSemester]?.map((m) => m.nom) || []
    : [];
const [matiereSelected, setMatiereSelected] = useState();
  // Handlers
  const [cacheDocuments, setCacheDocuments] = useState({});
  const handleSubjectSelect = (matiere) => {
    console.log(matiere.id);
    setMatiereSelected(matiere.id);
  };
// ******************************************************
  useEffect(() => {
    if (!matiereSelected) return;
  
    if (cacheDocuments[matiereSelected]) {
      setDocuments(cacheDocuments[matiereSelected]);
      return;
    }

    const fetchDocuments = async () => {
      try {
        console.log("matiereSelected", matiereSelected);
        console.log("classeId", studentInfo.classeId)
        console.log("filiereId", studentInfo.filiereId);
        const filiere_id = studentInfo.filiereId;
        const classe_id = studentInfo.classeId;
        const matiere_id = matiereSelected;
        const response = await axios.get('http://localhost:5000/api/documentsMatiere', { params: { filiere_id, classe_id, matiere_id } });
        setDocuments(response.data.documents);
        setCacheDocuments(prev => ({ ...prev, [matiereSelected]: response.data.documents }));
        console.log(response.data.documents);
      } catch (error) {
        console.error(error);
      }
    };
  
    fetchDocuments();
  }, [matiereSelected]);
  

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  // Chargement des données étudiant
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setIsLoading(true);

        const response = await axios.get(
          `http://localhost:5000/api/etudiant/${studentCin}`,
          {
            headers: { Authorization: `Bearer ${token} `},
          }
        );
        if (response.data.success) {
          const studentData = response.data.data;
          const matieresResponse = await axios.get("http://localhost:5000/api/cours-etudiant", {
            params: {
              classe: response.data.data.classe_nom,
              filiere: response.data.data.filiere_nom,
            },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (matieresResponse.data.success) {
            const semestresData = {};
            matieresResponse.data.data.forEach((semestre) => {
              semestresData[semestre.semestre] = semestre.matieres.map((m) => ({
                nom: m.nom,
                id: m.id,
              }));
            });

            setStudentInfo({
              filiere: studentData.Filière,
              classe: studentData.Classe,
              filiereId: studentData.filiere_id,
              filiere_nom:studentData.filiere_nom,
              classeId: studentData.classe_id,
              semestres: semestresData,
            });

            const semesters = Object.keys(semestresData);
            if (semesters.length > 0 && !selectedSemester) {
              setSelectedSemester(semesters[0]);
            }
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token && studentCin) {
      fetchStudentData();
    }
  }, [token, studentCin]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);

      // Trouver l'ID de la matière sélectionnée
      let matiereId = null;
      if (selectedSubject) {
        const matiere = studentInfo.semestres[selectedSemester]?.find(
          (m) => m.nom === selectedSubject
        );
        matiereId = matiere?.id;
      }

      const response = await axios.get(
        "http://localhost:5000/api/student-documents",
        {
          params: {
            studentCin,
            matiereId,
          },
          headers: { Authorization: `Bearer ${token} `},
        }
      );

      if (response.data.success) {
        setDocuments(
          response.data.documents.map((doc) => ({
            ...doc,
            // Conversion des dates si nécessaire
            date: new Date(doc.diffusion_date).toLocaleDateString(),
            // Formatage de la taille
            size: doc.file_size,
            // Assurer que viewed est un booléen
            viewed: Boolean(doc.viewed),
          }))
        );
      }
    } catch (error) {
      console.error("Erreur chargement documents:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (studentCin) {
      loadDocuments();
    }
  }, [selectedSubject, studentCin]);

  // Marquer un document comme vu
  const markAsViewed = async (documentId) => {
    try {
      await axios.post(
       ` http://localhost:5000/api/student-documents/view`,
        {
          documentId,
          studentCin,
        },
        {
          headers: { Authorization: `Bearer ${token} `},
        }
      );

      setDocuments((docs) =>
        docs.map((doc) =>
          doc.id === documentId ? { ...doc, viewed: true } : doc
        )
      );
    } catch (error) {
      console.error("Erreur marquage comme vu:", error);
    }
  };

  // Téléchargement de document
  const handleDownload = async (id, file_name) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/documents/${id}/download`,
      {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` } // Add authorization if needed
      }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", file_name); 
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error("Erreur lors du téléchargement :", error);
    alert("Échec du téléchargement du fichier.");
  }
};

  // Filtrage des documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = searchQuery
      ? doc.title?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          bgcolor: darkMode ? "#121212" : "background.default",
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: darkMode ? "#121212" : "background.default",
        color: darkMode ? "#ffffff" : "text.primary",
      }}
    >
      {/* Sidebar - Version desktop */}
      <Paper
        sx={{
          display: { xs: "none", md: "block" },
          width: 320,
          height: "100vh",
          position: "sticky",
          top: 0,
          borderRadius: 0,
          borderRight: darkMode
            ? "1px solid rgba(255,255,255,0.1)"
            : "1px solid rgba(0,0,0,0.05)",
          p: 4,
          background: darkMode ? "rgba(30,30,30,0.7)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              background: "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
              color: "white",
            }}
          >
            <MenuBook fontSize="small" />
          </Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              background: "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Mes Cours
          </Typography>
        </Box>

        <Divider
          sx={{
            mb: 4,
            borderColor: darkMode
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)",
          }}
        />

        {/* Sélecteur de semestre */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: "text.secondary",
              fontWeight: "medium",
              letterSpacing: "0.5px",
              fontSize: "0.75rem",
            }}
          >
            SEMESTRES
          </Typography>
          {Object.keys(studentInfo.semestres).length > 0 ? (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                background: darkMode
                  ? "rgba(101,87,255,0.1)"
                  : "rgba(101,87,255,0.05)",
                p: 1,
                borderRadius: "14px",
              }}
            >
              {Object.keys(studentInfo.semestres).map((sem) => (
                <Button
                  key={sem}
                  fullWidth
                  onClick={() => setSelectedSemester(sem)}
                  sx={{
                    borderRadius: "10px",
                    py: 1.5,
                    fontWeight: "medium",
                    fontSize: "0.875rem",
                    background:
                      selectedSemester === sem
                        ? "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)"
                        : "transparent",
                    color: selectedSemester === sem ? "#fff" : "text.primary",
                    boxShadow:
                      selectedSemester === sem
                        ? "0 4px 12px rgba(101,87,255,0.3)"
                        : "none",
                    "&:hover": {
                      background:
                        selectedSemester === sem
                          ? "linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)"
                          : darkMode
                          ? "rgba(101,87,255,0.15)"
                          : "rgba(101,87,255,0.08)",
                    },
                  }}
                >
                  Semestre {sem}
                </Button>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Aucun semestre disponible
            </Typography>
          )}
        </Box>

        {/* Liste des matières */}
        {selectedSemester && (
          <>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "text.secondary",
                fontWeight: "medium",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              MATIÈRES ({selectedSemester})
            </Typography>
            <List dense sx={{ maxHeight: "55vh", overflowY: "auto", pr: 1 }}>
              <SubjectButton
                selected={!selectedSubject}
                onClick={() => {
                  setSelectedSubject(null);
                  setDocuments([]);
                }}
                sx={{ mb: 1 }}
              >
                <ListItemText
                  primary="Toutes les matières"
                  primaryTypographyProps={{
                    fontWeight: "medium",
                    fontSize: "0.9rem",
                  }}
                />
              </SubjectButton>
              {studentInfo.semestres[selectedSemester]?.map((matiere) => (
                  matiere && matiere.nom && (
                    <motion.div key={matiere.id}>
                      <SubjectButton
                        selected={selectedSubject === matiere.nom}
                        onClick={() => handleSubjectSelect({ id: matiere.id, nom: matiere.nom })}
                      >
                        {/* <Avatar>{(matiere.nom || '').charAt(0)}</Avatar> */}
                        <ListItemText primary={matiere.nom} />
                      </SubjectButton>
                    </motion.div>
                  )
                ))}

            </List>
          </>
        )}
      </Paper>

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 3, md: 5 },
          maxWidth: { md: "calc(100% - 320px)" },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              onClick={() => navigate(-1)}
              sx={{
                mr: 2,
                background: darkMode
                  ? "rgba(101,87,255,0.2)"
                  : "rgba(101,87,255,0.1)",
                color: "#6557FF",
                "&:hover": {
                  background: darkMode
                    ? "rgba(101,87,255,0.3)"
                    : "rgba(101,87,255,0.2)",
                },
              }}
            >
              <ChevronLeft />
            </IconButton>

            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "#6557FF",
                  fontWeight: "bold",
                  mb: 0.5,
                }}
              >
                {studentInfo.filiere || "Filière non spécifiée"}
              
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: "bold",
                  background:
                    "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {studentInfo.classe || "Classe non spécifiée"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={toggleDarkMode} color="inherit">
              {darkMode ? <LightMode /> : <DarkMode />}
            </IconButton>

            {selectedSemester && (
              <Chip
                icon={
                  <CalendarMonth fontSize="small" sx={{ color: "#6557FF" }} />
                }
                label={`Semestre ${selectedSemester}`}
                sx={{
                  fontWeight: "bold",
                  background: darkMode
                    ? "rgba(101,87,255,0.2)"
                    : "rgba(101,87,255,0.1)",
                  color: "#6557FF",
                }}
              />
            )}
          </Box>
        </Box>

        {/* Search and filter */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 5,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Paper
            component="form"
            sx={{
              p: "2px 4px",
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              borderRadius: "14px",
              background: darkMode
                ? "rgba(30,30,30,0.7)"
                : "rgba(255,255,255,0.7)",
              backdropFilter: "blur(8px)",
              border: darkMode
                ? "1px solid rgba(255,255,255,0.1)"
                : "1px solid rgba(0,0,0,0.05)",
              boxShadow: darkMode
                ? "0 4px 20px rgba(0,0,0,0.2)"
                : "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <IconButton
              sx={{ p: "10px", color: "text.secondary" }}
              aria-label="search"
            >
              <Search />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "0.9rem" }}
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Paper>

          <Button
            variant="outlined"
            startIcon={<FilterAlt />}
            onClick={handleDrawerToggle}
            sx={{
              borderRadius: "14px",
              fontWeight: "bold",
              minWidth: "120px",
              color: "#6557FF",
              borderColor: darkMode
                ? "rgba(101,87,255,0.5)"
                : "rgba(101,87,255,0.3)",
              "&:hover": {
                borderColor: "#6557FF",
                background: darkMode
                  ? "rgba(101,87,255,0.15)"
                  : "rgba(101,87,255,0.05)",
              },
            }}
          >
            Filtres
          </Button>
        </Box>

        {/* Content title */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 1,
            }}
          >
            {selectedSubject || "Tous les documents"}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Box
              component="span"
              sx={{
                width: 6,
                height: 6,
                background: "#6557FF",
                borderRadius: "50%",
                mr: 1,
              }}
            />
            {filteredDocuments.length} document
            {filteredDocuments.length !== 1 ? "s" : ""} disponible
            {filteredDocuments.length !== 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Documents grid */}
        {filteredDocuments.length === 0 ? (
          <Grow in={true}>
            <GlassPaper
              sx={{
                p: 5,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  background: darkMode
                    ? "rgba(101,87,255,0.2)"
                    : "rgba(101,87,255,0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 3,
                  mx: "auto",
                }}
              >
                <Description sx={{ fontSize: 40, color: "#6557FF" }} />
              </Box>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
                Aucun document trouvé
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ maxWidth: 400, mx: "auto" }}
              >
                {selectedSubject
                  ?` Aucun document disponible pour "${selectedSubject}" ce semestre`
                  : "Aucun document disponible pour cette sélection"}
              </Typography>
            </GlassPaper>
          </Grow>
        ) : (
          <Grid container spacing={3}>
            {filteredDocuments.map((doc, index) => (
              <Grid item xs={12} sm={6} lg={4} key={doc.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassPaper>
                    <Box
                      sx={{
                        p: 3,
                        borderBottom: "1px solid",
                        borderColor: darkMode
                          ? "rgba(255,255,255,0.1)"
                          : "divider",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: darkMode
                              ? "rgba(101,87,255,0.2)"
                              : "rgba(101,87,255,0.1)",
                            color: "#6557FF",
                            mr: 2,
                            width: 48,
                            height: 48,
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                          }}
                        >
                          {/* {doc.matiere.charAt(0)} */}
                          
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {doc.matiere}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {/* {new Date(doc.date).toLocaleDateString()} •{" "}
                            {formatFileSize(doc.size)} */}

                             {new Date(doc.diffusion_date).toLocaleDateString("fr-FR")} 
                          </Typography>
                        </Box>
                      </Box>

                      <Typography
                        variant="h6"
                        sx={{
                          mb: 1,
                          fontWeight: "bold",
                          lineHeight: 1.3,
                        }}
                      >
                        {doc.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          fontSize: "0.85rem",
                        }}
                      >
                        {doc.description}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        {/* <Chip
                          label={doc.type.toUpperCase()}
                          size="small"
                          sx={{
                            background: darkMode
                              ? "rgba(101,87,255,0.2)"
                              : "rgba(101,87,255,0.1)",
                            color: "#6557FF",
                            fontWeight: "bold",
                            fontSize: "0.65rem",
                            height: 20,
                          }}
                        /> */}
                        {!doc.viewed && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: "#FF5252",
                              ml: 1,
                            }}
                          />
                        )}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        p: 2,
                        display: "flex",
                        justifyContent: "flex-end",
                      }}
                    >
                      <GradientButton
                        startIcon={<Download />}
                        size="small"
                        onClick={() => handleDownload(doc.id, doc.file_name)}
                      >
                        Télécharger
                      </GradientButton>
                    </Box>
                  </GlassPaper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Mobile sidebar */}
      <Slide direction="right" in={mobileOpen} mountOnEnter unmountOnExit>
        <Paper
          sx={{
            width: 280,
            height: "100vh",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1200,
            p: 3,
            background: darkMode
              ? "rgba(30,30,30,0.95)"
              : "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <IconButton onClick={handleDrawerToggle}>
              <ChevronLeft />
            </IconButton>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 2,
                color: "text.secondary",
                fontWeight: "medium",
                letterSpacing: "0.5px",
                fontSize: "0.75rem",
              }}
            >
              SEMESTRES
            </Typography>
            {availableSemesters.length > 0 ? (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  background: darkMode
                    ? "rgba(101,87,255,0.1)"
                    : "rgba(101,87,255,0.05)",
                  p: 1,
                  borderRadius: "14px",
                }}
              >
                {availableSemesters.map((sem) => (
                  <Button
                    key={sem}
                    fullWidth
                    onClick={() => {
                      setSelectedSemester(sem);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: "10px",
                      py: 1.5,
                      fontWeight: "medium",
                      fontSize: "0.875rem",
                      background:
                        selectedSemester === sem
                          ? "linear-gradient(45deg, #6557FF 0%, #8B7AFF 100%)"
                          : "transparent",
                      color: selectedSemester === sem ? "#fff" : "text.primary",
                      boxShadow:
                        selectedSemester === sem
                          ? "0 4px 12px rgba(101,87,255,0.3)"
                          : "none",
                      "&:hover": {
                        background:
                          selectedSemester === sem
                            ? "linear-gradient(45deg, #5949FF 0%, #7B6AFF 100%)"
                            : darkMode
                            ? "rgba(101,87,255,0.15)"
                            : "rgba(101,87,255,0.08)",
                      },
                    }}
                  >
                    Semestre {sem}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Aucun semestre disponible
              </Typography>
            )}
          </Box>

          {selectedSemester && (
            <>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 2,
                  color: "text.secondary",
                  fontWeight: "medium",
                  letterSpacing: "0.5px",
                  fontSize: "0.75rem",
                }}
              >
                MATIÈRES ({selectedSemester})
              </Typography>
              <List dense sx={{ maxHeight: "70vh", overflowY: "auto", pr: 1 }}>
                <SubjectButton
                  selected={!selectedSubject}
                  onClick={() => {
                    setSelectedSubject(null);
                    setMobileOpen(false);
                  }}
                  sx={{ mb: 1 }}
                >
                  <ListItemText
                    primary="Toutes les matières"
                    primaryTypographyProps={{
                      fontWeight: "medium",
                      fontSize: "0.9rem",
                    }}
                  />
                </SubjectButton>

                {subjectsForSemester.map((matiere) => (
                  <motion.div key={matiere} whileTap={{ scale: 0.98 }}>
                    <SubjectButton
                      selected={selectedSubject === matiere}
                      onClick={() => {
                        setSelectedSubject(matiere);
                        setMobileOpen(false);
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          mr: 2,
                          bgcolor:
                            selectedSubject === matiere
                              ? "#6557FF"
                              : darkMode
                              ? "rgba(101,87,255,0.2)"
                              : "rgba(101,87,255,0.1)",
                          color:
                            selectedSubject === matiere ? "#fff" : "#6557FF",
                          fontSize: "0.9rem",
                          fontWeight: "bold",
                        }}
                      >
                        {/* {matiere.charAt(0)} */}
                      </Avatar>
                      <ListItemText
                        primary={matiere}
                        primaryTypographyProps={{
                          fontWeight:
                            selectedSubject === matiere ? "bold" : "medium",
                          fontSize: "0.9rem",
                        }}
                      />
                      {selectedSubject === matiere && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#6557FF",
                            ml: 1,
                          }}
                        />
                      )}
                    </SubjectButton>
                  </motion.div>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Slide>
    </Box>
  );
};

export default StudentDoc;