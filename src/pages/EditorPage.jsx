import { useState, useRef, useEffect } from 'react';
import Editor from "../components/Editor";
import '../styles/editorPage.css'
import {
  useLocation,
  Navigate,
  useParams,
} from 'react-router-dom';


export default function EditorPage() {

  const { roomId } = useParams();
  const location = useLocation();
  const codeRef = useRef(null);

  const [codeLang, setCodeLang] = useState('cpp');
  const [theme, setTheme] = useState('dracula');


  if (!location.state) {
    return <Navigate to="/" />;
  }

  return (
    <div className='mainWrap'>

      <div className='editorWrap'>

        <div style={{height: "100%", width: "auto"}}>
          <Editor 
            codeLang={codeLang} setCodeLang={setCodeLang}
            theme={theme}
            roomId={roomId}
            onCodeChange={(code) => {
              codeRef.current = code;
            }}
          />
        </div>
        
      </div>

    </div>
  );
}
