import styles from './mint.module.css';
import React, { useState } from 'react';


const Mint = () => {
    const [message, setMessage] = useState('');
  
    const handleSubmit = (event: { preventDefault: () => void; }) => {
      event.preventDefault();
      console.log(message);
    };
    
    
    
    return (
      <div className={styles.banner}>
        <h1>Mint Your EarthCoin</h1>
        <h2>Ready for NFTFi on L2?</h2>
      
        <h2>Mint date is:</h2>
        <p>
         Coming soon...
        </p>
      </div>
    );
  };
  
  export default Mint;