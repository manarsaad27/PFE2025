import React, { useState, useEffect, useRef } from "react";
import {
  IconButton,
  Popover,
  Badge,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  useMediaQuery,
  alpha
} from "@mui/material";
import { Notifications as NotificationsIcon, Close as CloseIcon } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import axios from "axios";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const CourseNotifications = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);
  const anchorRef = useRef(null);

  const loadNotifications = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/notifications?audience=enseignants");
      if (data.success) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter(n => !n.read_status).length;
        setUnreadCount(unread);
        setHasNew(unread > 0);
      }
    } catch (error) {
      console.error("Erreur chargement notifications :", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    socket.on("newNotification", notif => {
      if (notif.audience === "enseignants" || notif.audience === "tous") {
        setNotifications(prev => [{ 
          id: notif.reference_id + "-" + Date.now(),
          message: notif.message,
          read_status: false,
          created_at: notif.created_at
        }, ...prev]);
        setUnreadCount(prev => prev + 1);
        setHasNew(true);
      }
    });

    return () => socket.off("newNotification");
  }, []);
  useEffect(() => {
    socket.emit("registerAsEnseignant"); // Très important pour rejoindre la room
  }, []);
  
  const togglePopover = () => {
    const opening = !open;
    setOpen(opening);
    if (opening) {
      setUnreadCount(0);
      setHasNew(false);
    }
  };

  const handleClose = () => setOpen(false);

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={togglePopover}
        sx={{
          color: "text.secondary",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1)
          }
        }}
      >
        <Badge badgeContent={hasNew ? unreadCount : 0} color="error" invisible={!hasNew || unreadCount === 0}>
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: isMobile ? "90vw" : 400,
            maxHeight: "70vh",
            overflow: "auto",
            p: 2,
            borderRadius: 2,
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">Notifications Cours</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        {notifications.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center">
            Aucune notification
          </Typography>
        ) : (
          <List dense>
            {notifications.map((notif, i) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  sx={{
                    backgroundColor: notif.read_status ? "inherit" : alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 1,
                    mb: 1,
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <ListItemText
                    primary={<Typography variant="subtitle2">Système</Typography>}
                    secondary={<Typography variant="body2">{notif.message}</Typography>}
                  />
                </ListItem>
                {i < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
};

export default CourseNotifications;
