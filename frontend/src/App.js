import React, { useState, useEffect, useRef, Suspense } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Grid, useTexture, OrbitControls } from "@react-three/drei";

function RealisticEarth() {
  // Load high-resolution textures for a realistic look
  const [colorMap, bumpMap] = useTexture([
    'https://unpkg.com/three-globe/example/img/earth-night.jpg',
    'https://unpkg.com/three-globe/example/img/earth-topology.png'
  ]);
  const earthRef = useRef();
  
  useFrame(() => {
    // Realistic slow revolution
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={earthRef} position={[0, 0, 0]} scale={2.5}>
      <sphereGeometry args={[1, 64, 64]} />
      {/* 
        bumpMap gives the Earth realistic 3D mountains and valleys.
        emissiveMap makes the city lights glow slightly in the dark.
      */}
      <meshStandardMaterial 
        map={colorMap} 
        bumpMap={bumpMap}
        bumpScale={0.02}
        emissiveMap={colorMap} 
        emissiveIntensity={0.3} 
        emissive="#ffffff"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
}

function AnimatedBackground() {
  return (
    <Canvas style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, background: "#000000" }} camera={{ position: [0, 0, 6], fov: 60 }}>
      {/* Very subtle ambient light for the dark parts of the globe */}
      <ambientLight intensity={0.05} color="#ffffff" />
      {/* Strong directional light to simulate the sun hitting one side of the earth */}
      <directionalLight position={[10, 5, 5]} intensity={3} color="#ffffff" />
      
      {/* 3D Starfield */}
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={0.5} />

      {/* The 3D Earth wrapped in Suspense because textures load asynchronously */}
      <Suspense fallback={null}>
        <RealisticEarth />
      </Suspense>
      
      {/* Optional: Allow the user to click and drag to view the globe */}
      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </Canvas>
  );
}


function App() {

  // ---------------- STATE ----------------
  const [account, setAccount] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [isManufacturer, setIsManufacturer] = useState(false);
  const [isDistributor, setIsDistributor] = useState(false);
  const [isMilitary, setIsMilitary] = useState(false);

  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [searchId, setSearchId] = useState("");

  const [item, setItem] = useState(null);
  const [history, setHistory] = useState([]);

  const [status, setStatus] = useState("");
  const [newOwner, setNewOwner] = useState("");

  const [txHash, setTxHash] = useState("");
  const [txStatus, setTxStatus] = useState("");

  const [logs, setLogs] = useState([]);

  const [roleAddress, setRoleAddress] = useState("");
  const [roleName, setRoleName] = useState("");

  const [activeTab, setActiveTab] = useState("track");

  const [entered, setEntered] = useState(false);

  const CONTRACT_ADDRESS = "0x8ed3f75A6d29b9aed3FE0E2586bBC5ce05D1cF06";

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

  // ---------------- WALLET ----------------
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setAccount(accounts[0]);
    setShowDashboard(true);
  };

  const getContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  };

  // ---------------- ROLE CHECK ----------------
  const checkRoles = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const admin = await contract.admin();

    setIsAdmin(admin.toLowerCase() === account.toLowerCase());

    setIsManufacturer(await contract.hasRole(account, "MANUFACTURER"));
    setIsDistributor(await contract.hasRole(account, "DISTRIBUTOR"));
    setIsMilitary(await contract.hasRole(account, "MILITARY"));
  };

  useEffect(() => {
    if (account) checkRoles();
  }, [account]);

  // ---------------- TX ----------------
  const handleTx = async (txPromise) => {
    try {
      const tx = await txPromise;
      setTxHash(tx.hash);
      setTxStatus("Pending...");
      await tx.wait();
      setTxStatus("Confirmed");
      
      // Auto-hide popup after 5 seconds
      setTimeout(() => {
        setTxHash("");
        setTxStatus("");
      }, 5000);
      
    } catch (err) {
      const msg = err.reason || err.message;
      alert(msg);
      setTxStatus(msg);
      
      // Auto-hide popup after 5 seconds on error too
      setTimeout(() => {
        setTxHash("");
        setTxStatus("");
      }, 5000);
    }
  };

  // ---------------- ACTIONS ----------------
  const registerItemBlockchain = async () => {
    const contract = await getContract();
    await handleTx(contract.registerItem(id, name));
  };

  const updateStatusBlockchain = async () => {
    const contract = await getContract();
    await handleTx(contract.updateStatus(searchId, status));
  };

  const transferItemBlockchain = async () => {
    const contract = await getContract();
    await handleTx(contract.transferItem(searchId, newOwner));
  };

  const assignRole = async () => {
    const contract = await getContract();
    await handleTx(contract.assignRole(roleAddress, roleName));
  };

  const revokeRole = async () => {
    const contract = await getContract();
    await handleTx(contract.revokeRole(roleAddress, roleName));
  };

  // ---------------- FETCH ----------------
  const getItem = async () => {
    const res = await axios.get(`http://localhost:3000/item/${searchId}`);
    setItem(res.data);
  };

  const getHistory = async () => {
    const res = await axios.get(
      `http://localhost:3000/history/${searchId}`
    );
    setHistory(res.data);
  };

  // ---------------- EVENTS ----------------
  const getEvents = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

    const reg = await contract.queryFilter("ItemRegistered");
    const trans = await contract.queryFilter("OwnershipTransferred");
    const stat = await contract.queryFilter("StatusUpdated");

    setLogs([
      ...reg.map(e => ({ type: "REGISTERED", id: e.args[0] })),
      ...trans.map(e => ({ type: "TRANSFER", to: e.args[2] })),
      ...stat.map(e => ({ type: "STATUS", status: e.args[1] })),
    ]);
  };

  // ---------------- LANDING PAGE ----------------
  if (!showDashboard) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
        {/* True 3D React Three Fiber Canvas */}
        <AnimatedBackground />

        {/* Highly transparent card to let the Earth show through clearly */}
        <div className="bg-black/10 backdrop-blur-sm border border-white/10 shadow-2xl p-12 rounded-3xl flex flex-col items-center z-10 w-full max-w-3xl text-center transform transition-all hover:scale-[1.02] duration-500 relative">
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-emerald-300 to-lime-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] uppercase tracking-widest">
            Defense Supply Chain
          </h1>

          <p className="mb-10 text-white font-semibold text-lg md:text-xl tracking-widest uppercase drop-shadow-md">
            SECURE • TACTICAL • IMMUTABLE
          </p>

          <button
            onClick={connectWallet}
            className="btn-primary px-8 py-4 text-xl flex items-center gap-3 w-full sm:w-auto justify-center"
          >
            Connect Wallet
            <svg xmlns="http://www.w3.org/polymorphism" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // ---------------- DASHBOARD ----------------

// MAIN RETURN
return (
  <div className="flex min-h-screen text-white relative font-mono">
    {/* Global Background Elements */}
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] overflow-hidden">
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-lime-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute top-[60%] right-[10%] w-[40%] h-[40%] bg-stone-500/10 rounded-full blur-[120px]"></div>
    </div>

    {/* SIDEBAR */}
    <div className="w-72 glass-panel m-4 rounded-sm p-6 flex flex-col z-10 border-r border-white/5 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-lime-500 to-green-700"></div>
      
      <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-lime-400 to-green-500 mb-6 drop-shadow-md uppercase tracking-wider border-b border-lime-500/20 pb-2">
        COMMAND CENTER
      </h2>

      <div className="bg-stone-900/80 p-3 rounded-sm mb-8 border border-white/5 shadow-inner">
        <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">Authenticated ID</p>
        <p className="text-xs break-all text-lime-400 font-mono">{account}</p>
      </div>

      <div className="space-y-3 flex-1">
        {isAdmin && <button onClick={() => setActiveTab("admin")} className={activeTab === "admin" ? "nav-item-active" : "nav-item"}>Admin Panel</button>}
        {isManufacturer && <button onClick={() => setActiveTab("manufacturer")} className={activeTab === "manufacturer" ? "nav-item-active" : "nav-item"}>Manufacturer</button>}
        {isDistributor && <button onClick={() => setActiveTab("distributor")} className={activeTab === "distributor" ? "nav-item-active" : "nav-item"}>Distributor</button>}
        {isMilitary && <button onClick={() => setActiveTab("military")} className={activeTab === "military" ? "nav-item-active" : "nav-item"}>Military</button>}

        <div className="h-px bg-white/10 my-4"></div>
        <button onClick={() => setActiveTab("track")} className={activeTab === "track" ? "nav-item-active" : "nav-item"}>Track Asset</button>
        <button onClick={() => setActiveTab("logs")} className={activeTab === "logs" ? "nav-item-active" : "nav-item"}>System Logs</button>
      </div>
    </div>

    {/* MAIN */}
    <div className="flex-1 p-4 md:p-8 z-10 overflow-y-auto">

      {/* ADMIN */}
      {activeTab === "admin" && isAdmin && (
        <div className="glass-panel p-8 rounded-sm max-w-3xl border-t-2 border-lime-500/50 relative overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none" style={{ zIndex: -1 }}>
            <source src="/Drone.mp4" type="video/mp4" />
          </video>
          <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4 uppercase tracking-widest relative z-10">Admin Command</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-xs text-stone-400 mb-1 ml-1 uppercase tracking-widest">Target Wallet</label>
              <input className="glass-input p-3"
                placeholder="0x..."
                onChange={(e) => setRoleAddress(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-stone-400 mb-1 ml-1 uppercase tracking-widest">Clearance Level</label>
              <select className="glass-input p-3 appearance-none cursor-pointer"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}>
                <option value="" disabled className="bg-stone-900 text-white">Select Role...</option>
                <option value="MANUFACTURER" className="bg-stone-900 text-white">MANUFACTURER</option>
                <option value="DISTRIBUTOR" className="bg-stone-900 text-white">DISTRIBUTOR</option>
                <option value="MILITARY" className="bg-stone-900 text-white">MILITARY</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={assignRole} className="btn-primary px-6 py-2 flex-1">Assign Role</button>
            <button onClick={revokeRole} className="btn-danger px-6 py-2 flex-1">Revoke Role</button>
          </div>
        </div>
      )}

      {/* MANUFACTURER */}
      {activeTab === "manufacturer" && isManufacturer && (
        <div className="glass-panel p-8 rounded-2xl max-w-3xl relative overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none" style={{ zIndex: -1 }}>
            <source src="/Prop.mp4" type="video/mp4" />
          </video>
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 relative z-10">Register New Asset</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1 ml-1">Asset ID</label>
              <input className="glass-input p-3"
                placeholder="Unique Identifier"
                onChange={(e) => setId(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1 ml-1">Asset Name / Model</label>
              <input className="glass-input p-3"
                placeholder="Weapon System / Part"
                onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <button onClick={registerItemBlockchain} className="btn-primary px-6 py-3 w-full">
            Register Asset on Blockchain
          </button>
        </div>
      )}

      {/* DISTRIBUTOR */}
      {activeTab === "distributor" && isDistributor && (
        <div className="glass-panel p-8 rounded-2xl max-w-3xl relative overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none" style={{ zIndex: -1 }}>
            <source src="/Forward_sensor.mp4" type="video/mp4" />
          </video>
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Transfer Custody</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1 ml-1">Asset ID to Transfer</label>
              <input className="glass-input p-3"
                placeholder="Item ID"
                onChange={(e) => setSearchId(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-slate-400 mb-1 ml-1">Recipient Wallet</label>
              <input className="glass-input p-3"
                placeholder="New Owner Address"
                onChange={(e) => setNewOwner(e.target.value)} />
            </div>
          </div>
          <button onClick={transferItemBlockchain} className="btn-secondary px-6 py-3 w-full">
            Initiate Secure Transfer
          </button>
        </div>
      )}

      {/* MILITARY */}
      {activeTab === "military" && isMilitary && (
        <div className="glass-panel p-8 rounded-sm max-w-3xl border-t-2 border-amber-500/50 relative overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover opacity-30 pointer-events-none" style={{ zIndex: -1 }}>
            <source src="/Camera_sensor.mp4" type="video/mp4" />
          </video>
          <h3 className="text-2xl font-black text-white mb-6 border-b border-white/10 pb-4 uppercase tracking-widest">Update Asset Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex flex-col">
              <label className="text-xs text-stone-400 mb-1 ml-1 uppercase tracking-widest">Target Asset ID</label>
              <input className="glass-input p-3"
                placeholder="Item ID"
                onChange={(e) => setSearchId(e.target.value)} />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-stone-400 mb-1 ml-1 uppercase tracking-widest">New Status</label>
              <select className="glass-input p-3 appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value)}>
                <option value="" disabled className="bg-stone-900 text-white">Select Status...</option>
                <option value="DEPLOYED" className="bg-stone-900 text-white">DEPLOYED</option>
                <option value="IN TRANSIT" className="bg-stone-900 text-white">IN TRANSIT</option>
                <option value="MAINTENANCE" className="bg-stone-900 text-white">MAINTENANCE</option>
                <option value="DECOMMISSIONED" className="bg-stone-900 text-white">DECOMMISSIONED</option>
                <option value="DESTROYED" className="bg-stone-900 text-white">DESTROYED</option>
              </select>
            </div>
          </div>
          <button onClick={updateStatusBlockchain} className="btn-warning px-6 py-3 w-full">
            Commit Status Update
          </button>
        </div>
      )}

      {/* TRACK */}
      {activeTab === "track" && (
        <div className="glass-panel p-8 rounded-2xl max-w-4xl">
          <h3 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4">Asset Tracking Intelligence</h3>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input className="glass-input p-3 flex-1"
              placeholder="Enter Asset ID..."
              onChange={(e) => setSearchId(e.target.value)} />
            <button onClick={getItem} className="btn-secondary px-6 py-3">Fetch Details</button>
            <button onClick={getHistory} className="btn-primary px-6 py-3">Trace History</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {item && (
              <div className="bg-stone-900/80 p-6 rounded-sm border border-lime-500/20 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#84cc16" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                </div>
                <h4 className="text-lg font-bold text-lime-400 mb-4 flex items-center gap-2 uppercase tracking-widest border-b border-lime-500/20 pb-2">
                  <div className="w-2 h-2 rounded-sm bg-lime-400 animate-pulse"></div>
                  Asset Profile
                </h4>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-stone-400">UUID:</span>
                    <span className="text-white">{item.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-stone-400">Model:</span>
                    <span className="text-white">{item.name}</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-stone-400">Status Code:</span>
                    <span className="bg-lime-500/20 text-lime-300 px-3 py-1 rounded-sm border border-lime-500/30 uppercase tracking-wider text-xs">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {history.length > 0 && (
              <div className="bg-stone-900/80 p-6 rounded-sm border border-white/10 shadow-inner max-h-64 overflow-y-auto">
                <h4 className="text-lg font-bold text-amber-500 mb-4 uppercase tracking-widest border-b border-amber-500/20 pb-2">Chain of Custody</h4>
                <div className="space-y-4">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div className="w-px h-full bg-amber-500/30 absolute left-2 top-4 -z-10"></div>
                      <div className="w-4 h-4 rounded-sm bg-amber-500/20 border-2 border-amber-500 mt-1 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
                      <div className="bg-black/30 p-3 rounded-sm border border-white/5 flex-1 text-sm text-stone-300 font-mono">
                        {h}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOGS */}
      {activeTab === "logs" && (
        <div className="glass-panel p-8 rounded-sm max-w-4xl border-t-2 border-lime-500/50">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-widest">System Audit Logs</h3>
            <button onClick={getEvents} className="btn-secondary px-4 py-2 text-sm">
              Refresh Feed
            </button>
          </div>

          <div className="bg-black/60 rounded-sm border border-white/10 shadow-inner h-96 overflow-y-auto p-4 font-mono text-sm space-y-2">
            {logs.length === 0 ? (
              <p className="text-stone-500 text-center mt-10 uppercase tracking-widest">No signals intercepted.</p>
            ) : (
              logs.map((l, i) => (
                <div key={i} className="bg-white/5 p-3 rounded-sm border-l-4 border-lime-500 text-stone-300 hover:bg-white/10 transition-colors">
                  <span className="text-lime-500 mr-2">&gt;</span> {JSON.stringify(l)}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TX NOTIFICATION - FIXED AT BOTTOM RIGHT */}
      {txHash && (
        <div className="fixed bottom-8 right-8 glass-panel p-5 rounded-sm border-l-4 border-lime-500 max-w-sm z-50 animate-bounce shadow-[0_0_30px_rgba(101,163,13,0.2)]">
          <div className="flex items-center gap-3 mb-2 border-b border-white/10 pb-2">
            <div className={`w-3 h-3 rounded-sm ${txStatus === "Confirmed" ? "bg-lime-400" : "bg-amber-400 animate-pulse"}`}></div>
            <h4 className="font-bold text-white uppercase tracking-widest text-sm">Transmission Status</h4>
          </div>
          <p className="text-stone-300 text-xs uppercase tracking-wider mb-2">{txStatus}</p>
          <p className="text-xs font-mono text-lime-400 truncate bg-black/50 p-2 rounded-sm border border-white/5">
            {txHash}
          </p>
        </div>
      )}

    </div>
  </div>
);
}

export default App;