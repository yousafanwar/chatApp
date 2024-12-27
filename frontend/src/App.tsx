import './App.css'
import { useEffect, useState } from 'react';

function App() {

  const [data, setData] = useState("");
  async function test1(){
    const response = await fetch('http://localhost:3000/');
    const result = await response.json();
    setData(result.name);
    console.log(result);
    console.log(`Hello my name is: ${result.name}`);
  }

  useEffect(() => {
    test1();
  }, [])

  return (
    <>
      <h1>Chat App</h1>
      <p>{data}</p>
    </>
  )
}

export default App
