import { settings } from "@skyrim-platform/skyrim-platform";
import { convertKeyValue, key }  from "./utilities";
import { MOD_KEY } from "./constants";

export const modSettings = settings[MOD_KEY];

// Controls - Buttons
export const upKey: key = convertKeyValue((modSettings["control_buttons"] as any)["up"] as number);
export const downKey: key = convertKeyValue((modSettings["control_buttons"] as any)["down"] as number);
export const leftKey: key = convertKeyValue((modSettings["control_buttons"] as any)["left"] as number);
export const rightKey: key = convertKeyValue((modSettings["control_buttons"] as any)["right"] as number);
export const itemUseKey: key = convertKeyValue((modSettings["control_buttons"] as any)["itemUse"] as number);
export const editModeKey: key = convertKeyValue((modSettings["control_buttons"] as any)["editMode"] as number);

// Controls - Hold Times
export const editModeHoldTime: number = (modSettings["control_holdTimes"] as any)["editModeButton"] as number;
export const pouchAccessHoldTime: number = (modSettings["control_holdTimes"] as any)["pouchAccess"] as number;
export const downKeyHoldTime: number = (modSettings["control_holdTimes"] as any)["downButton"] as number;

// Controls - Other Options
export const useQuickItemByHoldingDownButton: boolean = (modSettings["control_options"] as any)["useQuickItemByHoldingDownButton"] as boolean;
export const disableControls: boolean = (modSettings["control_options"] as any)["disableControls"] as boolean;

// UI - Positioning
export const uiEquipmentPosition_X: number = (modSettings["position_ui"] as any)["equipmentX"] as number;
export const uiEquipmentPosition_Y: number = (modSettings["position_ui"] as any)["equipmentY"] as number;
export const uiGoldPosition_X: number = 100 - ((modSettings["position_ui"] as any)["goldX"] as number);
export const uiGoldPosition_Y: number = (modSettings["position_ui"] as any)["goldY"] as number;

// UI - Scaling
export const uiEquipmentScaleMult: number = (modSettings["scale_ui"] as any)["equipment"] as number;
export const uiGoldScaleMult: number = (modSettings["scale_ui"] as any)["gold"] as number;

// UI - Visibility
export const uiVisible: boolean = !((modSettings["ui_visibility_options"] as any)["hideEverything"] as boolean);
export const uiHandNameVisibility: boolean = !((modSettings["ui_visibility_options"] as any)["hideHandItemNames"] as boolean);
export const uiAmmoNameVisibility: boolean = !((modSettings["ui_visibility_options"] as any)["hideAmmoItemName"] as boolean);
export const uiGoldWidgetVisibility: boolean = !((modSettings["ui_visibility_options"] as any)["hideGoldWidget"] as boolean);

// UI - Dynamic Visibility
export const uiDynamicVisibility: boolean = (modSettings["dynamic_ui_visibility"] as any)["enabled"] as boolean;
export const uiDynamicVisibilityOnCombat: boolean = (uiDynamicVisibility) ? ((modSettings["dynamic_ui_visibility"] as any)["showOnCombat"] as boolean) : false;
export const uiDynamicVisibilityOnActivate: boolean = (uiDynamicVisibility) ? ((modSettings["dynamic_ui_visibility"] as any)["showOnActivateButtonPress"] as boolean) : false;

// UI - Performance
export const uiOpacityTransitions: boolean = !((modSettings["ui_performance_options"] as any)["disableOpacityTransitions"] as boolean);
export const uiFlashFeedback: boolean = !((modSettings["ui_performance_options"] as any)["disableFlashFeedback"] as boolean);

// Notifications settings
export const initNotification: boolean = (modSettings["notifications"] as any)["initialization"] as boolean;
export const editModeNotification: boolean = (modSettings["notifications"] as any)["editMode"] as boolean;

// Debug settings
export const uiInitTime: number = (modSettings["debug"] as any)["uiInitializationTime"] as number;
export const printCycles: boolean = (modSettings["debug"] as any)["printCycles"] as boolean;
export const resetCycles: boolean = (modSettings["debug"] as any)["resetCycles"] as boolean;
export const uninstallMod: boolean = (modSettings["debug"] as any)["uninstallMod"] as boolean;
