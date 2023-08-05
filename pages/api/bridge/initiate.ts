import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   l1_contract = Erc721Contract(address, network_id)
//   name = l1_contract.name()
//   symbol = l1_contract.symbol()
//
//   deployer_address = os.environ.get("BRIDGE_DEPLOYER_ADDRESS")
//   deployer_private_key = os.environ.get("BRIDGE_DEPLOYER_KEY")
//   nonce = w3.eth.getTransactionCount(deployer_address)
//
//   if NETWORK == "opt-mainnet":
//   transaction = self.contract.functions.createOptimismMintableERC721(
//     address, name, symbol
//   ).buildTransaction(
//     {
//       "chainId": 10,
//       "from": deployer_address,
//       "gas": 3000000,
//       "gasPrice": w3.toWei("0.001", "gwei"),
//       "nonce": nonce,
//     }
//   )
//
//   elif
//   NETWORK == "opt-goerli"
// :
//   transaction = self.contract.functions.createOptimismMintableERC721(
//     address, name, symbol
//   ).buildTransaction(
//     {
//       "chainId": 420,
//       "from": deployer_address,
//       "gas": 3000000,
//       "gasPrice": w3.toWei("0.001", "gwei"),
//       "nonce": nonce,
//     }
//   )
//
//   signed_txn = w3.eth.account.sign_transaction(
//     transaction, private_key = deployer_private_key
//   )
//   tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
//   tx = w3.eth.wait_for_transaction_receipt(tx_hash)
}