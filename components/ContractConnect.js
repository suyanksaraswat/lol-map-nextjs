import React, { useState, useEffect } from "react";
import Web3 from "web3";
import { ethers } from "ethers";
import axios from "axios";
import { Button, Typography } from "@mui/material";
import { abi } from "utils/abi";

var sha256 = require("js-sha256").sha256;
const salt = "1234";

const contractAddress = "0xDaA9e437042cB8d1Afb9Ba1201fEe5159C17F32a";

const ContractConnect = (props) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [dispMsg, setDispMsg] = useState("");

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      //   return setDispMsg("Wallet Not Connected");
      return;
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    setCurrentAccount(accounts[0]);
    console.log(accounts);

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      //   setDispMsg(`Wallet Connected: ${accounts[0]}`);
    } else {
      // setDispMsg("Account Not Found");
    }
  };

  const connectWalletHandler = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      //   return setDispMsg("Wallet Not Conntected");
      return;
    }

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log("accounts", accounts);
    //   setDispMsg(`Wallet Connected: ${accounts[0]}`);
    } catch (e) {
      console.log(e);
      setDispMsg("Error, Check console log");
    }
  };

  const mintNftHandler = async () => {
    const infos = props.data;
    setDispMsg("Checking Status");
    const tileUpdate = await axios.get(
      `https://lolmapapi.herokuapp.com/map/getTile?x=${infos.x}&y=${infos.y}`
    );
    if (tileUpdate.data.status === "MINTED") {
      console.log("MINTED");
      return setDispMsg("This tile is already MINTED !");
    } else if (tileUpdate.data.status === "BOOKED") {
      console.log("BOOKED");
      return setDispMsg("This tile is BOOKED by someone else !");
    } else if (tileUpdate.data.status === "NOT_FOR_SALE") {
      console.log("NOT_FOR_SALE");
      return setDispMsg("This tile is not for SALE !");
    } else if (tileUpdate.data.status === "FOR_SALE") {
      try {
        const info = props.data;
        const succsData = {
          x: info.x,
          y: info.y,
          update: {
            status: "BOOKED",
          },
        };
        axios.post("https://lolmapapi.herokuapp.com/map/updateTile", succsData);
        const { ethereum } = window;
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const contract = new ethers.Contract(contractAddress, abi, signer);

          var hash = sha256.create();
          const price = Web3.utils.toWei(info.price.toString(), "ether");
          const hashVal = hash.update(price.toString() + salt).hex();
          setDispMsg("Minting ...");
          const ipfsData = {
            name: info.name,
            image:
              "https://ipfs.io/ipfs/QmSzD6AspMHsULuPeGVWsTywVKCFAsDVnRPVSt7832EiFY",
            external_link: "http://www.lordsofthelands.io",
            external_url: "http://www.lordsofthelands.io",
            description: "This is the Test NFT Minted",
            attributes: [
              {
                trait_type: "Type",
                value: "LAND",
              },
              {
                trait_type: "Variant",
                value: info.landType,
              },
            ],
          };

          const ipfsHash = await axios.post(
            "https://lolmapapi.herokuapp.com/map/addIPFS",
            ipfsData
          );
          console.log(ipfsHash.data);
          // const ipfsData = "https://ipfs.io/ipfs/QmReL63vqRaN2FszQkzdTZU3XB2tq81mreiyiKUMdQNhnw";
          let nftTxn = await contract.mint(
            "0x" + hashVal,
            info.tokenId,
            `http://ipfs.io/ipfs/${ipfsHash.data}`,
            0,
            { value: price }
          );
          console.log(nftTxn);
          setDispMsg(
            `Check Txn here https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
          );

          const succData = {
            x: info.x,
            y: info.y,
            update: {
              status: "MINTED",
            },
          };
          axios.post(
            "https://lolmapapi.herokuapp.com/map/updateTile",
            succData
          );
        } else {
          setDispMsg("Ethereum Object Does not Exists");
        }
      } catch (e) {
        console.log(e);
        const info = props.data;
        const succData = {
          x: info.x,
          y: info.y,
          update: {
            status: "FOR_SALE",
          },
        };
        axios.post("https://lolmapapi.herokuapp.com/map/updateTile", succData);
      }
    }
  };

  const connectWalletButton = () => {
    return (
      <Button
        fullWidth
        sx={{
          background: "linear-gradient(92deg, #72FF79 2.65%, #4AFFDE 81.91%)",
          border: "1px solid #fff",
          borderRadius: "20px",
        }}
        onClick={connectWalletHandler}
      >
        <Typography variant="button" color="darkblue">
          Connect Wallet
        </Typography>
      </Button>
    );
  };

  const mintNftButton = () => {
    return (
      <Button
        fullWidth
        sx={{
          background: "linear-gradient(92deg, #72FF79 2.65%, #4AFFDE 81.91%)",
          border: "1px solid #fff",
          borderRadius: "20px",
        }}
        disabled={Object.keys(props?.data)?.length === 0}
        onClick={mintNftHandler}
      >
        <Typography variant="button" color="darkblue">
          Mint NFT
        </Typography>
      </Button>
    );
  };

  useEffect(() => {
    checkWalletIsConnected();
  }, []);
  return (
    <div>
      {currentAccount ? mintNftButton() : connectWalletButton()} <br />
      <Typography variant="body1" sx={{ color: "white" }}>
        {dispMsg}
      </Typography>
    </div>
  );
};

export default ContractConnect;
