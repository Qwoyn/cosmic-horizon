export type PanelId = 'nav' | 'explore' | 'trade' | 'combat' | 'crew' | 'missions' | 'planets' | 'gear' | 'comms' | 'syndicate' | 'wallet' | 'actions';

export interface PanelDef {
  id: PanelId;
  label: string;
  spriteKey: string;
}

export const PANELS: PanelDef[] = [
  { id: 'nav',      label: 'NAV MAP',  spriteKey: 'icon_nav' },
  { id: 'explore',  label: 'EXPLORE',  spriteKey: 'icon_explore' },
  { id: 'trade',    label: 'TRADE',    spriteKey: 'icon_trade' },
  { id: 'combat',   label: 'COMBAT',   spriteKey: 'icon_combat' },
  { id: 'crew',     label: 'CREW',     spriteKey: 'icon_crew' },
  { id: 'missions', label: 'MISSIONS', spriteKey: 'icon_missions' },
  { id: 'planets',  label: 'PLANETS',  spriteKey: 'icon_planets' },
  { id: 'gear',     label: 'GEAR',     spriteKey: 'icon_gear' },
  { id: 'comms',      label: 'COMMS',      spriteKey: 'icon_comms' },
  { id: 'syndicate', label: 'SYNDICATE', spriteKey: 'icon_syndicate' },
  { id: 'wallet',    label: 'WALLET',    spriteKey: 'icon_wallet' },
  { id: 'actions',   label: 'ACTIONS',   spriteKey: 'icon_actions' },
];
