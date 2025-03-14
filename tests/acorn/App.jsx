console.log('App.js Loaded');  

import React from 'react'; 
import ReactDOM from 'react-dom'; 

function App() { 
  let [TextComponent, setTextComponent] = React.useState(false);
  let [text, setText] = React.useState('');
  let [number, setNumber] = React.useState(0);
 
  React.useEffect(async () => { 
    setTimeout(async () => {
      let module = await window.import('/tests/acorn/TextInput.jsx');   
      setTextComponent(() => module.default);
    }, 500);
  }, []);  
  const incrementNumber = () => {
    setNumber(number + 1);
  };

  if(TextComponent){
    return (
      <div style={{ padding: '20px' }}>
        <h1>Acorn Demo works!</h1> 
        {<TextComponent text={text} onChange={setText} /> }
      </div>
    );
  }

  return (
    <div>
      One moment plesae...
    <p>Number: {number}</p>
    <button onClick={incrementNumber}>Increment</button>
  </div>
  );
} 

ReactDOM.render( <App />, document.getElementById('react-root') );