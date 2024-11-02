import React ,{ createContext, StrictMode, useState } from 'react'
import ReactDOM ,{ createRoot } from 'react-dom/client'
import App from './App.jsx'


export const Context=createContext({isAuthenticated:false})
const AppWrapper=()=>{
  const[isAuthenticated,setIsAuthenticated]=useState(false);
  const[user,setUser]=useState(false);
  
  return(
    <Context.Provider value={{isAuthenticated,setIsAuthenticated,user,setUser}}>
    <App />
    </Context.Provider>

  );

};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper/>
  </React.StrictMode>,
);
