export default [{
  "inputs": [{
    "components": [{"internalType": "address", "name": "owner", "type": "address"}, {
      "internalType": "address",
      "name": "operator",
      "type": "address"
    }, {
      "internalType": "uint40",
      "name": "maximumNumberOfDepositsPerRound",
      "type": "uint40"
    }, {
      "internalType": "uint40",
      "name": "maximumNumberOfParticipantsPerRound",
      "type": "uint40"
    }, {"internalType": "uint40", "name": "roundDuration", "type": "uint40"}, {
      "internalType": "uint256",
      "name": "valuePerEntry",
      "type": "uint256"
    }, {"internalType": "address", "name": "protocolFeeRecipient", "type": "address"}, {
      "internalType": "uint16",
      "name": "protocolFeeBp",
      "type": "uint16"
    }, {"internalType": "bytes32", "name": "keyHash", "type": "bytes32"}, {
      "internalType": "uint64",
      "name": "subscriptionId",
      "type": "uint64"
    }, {"internalType": "address", "name": "vrfCoordinator", "type": "address"}, {
      "internalType": "address",
      "name": "reservoirOracle",
      "type": "address"
    }, {"internalType": "address", "name": "transferManager", "type": "address"}, {
      "internalType": "address",
      "name": "erc20Oracle",
      "type": "address"
    }, {"internalType": "address", "name": "weth", "type": "address"}, {
      "internalType": "uint40",
      "name": "signatureValidityPeriod",
      "type": "uint40"
    }], "internalType": "struct IFortune.ConstructorCalldata", "name": "params", "type": "tuple"
  }], "stateMutability": "nonpayable", "type": "constructor"
}, {"inputs": [], "name": "AlreadyWithdrawn", "type": "error"}, {
  "inputs": [],
  "name": "CutoffTimeNotReached",
  "type": "error"
}, {"inputs": [], "name": "DrawExpirationTimeNotReached", "type": "error"}, {
  "inputs": [],
  "name": "ERC20TransferFail",
  "type": "error"
}, {"inputs": [], "name": "ERC721TransferFromFail", "type": "error"}, {
  "inputs": [],
  "name": "InsufficientParticipants",
  "type": "error"
}, {"inputs": [], "name": "InvalidCollection", "type": "error"}, {
  "inputs": [],
  "name": "InvalidCurrency",
  "type": "error"
}, {"inputs": [], "name": "InvalidIndex", "type": "error"}, {
  "inputs": [],
  "name": "InvalidLength",
  "type": "error"
}, {"inputs": [], "name": "InvalidRoundDuration", "type": "error"}, {
  "inputs": [],
  "name": "InvalidStatus",
  "type": "error"
}, {"inputs": [], "name": "InvalidTokenType", "type": "error"}, {
  "inputs": [],
  "name": "InvalidValue",
  "type": "error"
}, {"inputs": [], "name": "IsPaused", "type": "error"}, {
  "inputs": [],
  "name": "MaximumNumberOfDepositsReached",
  "type": "error"
}, {"inputs": [], "name": "MessageIdInvalid", "type": "error"}, {
  "inputs": [],
  "name": "NotAContract",
  "type": "error"
}, {"inputs": [], "name": "NotDepositor", "type": "error"}, {
  "inputs": [],
  "name": "NotOperator",
  "type": "error"
}, {"inputs": [], "name": "NotOwner", "type": "error"}, {
  "inputs": [],
  "name": "NotPaused",
  "type": "error"
}, {"inputs": [], "name": "NotWinner", "type": "error"}, {
  "inputs": [],
  "name": "NullSignerAddress",
  "type": "error"
}, {
  "inputs": [{"internalType": "address", "name": "have", "type": "address"}, {
    "internalType": "address",
    "name": "want",
    "type": "address"
  }], "name": "OnlyCoordinatorCanFulfill", "type": "error"
}, {"inputs": [], "name": "ProtocolFeeNotPaid", "type": "error"}, {
  "inputs": [],
  "name": "RandomnessRequestAlreadyExists",
  "type": "error"
}, {"inputs": [], "name": "ReentrancyFail", "type": "error"}, {
  "inputs": [],
  "name": "RoundCannotBeClosed",
  "type": "error"
}, {"inputs": [], "name": "SignatureEOAInvalid", "type": "error"}, {
  "inputs": [],
  "name": "SignatureERC1271Invalid",
  "type": "error"
}, {"inputs": [], "name": "SignatureExpired", "type": "error"}, {
  "inputs": [{
    "internalType": "uint256",
    "name": "length",
    "type": "uint256"
  }], "name": "SignatureLengthInvalid", "type": "error"
}, {"inputs": [], "name": "SignatureParameterSInvalid", "type": "error"}, {
  "inputs": [{
    "internalType": "uint8",
    "name": "v",
    "type": "uint8"
  }], "name": "SignatureParameterVInvalid", "type": "error"
}, {"inputs": [], "name": "ZeroDeposits", "type": "error"}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "address[]",
    "name": "currencies",
    "type": "address[]"
  }, {"indexed": false, "internalType": "bool", "name": "isAllowed", "type": "bool"}],
  "name": "CurrenciesStatusUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "depositor", "type": "address"}, {
    "indexed": false,
    "internalType": "uint256",
    "name": "roundId",
    "type": "uint256"
  }, {"indexed": false, "internalType": "uint256", "name": "entriesCount", "type": "uint256"}],
  "name": "Deposited",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "roundId", "type": "uint256"}, {
    "indexed": false,
    "internalType": "address",
    "name": "depositor",
    "type": "address"
  }, {"indexed": false, "internalType": "uint256[]", "name": "depositIndices", "type": "uint256[]"}],
  "name": "DepositsWithdrawn",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "erc20Oracle", "type": "address"}],
  "name": "ERC20OracleUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint40", "name": "maximumNumberOfDepositsPerRound", "type": "uint40"}],
  "name": "MaximumNumberOfDepositsPerRoundUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{
    "indexed": false,
    "internalType": "uint40",
    "name": "maximumNumberOfParticipantsPerRound",
    "type": "uint40"
  }],
  "name": "MaximumNumberOfParticipantsPerRoundUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
  "name": "Paused",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "roundId", "type": "uint256"}, {
    "indexed": false,
    "internalType": "address",
    "name": "winner",
    "type": "address"
  }, {"indexed": false, "internalType": "uint256[]", "name": "prizeIndices", "type": "uint256[]"}],
  "name": "PrizesClaimed",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint16", "name": "protocolFeeBp", "type": "uint16"}],
  "name": "ProtocolFeeBpUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "protocolFeeRecipient", "type": "address"}],
  "name": "ProtocolFeeRecipientUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "roundId", "type": "uint256"}, {
    "indexed": false,
    "internalType": "uint256",
    "name": "requestId",
    "type": "uint256"
  }],
  "name": "RandomnessRequested",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "reservoirOracle", "type": "address"}],
  "name": "ReservoirOracleUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "indexed": true,
    "internalType": "bytes32",
    "name": "previousAdminRole",
    "type": "bytes32"
  }, {"indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32"}],
  "name": "RoleAdminChanged",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "indexed": true,
    "internalType": "address",
    "name": "account",
    "type": "address"
  }, {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}],
  "name": "RoleGranted",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "indexed": true,
    "internalType": "address",
    "name": "account",
    "type": "address"
  }, {"indexed": true, "internalType": "address", "name": "sender", "type": "address"}],
  "name": "RoleRevoked",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint40", "name": "roundDuration", "type": "uint40"}],
  "name": "RoundDurationUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "roundId", "type": "uint256"}, {
    "indexed": false,
    "internalType": "enum IFortune.RoundStatus",
    "name": "status",
    "type": "uint8"
  }],
  "name": "RoundStatusUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint40", "name": "signatureValidityPeriod", "type": "uint40"}],
  "name": "SignatureValidityPeriodUpdated",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "address", "name": "account", "type": "address"}],
  "name": "Unpaused",
  "type": "event"
}, {
  "anonymous": false,
  "inputs": [{"indexed": false, "internalType": "uint256", "name": "valuePerEntry", "type": "uint256"}],
  "name": "ValuePerEntryUpdated",
  "type": "event"
}, {
  "inputs": [],
  "name": "DEFAULT_ADMIN_ROLE",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "MAXIMUM_PROTOCOL_FEE_BP",
  "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "OPERATOR_ROLE",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "SUBSCRIPTION_ID",
  "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
  "stateMutability": "view",
  "type": "function"
}, {"inputs": [], "name": "cancel", "outputs": [], "stateMutability": "nonpayable", "type": "function"}, {
  "inputs": [],
  "name": "cancelAfterRandomnessRequest",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{
    "components": [{
      "internalType": "enum IFortune.TokenType",
      "name": "tokenType",
      "type": "uint8"
    }, {"internalType": "address", "name": "tokenAddress", "type": "address"}, {
      "internalType": "uint256[]",
      "name": "tokenIdsOrAmounts",
      "type": "uint256[]"
    }, {
      "components": [{"internalType": "bytes32", "name": "id", "type": "bytes32"}, {
        "internalType": "bytes",
        "name": "payload",
        "type": "bytes"
      }, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }],
      "internalType": "struct IFortune.ReservoirOracleFloorPrice",
      "name": "reservoirOracleFloorPrice",
      "type": "tuple"
    }], "internalType": "struct IFortune.DepositCalldata[]", "name": "deposits", "type": "tuple[]"
  }],
  "name": "cancelCurrentRoundAndDepositToTheNextRound",
  "outputs": [],
  "stateMutability": "payable",
  "type": "function"
}, {
  "inputs": [{
    "components": [{
      "internalType": "uint256",
      "name": "roundId",
      "type": "uint256"
    }, {"internalType": "uint256[]", "name": "prizeIndices", "type": "uint256[]"}],
    "internalType": "struct IFortune.ClaimPrizesCalldata[]",
    "name": "claimPrizesCalldata",
    "type": "tuple[]"
  }], "name": "claimPrizes", "outputs": [], "stateMutability": "payable", "type": "function"
}, {
  "inputs": [{
    "internalType": "uint256",
    "name": "roundId",
    "type": "uint256"
  }, {
    "components": [{
      "internalType": "enum IFortune.TokenType",
      "name": "tokenType",
      "type": "uint8"
    }, {"internalType": "address", "name": "tokenAddress", "type": "address"}, {
      "internalType": "uint256[]",
      "name": "tokenIdsOrAmounts",
      "type": "uint256[]"
    }, {
      "components": [{"internalType": "bytes32", "name": "id", "type": "bytes32"}, {
        "internalType": "bytes",
        "name": "payload",
        "type": "bytes"
      }, {"internalType": "uint256", "name": "timestamp", "type": "uint256"}, {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      }],
      "internalType": "struct IFortune.ReservoirOracleFloorPrice",
      "name": "reservoirOracleFloorPrice",
      "type": "tuple"
    }], "internalType": "struct IFortune.DepositCalldata[]", "name": "deposits", "type": "tuple[]"
  }], "name": "deposit", "outputs": [], "stateMutability": "payable", "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}, {
    "internalType": "address",
    "name": "",
    "type": "address"
  }],
  "name": "depositCount",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "drawWinner",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "erc20Oracle",
  "outputs": [{"internalType": "contract IPriceOracle", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{
    "components": [{
      "internalType": "uint256",
      "name": "roundId",
      "type": "uint256"
    }, {"internalType": "uint256[]", "name": "prizeIndices", "type": "uint256[]"}],
    "internalType": "struct IFortune.ClaimPrizesCalldata[]",
    "name": "claimPrizesCalldata",
    "type": "tuple[]"
  }],
  "name": "getClaimPrizesPaymentRequired",
  "outputs": [{"internalType": "uint256", "name": "protocolFeeOwed", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}],
  "name": "getDeposits",
  "outputs": [{
    "components": [{
      "internalType": "enum IFortune.TokenType",
      "name": "tokenType",
      "type": "uint8"
    }, {"internalType": "address", "name": "tokenAddress", "type": "address"}, {
      "internalType": "uint256",
      "name": "tokenId",
      "type": "uint256"
    }, {"internalType": "uint256", "name": "tokenAmount", "type": "uint256"}, {
      "internalType": "address",
      "name": "depositor",
      "type": "address"
    }, {"internalType": "bool", "name": "withdrawn", "type": "bool"}, {
      "internalType": "uint40",
      "name": "currentEntryIndex",
      "type": "uint40"
    }], "internalType": "struct IFortune.Deposit[]", "name": "", "type": "tuple[]"
  }],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}],
  "name": "getRoleAdmin",
  "outputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "internalType": "address",
    "name": "account",
    "type": "address"
  }], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "internalType": "address",
    "name": "account",
    "type": "address"
  }],
  "name": "hasRole",
  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "", "type": "address"}],
  "name": "isCurrencyAllowed",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "maximumNumberOfDepositsPerRound",
  "outputs": [{"internalType": "uint40", "name": "", "type": "uint40"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "maximumNumberOfParticipantsPerRound",
  "outputs": [{"internalType": "uint40", "name": "", "type": "uint40"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "paused",
  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "", "type": "address"}, {
    "internalType": "uint256",
    "name": "",
    "type": "uint256"
  }],
  "name": "prices",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "protocolFeeBp",
  "outputs": [{"internalType": "uint16", "name": "", "type": "uint16"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "protocolFeeRecipient",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "name": "randomnessRequests",
  "outputs": [{"internalType": "bool", "name": "exists", "type": "bool"}, {
    "internalType": "uint40",
    "name": "roundId",
    "type": "uint40"
  }, {"internalType": "uint256", "name": "randomWord", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "requestId", "type": "uint256"}, {
    "internalType": "uint256[]",
    "name": "randomWords",
    "type": "uint256[]"
  }], "name": "rawFulfillRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "internalType": "address",
    "name": "account",
    "type": "address"
  }], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [],
  "name": "reservoirOracle",
  "outputs": [{"internalType": "address", "name": "", "type": "address"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes32", "name": "role", "type": "bytes32"}, {
    "internalType": "address",
    "name": "account",
    "type": "address"
  }], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [],
  "name": "roundDuration",
  "outputs": [{"internalType": "uint40", "name": "", "type": "uint40"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "name": "rounds",
  "outputs": [{
    "internalType": "enum IFortune.RoundStatus",
    "name": "status",
    "type": "uint8"
  }, {"internalType": "address", "name": "winner", "type": "address"}, {
    "internalType": "uint40",
    "name": "cutoffTime",
    "type": "uint40"
  }, {"internalType": "uint40", "name": "drawnAt", "type": "uint40"}, {
    "internalType": "uint40",
    "name": "numberOfParticipants",
    "type": "uint40"
  }, {"internalType": "uint40", "name": "maximumNumberOfDeposits", "type": "uint40"}, {
    "internalType": "uint40",
    "name": "maximumNumberOfParticipants",
    "type": "uint40"
  }, {"internalType": "uint16", "name": "protocolFeeBp", "type": "uint16"}, {
    "internalType": "uint256",
    "name": "protocolFeeOwed",
    "type": "uint256"
  }, {"internalType": "uint256", "name": "valuePerEntry", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "roundsCount",
  "outputs": [{"internalType": "uint40", "name": "", "type": "uint40"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "signatureValidityPeriod",
  "outputs": [{"internalType": "uint40", "name": "", "type": "uint40"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "bytes4", "name": "interfaceId", "type": "bytes4"}],
  "name": "supportsInterface",
  "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [],
  "name": "togglePaused",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address[]", "name": "currencies", "type": "address[]"}, {
    "internalType": "bool",
    "name": "isAllowed",
    "type": "bool"
  }], "name": "updateCurrenciesStatus", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "_erc20Oracle", "type": "address"}],
  "name": "updateERC20Oracle",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint40", "name": "_maximumNumberOfDepositsPerRound", "type": "uint40"}],
  "name": "updateMaximumNumberOfDepositsPerRound",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint40", "name": "_maximumNumberOfParticipantsPerRound", "type": "uint40"}],
  "name": "updateMaximumNumberOfParticipantsPerRound",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint16", "name": "_protocolFeeBp", "type": "uint16"}],
  "name": "updateProtocolFeeBp",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "_protocolFeeRecipient", "type": "address"}],
  "name": "updateProtocolFeeRecipient",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "address", "name": "_reservoirOracle", "type": "address"}],
  "name": "updateReservoirOracle",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint40", "name": "_roundDuration", "type": "uint40"}],
  "name": "updateRoundDuration",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint40", "name": "_signatureValidityPeriod", "type": "uint40"}],
  "name": "updateSignatureValidityPeriod",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "_valuePerEntry", "type": "uint256"}],
  "name": "updateValuePerEntry",
  "outputs": [],
  "stateMutability": "nonpayable",
  "type": "function"
}, {
  "inputs": [],
  "name": "valuePerEntry",
  "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
  "stateMutability": "view",
  "type": "function"
}, {
  "inputs": [{"internalType": "uint256", "name": "roundId", "type": "uint256"}, {
    "internalType": "uint256[]",
    "name": "depositIndices",
    "type": "uint256[]"
  }], "name": "withdrawDeposits", "outputs": [], "stateMutability": "nonpayable", "type": "function"
}] as const
