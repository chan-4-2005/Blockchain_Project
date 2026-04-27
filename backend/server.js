require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// ---------------- ENV VALIDATION ----------------
const { PRIVATE_KEY, CONTRACT_ADDRESS, RPC_URL } = process.env;

if (!PRIVATE_KEY || !CONTRACT_ADDRESS || !RPC_URL) {
  console.error("❌ Missing .env variables");
  process.exit(1);
}

// ---------------- PROVIDER ----------------
const provider = new ethers.JsonRpcProvider(RPC_URL);

// ---------------- WALLET ----------------
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// ---------------- ABI ----------------
const ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_role",
        "type": "string"
      }
    ],
    "name": "assignRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "ItemRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "registerItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_role",
        "type": "string"
      }
    ],
    "name": "revokeRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "role",
        "type": "string"
      }
    ],
    "name": "RoleAssigned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "user",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "role",
        "type": "string"
      }
    ],
    "name": "RoleRevoked",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "status",
        "type": "string"
      }
    ],
    "name": "StatusUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "_newOwner",
        "type": "address"
      }
    ],
    "name": "transferItem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_status",
        "type": "string"
      }
    ],
    "name": "updateStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "DISTRIBUTOR",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      }
    ],
    "name": "getHistory",
    "outputs": [
      {
        "internalType": "string[]",
        "name": "",
        "type": "string[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_id",
        "type": "string"
      }
    ],
    "name": "getItem",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_user",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_role",
        "type": "string"
      }
    ],
    "name": "hasRole",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "items",
    "outputs": [
      {
        "internalType": "string",
        "name": "id",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "status",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MANUFACTURER",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MILITARY",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "roles",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

// ---------------- CONTRACT ----------------
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, wallet);

// ---------------- ERROR HANDLER ----------------
const getErrorMessage = (err) => {
  return (
    err?.reason ||
    err?.data?.message ||
    err?.error?.message ||
    err?.message ||
    "Transaction failed"
  );
};

// ---------------- TX HELPER ----------------
const handleTx = async (txPromise) => {
  const tx = await txPromise;
  console.log("⏳ TX:", tx.hash);
  await tx.wait();
  console.log("✅ Confirmed:", tx.hash);
  return tx.hash;
};

// ---------------- APIs ----------------

// 🔹 Assign Role (ADMIN ONLY)
app.post("/assign-role", async (req, res) => {
  const { user, role } = req.body;

  if (!user || !role) {
    return res.status(400).send("Missing user or role");
  }

  try {
    const hash = await handleTx(contract.assignRole(user, role));
    res.send(`Role assigned. TX: ${hash}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// 🔹 Register Item
app.post("/register", async (req, res) => {
  const { id, name } = req.body;

  if (!id || !name) {
    return res.status(400).send("Missing id or name");
  }

  try {
    const hash = await handleTx(contract.registerItem(id, name));
    res.send(`Item registered. TX: ${hash}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// 🔹 Update Status
app.post("/update", async (req, res) => {
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).send("Missing id or status");
  }

  try {
    const hash = await handleTx(contract.updateStatus(id, status));
    res.send(`Status updated. TX: ${hash}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// 🔹 Transfer Ownership
app.post("/transfer", async (req, res) => {
  const { id, newOwner } = req.body;

  if (!id || !newOwner) {
    return res.status(400).send("Missing id or newOwner");
  }

  try {
    const hash = await handleTx(contract.transferItem(id, newOwner));
    res.send(`Ownership transferred. TX: ${hash}`);
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// 🔹 Get Item
app.get("/item/:id", async (req, res) => {
  try {
    const item = await contract.getItem(req.params.id);

    res.json({
      id: item[0],
      name: item[1],
      owner: item[2],
      status: item[3]
    });
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// 🔹 Get History
app.get("/history/:id", async (req, res) => {
  try {
    const history = await contract.getHistory(req.params.id);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).send(getErrorMessage(err));
  }
});

// ---------------- START ----------------
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});