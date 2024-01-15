import styles from './inscriptions.module.css';
import React from 'react';

const Inscriptions = () => {
  return (
    <div className={styles.banner}>
      <h1>NFTEarth Inscriptions: Onchain for all time.</h1>
      <h2>What are Inscriptions?</h2>
      <h2>
        Inscriptions are a way to permanently record a message on the blockchain. 
        They are a way to leave a message for all time.
      </h2>
    </div>
  );
};

export default Inscriptions;