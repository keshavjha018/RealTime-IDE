import { useState, useRef, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import icon from "../assets/logo.png";
import Client from "../components/Client";
import Editor from "../components/Editor";
import Navbar from '../components/EditorNavbar'
import ACTIONS from '../utils/SocketActions';
import { initSocket } from '../socket';
import toast from 'react-hot-toast';
import '../styles/editorPage.css'
import '../styles/sidebar.css'
import {
  useLocation,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';


export default function EditorPage() {

  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const reactNavigator = useNavigate();
  const codeRef = useRef(null);
  
  const [openSidebar, setOpenSidebar] = useState(false);
  const [codeLang, setCodeLang] = useState('cpp');
  const [theme, setTheme] = useState('dracula');
  const [clients, setClients] = useState([]);

  useEffect(() => {
    async function init() {
      socketRef.current = await initSocket();
      console.log("socketRef", socketRef);

      // Error handling
      socketRef.current.on('connect_error', (err)=> handleErrors(err));
      socketRef.current.on('connect_failed', (err)=> handleErrors(err));

      // Send join event to server - this user joined
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username : location.state?.username,
      });

      // Listen for joined events - other user joined 
      socketRef.current.on(ACTIONS.JOINED, async({clients, username, socketId}) => {

        if(username !== location.state?.username){
          toast.success(`${username} joined the room`);
          console.log(`${username} joined the room`);
        }
      
        setClients(clients);
        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current,
          socketId,
        });
      })

      // Listen for disconnected
      socketRef.current.on(ACTIONS.DISCONNECTED, 
        ({socketId, username}) => {
          toast.success(`${username} left the room`);
          // Update sidebar client list
          setClients((prev) => {
            return prev.filter(
              (client) => client.socketId !== socketId
            );
          });
      })

    }

    init();
    return () => {
      // Cleaning up listeners
      socketRef.current.off(ACTIONS.JOINED);
      socketRef.current.off(ACTIONS.DISCONNECTED);
      socketRef.current.disconnect();
    }
  },[])

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success('Room ID Copied to clipboard');

    } catch (err) {
      toast.error('Could not copy room ID');
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator('/');
  }

  const handleSidebar = () => {
    setOpenSidebar(!openSidebar)
  }

  if (!location.state) {
    return <Navigate to="/" />;
  }

  function handleErrors(e) {
    console.log("socket error", e);
    toast.error("Socket connection failed, try again later");
    // router.push('/ide');
  }

  return (
    <div className='mainWrap'>

      {/* E D I T O R */}
      <div className='editorWrap'>
        <Navbar 
          // handleSidebar={handleSidebar}
          codeLang={codeLang} setCodeLang={setCodeLang}
          theme={theme} setTheme={setTheme}
          socketRef={socketRef}
          roomId={roomId}
        />

        <div style={{height: "90%", width: "auto"}}>
          <Editor 
            codeLang={codeLang} setCodeLang={setCodeLang}
            theme={theme}
            socketRef={socketRef}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        
      </div>

      {/* S I D E B A R */}
      <div className='sidebar'>
        <div className='sidebarInner'>
          <div className='logoBox'>
            <img src={icon} alt="" className='sidebarLogo' />
            <span>Data Networks Project - Group 21</span>
          </div>

          <h3> Connected  </h3>
          <div className='clientsList'>
            {
              clients.map((client) => (
                <Client key={client.socketId} username={client.username} />
              ))
            }
          </div>
        </div>

        <button className='copyBtn btn' onClick={copyRoomId}> Copy Room ID</button>
        <button className='leaveBtn btn' onClick={leaveRoom} > Leave </button>
      </div>

    </div>
  );
}
