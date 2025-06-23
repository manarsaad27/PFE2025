import React, { useState, useEffect, useRef } from "react";
import { 
  Badge, 
  IconButton, 
  Popover, 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider 
} from '@mui/material';
import { FaBell } from "react-icons/fa";
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from "../hooks/useAuth";

const socket = io("http://localhost:5000");

const NotificationSystem = ({ audience }) => {
  const { token, cin } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const anchorEl = useRef(null);

  // Charge les notifications
  const loadNotifications = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/notifications?audience=${audience}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (data.success) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.read_status).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Erreur chargement notifications:", error);
    }
  };

  // Gérer l'ouverture/fermeture du popover
  const handleToggleNotifications = () => {
    const newOpenState = !open;
    setOpen(newOpenState);
    
    if (newOpenState) {
      markAllNotificationsAsRead();
      setUnreadCount(0);
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read_status: true } : n)
      );
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Erreur marquage comme lu:", error);
    }
  };

  // Marquer toutes comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/mark-as-read?audience=${audience}`);
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_status: true }))
      );
    } catch (error) {
      console.error("Erreur marquage global:", error);
    }
  };

  // Gestion des notifications temps réel
  useEffect(() => {
    if (!token) return;

    loadNotifications();
    socket.emit("registerUser", { audience });

    socket.on("newNotification", (notif) => {
      if (notif.audience === audience || notif.audience === "tous") {
        setNotifications(prev => [{ ...notif, read_status: false }, ...prev]);
        if (!open) setUnreadCount(prev => prev + 1);
      }
    });

    return () => socket.off("newNotification");
  }, [token, audience, open]);

  return (
    <>
      <IconButton
        ref={anchorEl}
        onClick={handleToggleNotifications}
        sx={{
          color: 'inherit',
          backgroundColor: 'rgba(74, 108, 247, 0.1)',
          borderRadius: '12px'
        }}
      >
        <Badge
          badgeContent={unreadCount}
          color="error"
          invisible={unreadCount === 0}
        >
          <FaBell size={20} />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl.current}
        onClose={() => setOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          '& .MuiPaper-root': {
            width: 400,
            maxHeight: '70vh',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="h6" sx={{ color: '#4a6cf7', fontWeight: 600 }}>
              Notifications
            </Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          <Divider sx={{ my: 1 }} />

          {notifications.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#666', textAlign: 'center', p: 2 }}>
              Aucune notification
            </Typography>
          ) : (
            <List dense>
              {notifications.map((notification) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read_status ? 'inherit' : 'rgba(74, 108, 247, 0.05)',
                      borderRadius: '8px',
                      mb: '4px',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'rgba(74, 108, 247, 0.1)' }
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" sx={{ color: '#4a6cf7', fontWeight: 500 }}>
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ 
                          color: '#666',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {notification.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ my: '4px' }} />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationSystem;