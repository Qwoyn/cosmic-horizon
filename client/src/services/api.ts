import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

// Auth
export const register = (username: string, email: string, password: string, race: string) =>
  api.post('/auth/register', { username, email, password, race });

export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password });

export const logout = () => api.post('/auth/logout');

// Game
export const getStatus = () => api.get('/game/status');
export const moveTo = (sectorId: number) => api.post(`/game/move/${sectorId}`);
export const getSector = () => api.get('/game/sector');
export const getMap = () => api.get('/game/map');
export const scan = () => api.post('/game/scan');

// Trade
export const getOutpost = (id: string) => api.get(`/trade/outpost/${id}`);
export const buyFromOutpost = (outpostId: string, commodity: string, quantity: number) =>
  api.post('/trade/buy', { outpostId, commodity, quantity });
export const sellToOutpost = (outpostId: string, commodity: string, quantity: number) =>
  api.post('/trade/sell', { outpostId, commodity, quantity });

// Ships
export const getDealer = () => api.get('/ships/dealer');
export const buyShip = (shipTypeId: string) => api.post(`/ships/buy/${shipTypeId}`);
export const switchShip = (shipId: string) => api.post(`/ships/switch/${shipId}`);
export const toggleCloak = () => api.post('/ships/cloak');
export const ejectCargo = (commodity: string, quantity: number) =>
  api.post('/ships/eject-cargo', { commodity, quantity });

// Planets
export const getPlanet = (id: string) => api.get(`/planets/${id}`);
export const claimPlanet = (id: string) => api.post(`/planets/${id}/claim`);
export const colonizePlanet = (id: string, quantity: number) =>
  api.post(`/planets/${id}/colonize`, { quantity });
export const collectColonists = (id: string, quantity: number) =>
  api.post(`/planets/${id}/collect-colonists`, { quantity });
export const upgradePlanet = (id: string) => api.post(`/planets/${id}/upgrade`);

// Combat
export const fire = (targetPlayerId: string, energyToExpend: number) =>
  api.post('/combat/fire', { targetPlayerId, energyToExpend });
export const flee = () => api.post('/combat/flee');

// Social
export const toggleAlliance = (playerId: string) => api.post(`/social/alliance/${playerId}`);
export const createSyndicate = (name: string) => api.post('/social/syndicate/create', { name });
export const inviteToSyndicate = (playerId: string) => api.post(`/social/syndicate/invite/${playerId}`);
export const getSyndicate = () => api.get('/social/syndicate');
export const placeBounty = (targetPlayerId: string, amount: number) =>
  api.post('/social/bounty', { targetPlayerId, amount });
export const getBounties = () => api.get('/social/bounties');
export const getBountyHistory = () => api.get('/social/bounties/history');
export const getClaimedBounties = () => api.get('/social/bounties/claimed');
export const getBountiesOnMe = () => api.get('/social/bounties/on-me');
export const getCombatLog = () => api.get('/social/combat-log');

// Syndicate enhancements
export const leaveSyndicate = () => api.post('/social/syndicate/leave');
export const disbandSyndicate = () => api.post('/social/syndicate/disband');
export const promoteMember = (playerId: string) => api.post(`/social/syndicate/promote/${playerId}`);
export const kickMember = (playerId: string) => api.post(`/social/syndicate/kick/${playerId}`);
export const transferLeadership = (playerId: string) => api.post(`/social/syndicate/transfer/${playerId}`);
export const depositToTreasury = (amount: number) => api.post('/social/syndicate/deposit', { amount });
export const withdrawFromTreasury = (amount: number) => api.post('/social/syndicate/withdraw', { amount });
export const updateCharter = (charter: string) => api.post('/social/syndicate/charter', { charter });

// Deployables
export const deploy = (itemId: string, tollAmount?: number, buoyMessage?: string) =>
  api.post('/deployables/deploy', { itemId, tollAmount, buoyMessage });
export const getSectorDeployables = () => api.get('/deployables/sector');
export const getMyDeployables = () => api.get('/deployables/mine');
export const removeDeployable = (id: string) => api.delete(`/deployables/${id}`);
export const maintainDeployable = (id: string) => api.post(`/deployables/${id}/maintain`);

// Store
export const getStoreCatalog = () => api.get('/store/catalog');
export const buyStoreItem = (itemId: string) => api.post(`/store/buy/${itemId}`);
export const useStoreItem = (itemId: string, data?: any) => api.post(`/store/use/${itemId}`, data);
export const getInventory = () => api.get('/store/inventory');
export const refuel = (quantity: number) => api.post('/store/refuel', { quantity });

// Star Mall
export const getStarMallOverview = () => api.get('/starmall/overview');
export const getGarage = () => api.get('/starmall/garage');
export const storeShipInGarage = () => api.post('/starmall/garage/store');
export const retrieveShipFromGarage = (shipId: string) => api.post(`/starmall/garage/retrieve/${shipId}`);
export const getSalvageOptions = () => api.get('/starmall/salvage');
export const salvageShip = (shipId: string) => api.post(`/starmall/salvage/sell/${shipId}`);
export const getCantina = () => api.get('/starmall/cantina');
export const buyCantineIntel = () => api.post('/starmall/cantina/intel');

// Lore sequences
export const markIntroSeen = () => api.post('/game/seen-intro');
export const markPostTutorialSeen = () => api.post('/game/seen-post-tutorial');

// Tutorial
export const getTutorialStatus = () => api.get('/tutorial/status');
export const advanceTutorial = (action: string, count?: number) =>
  api.post('/tutorial/advance', { action, count });
export const skipTutorial = () => api.post('/tutorial/skip');

export default api;
