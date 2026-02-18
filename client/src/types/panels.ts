export type PanelId = 'nav' | 'trade' | 'combat' | 'players' | 'missions' | 'planets' | 'inventory' | 'chat' | 'notes' | 'wallet';

export interface PanelDef {
  id: PanelId;
  label: string;
  spriteKey: string;
}

export const PANELS: PanelDef[] = [
  { id: 'nav',       label: 'NAV MAP',   spriteKey: 'icon_nav' },
  { id: 'trade',     label: 'TRADE',     spriteKey: 'icon_trade' },
  { id: 'combat',    label: 'COMBAT',    spriteKey: 'icon_combat' },
  { id: 'players',   label: 'PLAYERS',   spriteKey: 'icon_players' },
  { id: 'missions',  label: 'MISSIONS',  spriteKey: 'icon_missions' },
  { id: 'planets',   label: 'PLANETS',   spriteKey: 'icon_planets' },
  { id: 'inventory', label: 'INVENTORY', spriteKey: 'icon_inventory' },
  { id: 'chat',      label: 'CHAT',      spriteKey: 'icon_chat' },
  { id: 'notes',     label: 'NOTES',     spriteKey: 'icon_notes' },
  { id: 'wallet',    label: 'WALLET',    spriteKey: 'icon_wallet' },
];
