import { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';


export default function Editor({ codeLang, theme }) {

  const editorRef = useRef(null);

  useEffect(() => {
    async function init() {

      var element = document.getElementById('realTimeEditor');

      editorRef.current = Codemirror.fromTextArea(element, {
        mode: {name: 'javascript', json: true},
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true
      });

    }

    init();
  }, [])
  

  return (
    <textarea id="realTimeEditor"></textarea>
  )
}
