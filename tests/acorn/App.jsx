import React from 'react'; 
import ReactDOM from 'react-dom'; 
import Child from './Child.jsx';

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
        <h1>Acorn Dynamic Import Works Too!</h1> 
        <Child text={text}/>
        {<TextComponent text={text} onChange={setText} /> }
      </div>
    );
  }

  return (
    <div>
      Bundless Acorn Works...
    <p>Number: {number}</p>
    <button onClick={incrementNumber}>Increment</button>
  </div>
  );
} 

ReactDOM.render( <App />, document.getElementById('react-root') );