export type PanelId = 'nav' | 'explore' | 'trade' | 'combat' | 'crew' | 'missions' | 'planets' | 'gear' | 'inventory' | 'comms' | 'syndicate' | 'wallet' | 'actions' | 'profile';

export interface PanelDef {
  id: PanelId;
  label: string;
  spriteKey: string;
}

export const PANELS: PanelDef[] = [
  { id: 'profile',   label: 'PILOT',     spriteKey: 'icon_profile' },
  { id: 'nav',       label: 'HELM',      spriteKey: 'icon_nav' },
  { id: 'explore',   label: 'SCANNER',   spriteKey: 'icon_explore' },
  { id: 'trade',     label: 'MARKET',    spriteKey: 'icon_trade' },
  { id: 'combat',    label: 'COMBAT',    spriteKey: 'icon_combat' },
  { id: 'crew',      label: 'CONTACTS',  spriteKey: 'icon_crew' },
  { id: 'missions',  label: 'MISSIONS',  spriteKey: 'icon_missions' },
  { id: 'planets',   label: 'PLANETS',   spriteKey: 'icon_planets' },
  { id: 'gear',      label: 'LOADOUT',   spriteKey: 'icon_gear' },
  { id: 'inventory', label: 'CARGO',     spriteKey: 'icon_inventory' },
  { id: 'comms',     label: 'COMMS',     spriteKey: 'icon_comms' },
  { id: 'syndicate', label: 'SYNDICATE', spriteKey: 'icon_syndicate' },
  { id: 'wallet',    label: 'WALLET',    spriteKey: 'icon_wallet' },
  { id: 'actions',   label: 'DATABANK',  spriteKey: 'icon_actions' },
];
