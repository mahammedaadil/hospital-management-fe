import React from 'react'
import Hero from "../components/Hero";
import Departments from "../components/Departments";
import MessageForm from "../components/MessageForm";



const Home = () => {
  return (
    <>

      
      <Hero
        title={
          "Welcome to AadiCare Medical Institute | Your Trusted Healthcare Provider"
        }
        imageUrl={"/hero.png"}

      />

      <Departments />
      <MessageForm />
      
    </>
  );
};

export default Home;