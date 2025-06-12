// components/NotificationBell.jsx
import React, { useEffect, useState } from 'react';
import { IconButton, Badge, ClickAwayListener } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const NotificationBell = ({
  apiUrl,             // URL pour charger les notifications existantes
  socketEvent,        // Nom de l'événement WebSocket (ex: 'newReclamation')
  socketRegister,     // Message à envoyer au socket à l’init (ex: 'registerAsAdmin')
  renderItem,         // Fonction pour rendre chaque notification
  title = "Notifications"
}) => {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(apiUrl);
        if (response.data.success) {
          setNotifications(response.data.data);
        }
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      }
    };

    fetchNotifications();
    if (socketRegister) socket.emit(socketRegister);

    socket.on(socketEvent, (data) => {
      setNotifications(prev => [data, ...prev]);
      setHasNewNotification(true);
    });

    return () => {
      socket.off(socketEvent);
    };
  }, [apiUrl, socketEvent, socketRegister]);

  const handleClick = () => {
    setOpen(!open);
    if (!open) setHasNewNotification(false);
  };

  const handleClickAway = () => setOpen(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={hasNewNotification ? 1 : 0} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {open && (
        <ClickAwayListener onClickAway={handleClickAway}>
          <div style={{
            position: 'absolute',
            top: '40px',
            right: 0,
            width: '320px',
            backgroundColor: 'white',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            padding: '10px',
            zIndex: 1000,
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            <h4 style={{ marginBottom: '10px' }}>{title}</h4>
            {notifications.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#777' }}>Aucune notification.</p>
            ) : (
              notifications.map((item, index) => (
                <div key={index}>
                  {renderItem(item)}
                  <hr style={{ margin: '8px 0' }} />
                </div>
              ))
            )}
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default NotificationBell;