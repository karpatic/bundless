function App() {   
  let [number, setNumber] = React.useState(0); 
  const incrementNumber = () => { setNumber(number + 1); };
  
  return (
    <div>
    <h1>React App</h1> 
      Bundled React Works...
    <p>Number: {number}</p>
    <button onClick={incrementNumber}>Increment</button>
  </div>
  );
} 

const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(<App />); 