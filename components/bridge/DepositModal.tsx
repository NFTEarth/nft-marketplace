import Link from "next/link";
import {FC, ReactNode, useEffect, useState} from "react";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useSendTransaction,
  useWaitForTransaction
} from "wagmi";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {
  Text,
  Box,
  Button,
  Flex
} from 'components/primitives';
import L2ERC721BridgeAbi from 'abi/L2ERC721BridgeAbi.json';
import {L1BridgeProxyAddress} from "../../pages/bridge";
import {
  Root as DialogRoot,
  DialogTrigger,
  DialogPortal,
  Close as DialogClose
} from '@radix-ui/react-dialog'
import {Close, DialogTitle} from "@radix-ui/react-dialog";
import LoadingSpinner from "../common/LoadingSpinner";
import {AddressZero} from "@ethersproject/constants";
import {FullscreenModal} from "../common/FullscreenModal";

import ERC721Abi from 'abi/ERC721Abi.json'

type DepositProps = {
  fromChain: number
  l1Address: `0x${string}`
  l2Address: `0x${string}`
  tokenId: string
  children: ReactNode
}

export const DepositModal: FC<DepositProps> = ({ children, fromChain, l1Address, l2Address, tokenId }) => {


  return null;
};
