console.log('App.js Loaded');  

import React, { FC, useState, useEffect } from 'react'; 
import ReactDOM from 'react-dom'; 

const App: FC = () => { 
  let [TextComponent, setTextComponent] = useState<React.ComponentType<{ text: string, onChange: (text: string) => void }> | null>(null);
  let [text, setText] = useState<string>('');
  let [number, setNumber] = useState<number>(0);
 
  useEffect(() => { 
    setTimeout(async () => {
      let module = await (window as any).import('/tests/sucrase/TextInput.jsx');
      setTextComponent(() => module.default);
    }, 500);
  }, []);  
  const incrementNumber = () => {
    setNumber(number + 1);
  };

  if(TextComponent){
    return (
      <div style={{ padding: '20px' }}>
        <h1>Sucrase Dynamic Import Work Too!</h1> 
        {<TextComponent text={text} onChange={setText} /> }
      </div>
    );
  }

  return (
    <div>
      Bundless Sucrase Works!
    <p>Number: {number}</p>
    <button onClick={incrementNumber}>Increment</button>
  </div>
  );
} 

ReactDOM.render( <App />, document.getElementById('react-root') );