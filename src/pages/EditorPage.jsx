import { useState, useRef, useEffect } from 'react';
import icon from "../assets/logo.png";
import Client from "../components/Client";
import Editor from "../components/Editor";
import Navbar from '../components/EditorNavbar'
import ACTIONS from '../utils/SocketActions';
import { initSocket } from '../socket';
import toast from 'react-hot-toast';
import TextField from '@mui/material/TextField';
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import '../styles/editorPage.css'
import '../styles/sidebar.css'
import '../styles/runcode.css'
import {
  useLocation,
  Navigate,
  useNavigate,
  useParams,
} from 'react-router-dom';
import axios from 'axios';
import { CircularProgress } from "@material-ui/core";
import Backdrop from "@mui/material/Backdrop";

export default function EditorPage() {

  const socketRef = useRef(null);
  const { roomId } = useParams();
  const location = useLocation();
  const reactNavigator = useNavigate();
  const codeRef = useRef(null);
  
  const [codeLang, setCodeLang] = useState('cpp');
  const [theme, setTheme] = useState('dracula');
  const [clients, setClients] = useState([]);
  const [showTerminal, setShowTerminal] = useState(false);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

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

  if (!location.state) {
    return <Navigate to="/" />;
  }

  function handleErrors(e) {
    console.log("socket error", e);
    toast.error("Socket connection failed, try again later");
    // router.push('/ide');
  }

  async function handleCodeRun(){

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/runcode', {
        code: codeRef.current,
        codeLang,
        input,
      })
      
      console.log("res: ", res.data);
      setOutput(res.data.data.output);
  
      setLoading(false);
      toast.success('Executed successfully');

    } catch(err) {
      console.log(err);
      toast.error("Compiler API Server Error");
    }
  }

  return (
    <div className='mainWrap'>

      {/* E D I T O R */}
      <div className='editorWrap'>
        <Navbar 
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
          
          { showTerminal &&      
            <div className='inputbox' >
              <div className='inner-inputbox' >
                <div className='close-button' >
                  <p style={{fontSize:"large"}}>Input</p>
                    <IconButton  onClick={()=> setShowTerminal(false)}>
                          <CloseIcon />
                    </IconButton>        
                </div>

                <TextField
                  id="outlined-multiline-static" 
                  className='input-text'
                  multiline
                  rows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />

                <p style={{fontSize:"large"}}>Output</p>
                <TextField
                  id="outlined-multiline-static" 
                  className='input-text' 
                  InputProps={{
                  readOnly: true,
                  }}            
                  multiline
                  rows={3}
                  value={output}
                />
              <br/>
              <div className='runbox'>
                <button className='btn' onClick={handleCodeRun}> Run Code </button>
              </div>
              </div>
              {/* Loding Spinner */}
              <Backdrop
                sx={{
                  color: "#fff",
                  zIndex: (theme) => theme.zIndex.drawer + 1,
                }}
                open={loading}
              >
                <CircularProgress color="inherit" />
              </Backdrop>
            </div>
          }

        </div>
        
      </div>

      {/* S I D E B A R */}
      <div className='sidebar' style={{position: "sticky"}}>
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
        <button className='btn'  onClick={()=> setShowTerminal(true)} > Show Terminal </button>
        <br />
        <button className='copyBtn btn' onClick={copyRoomId}> Copy Room ID</button>
        <button className='leaveBtn btn' onClick={leaveRoom} > Leave </button>
      </div>

    </div>
  );
}
