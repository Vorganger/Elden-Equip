import { printConsole, settings } from "@skyrim-platform/skyrim-platform";
import { convertKeyValue, key }  from "./utilities";
import { MOD_NAME, MOD_KEY } from "./constants";

export const modSettings = settings[MOD_KEY];

// Controls - Buttons
export const upKey: key = convertKeyValue((modSettings["control_buttons"] as any)["up"] as number);
export const downKey: key = convertKeyValue((modSettings["control_buttons"] as any)["down"] as number);
export const leftKey: key = convertKeyValue((modSettings["control_buttons"] as any)["left"] as number);
export const rightKey: key = convertKeyValue((modSettings["control_buttons"] as any)["right"] as number);
export const itemUseKey: key = convertKeyValue((modSettings["control_buttons"] as any)["itemUse"] as number);
export const editModeKey: key = convertKeyValue((modSettings["control_buttons"] as any)["editMode"] as number);

// Controls - Hold Times
export const pouchAccessHoldTime: number = (modSettings["control_holdTimes"] as any)["pouchAccess"] as number;
export const editModeHoldTime: number = (modSettings["control_holdTimes"] as any)["editMode"] as number;
export const downKeyHoldTime: number = (modSettings["control_holdTimes"] as any)["downKey"] as number;

// Controls - Other Options
export const useQuickItemByHoldingDown: boolean = (modSettings["control_options"] as any)["useQuickItemByHoldingDown"] as boolean;
export const separateEditKey: boolean = (modSettings["control_options"] as any)["useEditModeButton"] as boolean;
export const disableControls: boolean = (modSettings["control_options"] as any)["disableControls"] as boolean;

// UI - Positioning
export const uiEquipmentPosition_X: number = (modSettings["position_ui"] as any)["equipmentX"] as number;
export const uiEquipmentPosition_Y: number = (modSettings["position_ui"] as any)["equipmentY"] as number;
export const uiGoldPosition_X: number = (modSettings["position_ui"] as any)["goldX"] as number;
export const uiGoldPosition_Y: number = (modSettings["position_ui"] as any)["goldY"] as number;

// UI - Scaling
export const uiEquipmentScaleMult: number = (modSettings["scale_ui"] as any)["equipment"] as number;
export const uiGoldScaleMult: number = (modSettings["scale_ui"] as any)["gold"] as number;

// UI - Visibility
export const uiVisible: boolean = !((modSettings["ui_visibility_options"] as any)["hideEverything"] as boolean);
export const uiHandNameVisibility: boolean = (modSettings["ui_visibility_options"] as any)["showHandItemNames"] as boolean;
export const uiDynamicVisibility: boolean = (modSettings["ui_visibility_options"] as any)["dynamicVisibility"] as boolean;
export const uiGoldWidgetVisibility: boolean = (modSettings["ui_visibility_options"] as any)["showGoldWidget"] as boolean;

// UI - Performance
export const uiOpacityTransitions: boolean = !((modSettings["ui_performance_options"] as any)["disableOpacityTransitions"] as boolean);
export const uiFlashFeedback: boolean = !((modSettings["ui_performance_options"] as any)["disableFlashFeedback"] as boolean);

// Debug settings
export const uiInitTime: number = (modSettings["debug"] as any)["uiInitTime"] as number;
export const printCycles: boolean = (modSettings["debug"] as any)["printCycles"] as boolean;
export const uninstallMod: boolean = (modSettings["debug"] as any)["uninstallMod"] as boolean;

function validateTimes(): boolean {
    return !(editModeHoldTime < 0 || downKeyHoldTime < 0 || pouchAccessHoldTime < 0 || uiInitTime < 0);
}

export function validateSettings(): boolean {
    let returnValue = true;
    if (!validateTimes()) {
        returnValue = false;
        printConsole(`${MOD_NAME} validateTimes(): false`);
    }
    return returnValue;
}
