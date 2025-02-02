import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IconButton, Stack, Tooltip, Typography, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { FiSidebar as MenuIcon} from "react-icons/fi";
import { BiSolidEdit as EditNoteIcon } from "react-icons/bi";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import InfoIcon from "@mui/icons-material/Info";
import { IChat } from "@/api/v1";
import { useChatsStore } from "@/store";
import { ChatsListItem } from "./ui";
import { SearchBar } from "@/components/widgets/SearchBar/SearchBar";
import { useTheme } from "@/context/ThemeContext";
import { FixedSizeList } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";

interface ChatRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    chats: IChat[];
    currentChatId: string | null;
    onDelete: (chat: IChat) => void;
    onClick: (chat: IChat) => void;
  };
}

const ChatRow = ({ index, style, data }: ChatRowProps) => {
  const chat = data.chats[index];
  return (
    <div style={style}>
      <ChatsListItem
        key={chat.id}
        chat={chat}
        active={chat.id === data.currentChatId}
        onDelete={data.onDelete}
        onClick={() => data.onClick(chat)}
      />
    </div>
  );
};

/**
 * Chats list component
 */
export const ChatsList = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredChats, setFilteredChats] = useState<IChat[]>([]);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const isSettingsOpen = Boolean(settingsAnchorEl);

  const match = location.pathname.match(/\/chat\/(\d+)/);
  const currentChatId = match ? match[1] : null;

  const { chats, refetchChats, deleteChat } = useChatsStore();

  useEffect(() => {
    refetchChats();
  }, [refetchChats]);

  useEffect(() => {
    setFilteredChats(chats.sort((a, b) => Number(b.id) - Number(a.id)));
  }, [chats]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const filtered = chats
      .filter(chat => 
        chat.name.toLowerCase().includes(query.toLowerCase())
      )
      .sort((a, b) => Number(b.id) - Number(a.id));
    setFilteredChats(filtered);
  }, [chats]);

  const onChatClick = (chat: IChat) => {
    navigate(`/chat/${chat.id}`);
  };

  const onDeleteHandler = (chat: IChat) => {
    deleteChat(chat);
  };

  const handleSettingsClick = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSettingsOptionClick = (path: string) => {
    navigate(path);
    handleSettingsClose();
  };

  return (
    <>  {/* Title Bar */}
    <Stack 
      id="title-bar"
      direction="row"
      alignItems="flex-start"
      sx={{ 
        height: "48px",
        width: "100%",
        position: "absolute",
        top: 4,
        px: 2,
        borderBottom: `1px solid ${colors.border.divider}`,
        WebkitAppRegion: "drag",
        "& .MuiIconButton-root": {
          WebkitAppRegion: "no-drag"
        },
        // backgroundColor: colors.background.primary,
        zIndex: 1000,
      }}
    >
     

      {/* Toggle Button - Right side */}
      <Stack 
        direction="row" 
        spacing={0.6}
        sx={{ 
          p: 0.6,
          ml: 7,
          justifyContent: "flex-end",
        }}
      > 
        <Tooltip title="Toggle sidebar" placement="bottom">
          <IconButton
            onClick={() => setIsSidebarOpen(s => !s)}
            sx={{
              color: colors.text.secondary,
              padding: "2px",
              "&:hover": {
                backgroundColor: colors.background.secondary
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>

        

        <Tooltip title="New chat" placement="bottom">
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              color: colors.text.secondary,
              "&:hover": {
                backgroundColor: colors.background.secondary
              }
            }}
          >
            <EditNoteIcon />
          </IconButton>
        </Tooltip>
        
      </Stack><Typography
          variant="h6"
          sx={{
            color: colors.text.primary,
            fontSize: "1rem",
            fontWeight: 700,
            flexGrow: 1,
            marginLeft: isSidebarOpen ? 20 : 2,
            textAlign: "flex-start",
            pt: 1,
            transition: "margin-left 0.2s ease-in-out",
          }}
        >
          MegaBrain
        </Typography>
      <Stack 
        direction="row" 
        spacing={0.6}
        sx={{ 
          p: 0.6,
          ml: 7,
          justifyContent: "flex-end",
          WebkitAppRegion: "no-drag",
        }}
      >
        <Tooltip title="Settings" placement="bottom">
          <IconButton
            onClick={handleSettingsClick}
            sx={{
              color: colors.text.secondary,
              "&:hover": {
                backgroundColor: colors.background.secondary
              }
            }}
          >
            <SettingsIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={settingsAnchorEl}
          open={isSettingsOpen}
          onClose={handleSettingsClose}
          PaperProps={{
            sx: {
              backgroundColor: colors.background.secondary,
              color: colors.text.primary,
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              "& .MuiMenuItem-root": {
                "&:hover": {
                  backgroundColor: colors.background.hover,
                },
              },
            },
          }}
        >
          <MenuItem onClick={() => handleSettingsOptionClick("/settings/appearance")}>
            <ListItemIcon>
              <PaletteIcon sx={{ color: colors.text.secondary }} />
            </ListItemIcon>
            <ListItemText 
              primary="Appearance" 
              secondary="Theme and display settings"
              primaryTypographyProps={{ color: colors.text.primary }}
              secondaryTypographyProps={{ color: colors.text.secondary }}
            />
          </MenuItem>
          <MenuItem onClick={() => handleSettingsOptionClick("/settings/llm")}>
            <ListItemIcon>
              <SmartToyIcon sx={{ color: colors.text.secondary }} />
            </ListItemIcon>
            <ListItemText 
              primary="LLM Settings" 
              secondary="Model and inference settings"
              primaryTypographyProps={{ color: colors.text.primary }}
              secondaryTypographyProps={{ color: colors.text.secondary }}
            />
          </MenuItem>
          <MenuItem onClick={() => handleSettingsOptionClick("/settings/about")}>
            <ListItemIcon>
              <InfoIcon sx={{ color: colors.text.secondary }} />
            </ListItemIcon>
            <ListItemText 
              primary="About" 
              secondary="Version and system information"
              primaryTypographyProps={{ color: colors.text.primary }}
              secondaryTypographyProps={{ color: colors.text.secondary }}
            />
          </MenuItem>
        </Menu>
      </Stack>
      
    </Stack>
    <Stack 
      className="flex flex-col h-full"
      sx={{ 
        backgroundColor: colors.background.secondary,
        width: isSidebarOpen ? "260px" : "0px",
        minWidth: isSidebarOpen ? "260px" : "0px",
        transition: "width 0.2s ease-in-out",
        borderRight: `1px solid ${colors.border.divider}`,
        zIndex: 999,
      }}
    >
    

      {/* Sidebar Content */}
      {isSidebarOpen && (
        <Stack sx={{ 
          height: "calc(100% - 48px)", 
          overflow: "hidden",
          backgroundColor: colors.background.secondary 
        }}>
          <Stack 
            sx={{ 
              flexGrow: 1,
              p: 2,
              gap: 1,
              marginTop: 5,
              height: "100%"
            }}
          >
            <SearchBar 
              onSearch={handleSearch}
              placeholder="Search"
            />
            
            <div style={{ flex: 1 }}>
              <AutoSizer>
                {({ height, width }) => (
                  <FixedSizeList
                    height={height}
                    width={width}
                    itemCount={filteredChats.length}
                    itemSize={38} // Adjust this based on your ChatListItem height
                    itemData={{
                      chats: filteredChats,
                      currentChatId,
                      onDelete: onDeleteHandler,
                      onClick: onChatClick,
                    }}
                  >
                    {ChatRow}
                  </FixedSizeList>
                )}
              </AutoSizer>
            </div>

            {searchQuery && filteredChats.length === 0 && (
              <Typography
                variant="body2"
                sx={{
                  color: colors.text.secondary,
                  textAlign: "center",
                  py: 2
                }}
              >
                No chats found
              </Typography>
            )}
          </Stack>
        </Stack>
      )}
    </Stack></>
  );
};
