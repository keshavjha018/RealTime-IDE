// Create or Join a Room
import { useState } from 'react'
import icon from "../assets/logo.png";
import {v4 as uuidV4} from "uuid";
import toast from 'react-hot-toast';
import '../styles/homePage.css'
import { useNavigate } from 'react-router-dom';


export default function NewRoom() {

  const navigate = useNavigate();

  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState('');

  const createNewRoom = (e) => {
  
    // Prevents reloading
    e.preventDefault();

    // Generate new Room ID [Random]
    const id = uuidV4();

    setRoomId(id);
    toast.success("Created a new room");
  }

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error('ROOM ID & username is required');
      return;
    }

    //Redirect to that room
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
  });
  }

  // Listen to Enter key
  const handleInputEnter = (e) => {

    if (e.code === 'Enter') {
      joinRoom();
    }
  
  }

  return (
    <div className='homePageWrapper'>
      <div className='formWrapper'>

        <img src={icon} alt="madalgos-logo" className='homePageLogo' />
        <h4 className='mainLabel'> Paste Room ID to join a room</h4>

        <div className='inputGroup'>

        <input 
            type="text" 
            className='inputBox'
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleInputEnter}
          />

          <input 
            type="text" 
            className='inputBox'
            placeholder='ROOM ID' 
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handleInputEnter}
          />

          <button 
            className='btn joinBtn'
            onClick={joinRoom}
          >
            Join
          </button>

          <span className='createInfo'>
            Create a &nbsp;
            <span href="" className='createNewBtn' onClick={createNewRoom}>
              New Room
            </span>
          </span>

        </div>
      </div>
    </div>
  )
}
