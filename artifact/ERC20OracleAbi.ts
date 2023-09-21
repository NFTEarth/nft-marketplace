export default [{"inputs":[{"internalType":"address","name":"_owner","type":"address"},{"internalType":"address","name":"_weth","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"inputs":[],"name":"NoOngoingTransferInProgress","type":"error"},{"inputs":[],"name":"NotOwner","type":"error"},{"inputs":[],"name":"PoolNotAllowed","type":"error"},{"inputs":[],"name":"PriceIsZero","type":"error"},{"inputs":[],"name":"RenouncementNotInProgress","type":"error"},{"inputs":[],"name":"T","type":"error"},{"inputs":[],"name":"TransferAlreadyInProgress","type":"error"},{"inputs":[],"name":"TransferNotInProgress","type":"error"},{"inputs":[],"name":"WrongPotentialOwner","type":"error"},{"anonymous":false,"inputs":[],"name":"CancelOwnershipTransfer","type":"event"},{"anonymous":false,"inputs":[],"name":"InitiateOwnershipRenouncement","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":false,"internalType":"address","name":"potentialOwner","type":"address"}],"name":"InitiateOwnershipTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"newOwner","type":"address"}],"name":"NewOwner","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"address","name":"pool","type":"address"}],"name":"PoolAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"PoolRemoved","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint24","name":"fee","type":"uint24"}],"name":"addOracle","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"cancelOwnershipTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"confirmOwnershipRenouncement","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"confirmOwnershipTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint32","name":"secondsAgo","type":"uint32"}],"name":"getTWAP","outputs":[{"internalType":"uint256","name":"price","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"initiateOwnershipRenouncement","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newPotentialOwner","type":"address"}],"name":"initiateOwnershipTransfer","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"oracles","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"ownershipStatus","outputs":[{"internalType":"enum IOwnableTwoSteps.Status","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"potentialOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"}],"name":"removeOracle","outputs":[],"stateMutability":"nonpayable","type":"function"}] as const