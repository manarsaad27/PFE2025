import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Button,
  TextField,
  Select,
  MenuItem,
 
  FormControl
} from '@mui/material';
import { 
  People as PeopleIcon, 
  School as SchoolIcon, 
  Description as DescriptionIcon,
  Event as EventIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axios from 'axios';
import AdminLayout from './components/AdminLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get('/api/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get('/api/admin/users');
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchStats();
    if (selectedTab === 'users') fetchUsers();
  }, [selectedTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axios.patch(`/api/admin/users/${userId}`, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(user => user._id !== userId));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      {selectedTab === 'dashboard' && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>Tableau de bord Admin</Typography>
          
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.users || 0}</Typography>
                  <Typography variant="body2">Utilisateurs</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <SchoolIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.courses || 0}</Typography>
                  <Typography variant="body2">Cours</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <DescriptionIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.documents || 0}</Typography>
                  <Typography variant="body2">Documents</Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <EventIcon color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="h5">{stats.events || 0}</Typography>
                  <Typography variant="body2">Événements</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="h5" gutterBottom>Dernières inscriptions</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentSignups?.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
      
      {selectedTab === 'users' && (
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h4">Gestion des utilisateurs</Typography>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/users/new')}
            >
              Ajouter un utilisateur
            </Button>
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Rechercher un utilisateur"
              variant="outlined"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user._id}>
                    <TableCell>{user.firstName} {user.lastName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <MenuItem value="student">Étudiant</MenuItem>
                          <MenuItem value="teacher">Enseignant</MenuItem>
                          <MenuItem value="admin">Administrateur</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => navigate(`/admin/users/edit/${user._id}`)}>
                        <EditIcon color="primary" />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteUser(user._id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;