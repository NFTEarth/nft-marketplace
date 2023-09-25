# NFTEarth Application TODO Items

Coding Tasks In Current Workflow: As part of the overall roadmap, tasks that require software updates can be most easily tracked collaboratively on GitHub.

### Todo

- [ ] Add Epoch Countdown Timer on Staking Page that resets every 7 days at 00:00 UTC Thursday
- [ ] Add % of total NFTE tokens staked on Staking page and NFTE LP page 
  - [ ] This % is of the entire NFTE token supply (so X / 100,000,000 * 100 and expressed in %)
- [ ] Ensure the claiming of first Epoch lockers will be available at 00:00 UTC Thursday, September 28 (beginning of Epoch 2)
- [ ] MAX TIME bug in UI - as the MINTIME and MAXTIME are in UNIX, we need to change the inputs from 1-12 to correspond with the smart contract precise timing otherwise it reverts in many edge cases/makes the UX confusing.
- [ ] When a very low balance of NFTE-LP in wallet and user clicks `stake` UI shows "Application error: a client-side exception has occurred (see the browser console for more information)." What is cause of this? 
- [ ] Fix the PWA bug needing to exit PWA

### In Progress

- [ ] APR Calculation for stakers - the total global APR can be reported and updated dynamically every week based on the token price and total amount deposited to the Revenue Sharing Vault.
- [ ] Claiming button for stakers - 1 column from 3 since only using Arbitrum at the moment. 
- [ ] Finalize calculation of First Epoch Revenue Share
- [ ] Create Financial Reporting Documents for each Epoch that show sources of DAO revenue by category, (ie Marketplace, NFT Collection Mint fees, NFT Collection Royalties, LP fees). Ideally link to onchain Txs like the page from FraxFacts

### Done ✓

- [x] Add Links to Gamma Vaults
- [x] Cleanup UI Color Pallete for consistency
- [x] Approvals for token allowances fixed 
