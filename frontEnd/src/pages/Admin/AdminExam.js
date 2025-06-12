import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Input, message, Space, Tag, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
const { Option } = Select;

const AdminExams = () => {
  const navigate = useNavigate();
  // États
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [publishModalVisible, setPublishModalVisible] = useState(false);
  const [currentExam, setCurrentExam] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [form] = Form.useForm();
  
  // Données de référence
  const [programs, setPrograms] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  
  // Données filtrées
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [filteredSemesters, setFilteredSemesters] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);

  const examTypes = ['Examen', 'Contrôle', 'TP', 'Projet'];

  // Fonction utilitaire pour normaliser les données API
  const normalizeApiData = (response) => {
    if (!response) return [];
    if (Array.isArray(response.data?.data)) return response.data.data;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  };

  // Charger les données initiales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setInitialLoading(true);
        const [programsRes, teachersRes, classesRes] = await Promise.all([
          axios.get('http://localhost:5000/api/filieres'),
          axios.get('http://localhost:5000/api/enseignants/list'),
          axios.get('http://localhost:5000/api/classes')
        ]);
        
        setPrograms(normalizeApiData(programsRes));
        setTeachers(normalizeApiData(teachersRes));
        setClasses(normalizeApiData(classesRes));
      } catch (error) {
        message.error('Erreur lors du chargement des données initiales');
        console.error('Détails:', error);
        setPrograms([]);
        setTeachers([]);
        setClasses([]);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
    fetchExams();
  }, []);

  // Charger les examens
 const fetchExams = async () => {
  setLoading(true);
  try {
    const response = await axios.get('http://localhost:5000/api/examens');
    console.log('API Response:', response); // Ajoutez cette ligne
    setExams(normalizeApiData(response));
  } catch (error) {
    console.error('Error fetching exams:', error.response?.data || error.message);
    message.error('Error loading exams');
  } finally {
    setLoading(false);
  }
};


  // Charger les classes par filière
  const fetchClassesByProgram = async (programId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/filieres/${programId}/classes`);
      setFilteredClasses(normalizeApiData(response));
      setFilteredSemesters([]);
      setFilteredSubjects([]);
      form.setFieldsValue({ 
        classe_id: undefined, 
        semestre_id: undefined, 
        matiere_id: undefined 
      });
    } catch (error) {
      console.error('Erreur:', error);
      setFilteredClasses([]);
      message.error('Erreur lors du chargement des classes');
    }
  };

  // Charger les semestres par classe
  const fetchSemestersByClass = async (classId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/classes/${classId}/semestres`);
      setFilteredSemesters(normalizeApiData(response));
      setFilteredSubjects([]);
      form.setFieldsValue({ 
        semestre_id: undefined, 
        matiere_id: undefined 
      });
    } catch (error) {
      console.error('Erreur:', error);
      setFilteredSemesters([]);
      message.error('Erreur lors du chargement des semestres');
    }
  };

  // Charger les matières par semestre
  const fetchSubjectsBySemester = async (semesterId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/semestres/${semesterId}/matieres`);
      setFilteredSubjects(normalizeApiData(response));
      form.setFieldsValue({ matiere_id: undefined });
    } catch (error) {
      console.error('Erreur:', error);
      setFilteredSubjects([]);
      message.error('Erreur lors du chargement des matières');
    }
  };

  // Gestion des actions
  const handleCreate = () => {
    setCurrentExam(null);
    form.resetFields();
    setVisible(true);
  };

  const handleEdit = (exam) => {
    setCurrentExam(exam);
    fetchClassesByProgram(exam.filiere_id);
    fetchSemestersByClass(exam.classe_id);
    fetchSubjectsBySemester(exam.semestre_id);
    
    form.setFieldsValue({
      ...exam,
      date: moment(exam.date),
      heure_debut: moment(exam.heure_debut, 'HH:mm:ss'),
      heure_fin: moment(exam.heure_fin, 'HH:mm:ss')
    });
    setVisible(true);
  };

  const handleOpenPublishModal = (exam) => {
    setSelectedExam(exam);
    setPublishModalVisible(true);
  };

  const handlePublishExam = async (target) => {
    try {
      await axios.put(`http://localhost:5000/api/examens/${selectedExam.id}/publish`, { cible: target });
      message.success(`Examen publié avec succès aux ${target}`);
      fetchExams();
      setPublishModalVisible(false);
    } catch (error) {
      message.error('Erreur lors de la publication');
      console.error('Détails:', error);
    }
  };

  const handleDelete = async (examId) => {
    try {
      await axios.delete(`http://localhost:5000/api/examens/${examId}`);
      message.success('Examen supprimé avec succès');
      fetchExams();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const examData = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        heure_debut: values.heure_debut.format('HH:mm:ss'),
        heure_fin: values.heure_fin.format('HH:mm:ss'),
        enseignant_id: values.enseignant_id || null
      };

      if (currentExam) {
        await axios.put(`http://localhost:5000/api/examens/${currentExam.id}`, examData);
        message.success('Examen mis à jour avec succès');
      } else {
        await axios.post('http://localhost:5000/api/examens', examData);
        message.success('Examen créé avec succès');
      }

      setVisible(false);
      fetchExams();
    } catch (error) {
      message.error('Erreur lors de la soumission');
      console.error('Détails:', error);
    }
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Matière',
      dataIndex: 'matiere_nom',
      key: 'matiere_nom',
    },
    {
      title: 'Filière',
      dataIndex: 'filiere_nom',
      key: 'filiere_nom',
    },
    {
      title: 'Classe',
      dataIndex: 'classe_nom',
      key: 'classe_nom',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Heure',
      key: 'heure',
      render: (_, record) => (
        `${record.heure_debut} - ${record.heure_fin}`
      ),
    },
    {
      title: 'Salle',
      dataIndex: 'salle',
      key: 'salle',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag color={type === 'Examen' ? 'red' : 'blue'}>{type}</Tag>,
    },
    {
      title: 'Statut',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.diffusion_enseignants && (
            <Tag color="orange">Enseignants</Tag>
          )}
          {record.diffusion_etudiants && (
            <Tag color="green">Étudiants</Tag>
          )}
          {!record.diffusion_enseignants && !record.diffusion_etudiants && (
            <Tag color="gray">Non publié</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleOpenPublishModal(record)}
          >
            Publier
          </Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button 
    startIcon={<ArrowBack />} 
    onClick={() => navigate('/admin/dashboard')} 
    sx={{ mb: 2 }}
  >
    Retour
  </Button>
      {initialLoading ? (
        <Spin tip="Chargement des données initiales..." size="large" />
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            
            <h2>Gestion des Examens</h2>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Ajouter un Examen
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={exams}
            rowKey="id"
            loading={loading}
            scroll={{ x: true }}
          />

          {/* Modal pour créer/modifier un examen */}
          <Modal
            title={currentExam ? 'Modifier Examen' : 'Créer un Examen'}
            visible={visible}
            onOk={handleSubmit}
            onCancel={() => setVisible(false)}
            width={700}
            okText={currentExam ? 'Mettre à jour' : 'Créer'}
            cancelText="Annuler"
          >
            <Form form={form} layout="vertical">
              <Form.Item
                name="filiere_id"
                label="Filière"
                rules={[{ required: true, message: 'Veuillez sélectionner une filière' }]}
              >
                <Select
                  placeholder="Sélectionner une filière"
                  onChange={fetchClassesByProgram}
                  showSearch
                  optionFilterProp="children"
                >
                  {programs.map(program => (
                    <Option key={program.id} value={program.id}>{program.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="classe_id"
                label="Classe"
                rules={[{ required: true, message: 'Veuillez sélectionner une classe' }]}
              >
                <Select
                  placeholder="Sélectionner une classe"
                  onChange={fetchSemestersByClass}
                  disabled={filteredClasses.length === 0}
                >
                  {filteredClasses.map(classe => (
                    <Option key={classe.id} value={classe.id}>{classe.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="semestre_id"
                label="Semestre"
                rules={[{ required: true, message: 'Veuillez sélectionner un semestre' }]}
              >
                <Select
                  placeholder="Sélectionner un semestre"
                  onChange={fetchSubjectsBySemester}
                  disabled={filteredSemesters.length === 0}
                >
                  {filteredSemesters.map(semestre => (
                    <Option key={semestre.id} value={semestre.id}>Semestre {semestre.numero}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="matiere_id"
                label="Matière"
                rules={[{ required: true, message: 'Veuillez sélectionner une matière' }]}
              >
                <Select
                  placeholder="Sélectionner une matière"
                  disabled={filteredSubjects.length === 0}
                >
                  {filteredSubjects.map(matiere => (
                    <Option key={matiere.id} value={matiere.id}>{matiere.nom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="enseignant_id"
                label="Enseignant (optionnel)"
              >
                <Select
                  placeholder="Sélectionner un enseignant"
                  showSearch
                >
                  {teachers.map(teacher => (
                    <Option key={teacher.CIN} value={teacher.CIN}>{teacher.Nom_et_prénom}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="type"
                label="Type d'examen"
                rules={[{ required: true, message: 'Veuillez sélectionner un type' }]}
              >
                <Select placeholder="Sélectionner un type">
                  {examTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="date"
                label="Date"
                rules={[{ required: true, message: 'Veuillez sélectionner une date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="heure_debut"
                label="Heure de début"
                rules={[{ required: true, message: 'Veuillez sélectionner une heure de début' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="heure_fin"
                label="Heure de fin"
                rules={[{ required: true, message: 'Veuillez sélectionner une heure de fin' }]}
              >
                <TimePicker format="HH:mm" style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="salle"
                label="Salle"
                rules={[{ required: true, message: 'Veuillez entrer une salle' }]}
              >
                <Input placeholder="Entrez la salle" />
              </Form.Item>
            </Form>
          </Modal>

          {/* Modal pour publier un examen */}
          <Modal
            title="Diffuser l'examen"
            visible={publishModalVisible}
            onCancel={() => setPublishModalVisible(false)}
            footer={[
              <Button key="cancel" onClick={() => setPublishModalVisible(false)}>
                Annuler
              </Button>,
              <Button 
                key="teachers" 
                type="primary" 
                onClick={() => handlePublishExam('enseignants')}
              >
                Aux enseignants seulement
              </Button>,
              <Button 
                key="students" 
                type="primary" 
                onClick={() => handlePublishExam('etudiants')}
              >
                Aux étudiants seulement
              </Button>,
              <Button 
                key="all" 
                type="primary" 
                onClick={() => handlePublishExam('tous')}
              >
                À tous
              </Button>,
            ]}
          >
            <p>Voulez-vous diffuser l'examen suivant ?</p>
            <p><strong>Matière:</strong> {selectedExam?.matiere_nom}</p>
            <p><strong>Classe:</strong> {selectedExam?.classe_nom}</p>
            <p><strong>Date:</strong> {selectedExam?.date && moment(selectedExam.date).format('DD/MM/YYYY')}</p>
            <p><strong>Heure:</strong> {selectedExam?.heure_debut} - {selectedExam?.heure_fin}</p>
            
            <div style={{ marginTop: 20 }}>
              <h4>Statut actuel :</h4>
              {selectedExam?.diffusion_enseignants && (
                <Tag color="orange" style={{ marginRight: 8 }}>Déjà publié aux enseignants</Tag>
              )}
              {selectedExam?.diffusion_etudiants && (
                <Tag color="green" style={{ marginRight: 8 }}>Déjà publié aux étudiants</Tag>
              )}
              {!selectedExam?.diffusion_enseignants && !selectedExam?.diffusion_etudiants && (
                <Tag color="gray">Pas encore publié</Tag>
              )}
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default AdminExams;