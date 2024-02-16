import styles from './inscriptions.module.css';
import React, { useState } from 'react';


const Inscriptions = () => {
  const [message, setMessage] = useState('');

  const handleSubmit = (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    console.log(message);
  };
  
  
  
  return (
    <div className={styles.banner}>
      <h1>NFTEarth Inscriptions: Onchain for all time.</h1>
      <h2>What are Inscriptions?</h2>
      <p>
        Inscriptions are a way to permanently record a message on the blockchain. 
        They are a way to leave a message for all time.
      </p>
      <h2>How to create an Inscription?</h2>
      <p>
       Coming soon...
      </p>
    </div>
  );
};

export default Inscriptions;