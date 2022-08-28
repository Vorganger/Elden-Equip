import { printConsole, settings } from "@skyrim-platform/skyrim-platform";
import { convertKeyValue, key }  from "./utilities";
import { MOD_NAME, MOD_KEY } from "./constants";

export const modSettings = settings[MOD_KEY];

// Keys
let editModeKeyCode = modSettings["editModeKey"] as number;
let upKeyCode = modSettings["upKey"] as number;
let downKeyCode = modSettings["downKey"] as number;
let leftKeyCode = modSettings["leftKey"] as number;
let rightKeyCode = modSettings["rightKey"] as number;
let useKeyCode = modSettings["useKey"] as number;
export const upKey: key = convertKeyValue(upKeyCode);
export const downKey: key = convertKeyValue(downKeyCode);
export const leftKey: key = convertKeyValue(leftKeyCode);
export const rightKey: key = convertKeyValue(rightKeyCode);
export const useKey: key = convertKeyValue(useKeyCode);
export const disableControls: boolean = modSettings["disableControls"] as boolean;

// Hold times
export const editModeHoldTime: number = modSettings["editModeHoldTime"] as number;
export const quickItemResetHoldTime: number = modSettings["quickItemResetHoldTime"] as number;
export const pouchAccessHoldTime: number = modSettings["pouchAccessHoldTime"] as number;
export const uiInitTime: number = modSettings["uiInitTime"] as number;

// UI settings
export const uiVisible: boolean = modSettings["uiVisible"] as boolean;
export const uiDynamicVisibility: boolean = modSettings["uiDynamicVisibility"] as boolean;
export const uiGoldWidgetVisibility: boolean = modSettings["uiGoldWidgetVisibility"] as boolean;
export const uiOpacityTransitions: boolean = modSettings["uiOpacityTransitions"] as boolean;
export const uiFlashFeedback: boolean = modSettings["uiFlashFeedback"] as boolean;
// Debug settings
export const printCycles: boolean = modSettings["printCycles"] as boolean;
export const uninstallMod: boolean = modSettings["uninstallMod"] as boolean;

function validateKeys(): boolean {
    let keyArr: number[] = [editModeKeyCode, upKeyCode, downKeyCode, leftKeyCode, rightKeyCode, useKeyCode];
    for (let i = 0; i < keyArr.length; i++) {
        // Out of bounds
        if (keyArr[i] < 0 || keyArr[i] > 281)
            return false;
        for (let j = 0; j < keyArr.length; j++) {
            // Not duplicate keys
            if (i === j || keyArr[i] !== keyArr[j])
                continue;
            return false;
        }
    }
    return true;
}

function validateTimes(): boolean {
    return !(editModeHoldTime < 0 || quickItemResetHoldTime < 0 || pouchAccessHoldTime < 0 || uiInitTime < 0);
}

export function validateSettings(): boolean {
    let returnValue = true;
    if (!validateKeys()) {
        returnValue = false;
        printConsole(`${MOD_NAME} validateKeys(): false`);
    }
    if (!validateTimes()) {
        returnValue = false;
        printConsole(`${MOD_NAME} validateTimes(): false`);
    }
    return returnValue;
}
