import * as sp from "@skyrim-platform/skyrim-platform";
import { setObj, solveObjSetter } from "@skyrim-platform/jcontainers/JDB";
import { LEFTHAND_ARRAY, RIGHTHAND_ARRAY, VOICE_ARRAY, AMMO_ARRAY, QUICKITEM_ARRAY, MOD_KEY, MOD_NAME } from "./constants";
import { initWidgets, initVariables, printCyclesConsole, resetCyclesFunc } from "./index_fun"
import { convertKeyValue, key }  from "./utilities";

// MCM settings.
// Everything in 1.1.0 and beyond will depend on the MCM (made using MCM Helper).

// Controls - Buttons
export let upKey: key;
export let downKey: key;
export let leftKey: key;
export let rightKey: key;
export let itemUseKey: key;
export let cycleEditorKey: key;
// Controls - Hold Times
export let cycleEditorHoldTime: number;
export let pouchAccessHoldTime: number;
export let cycleButtonHoldTime: number;
export let dualCastHoldTime: number;
export let useQuickItemAltHoldTime: number;
// Controls - Control Options
export let disableControls: boolean;

// Equipping - Unequip Slots
export let leftHandCycleUnequip: boolean;
export let rightHandCycleUnequip: boolean;
export let voiceCycleUnequip: boolean;
export let ammoCycleUnequip: boolean;
// Equipping - Hold Reset
export let leftHandCycleHoldReset: boolean;
export let rightHandCycleHoldReset: boolean;
export let voiceCycleHoldReset: boolean;
export let ammoCycleHoldReset: boolean;
// Equipping - Cycle Editor
export let cycleEditorAddPotion: boolean;
// Equipping - Hold Options
export let leftHandHoldDualCast: boolean;
export let rightHandHoldDualCast: boolean;
export let useQuickItemAlt: boolean;
// Equipping - Optimal Potions
export let useOptimalHealthPotion: boolean;
export let useOptimalMagickaPotion: boolean;
export let useOptimalStaminaPotion: boolean;
// Equipping - Pouch
export let pouchOffset: number;

// Widget - Position
export let widgetEquipmentX: number;
export let widgetEquipmentY: number;
export let widgetGoldX: number;
export let widgetGoldY: number;
// Widget - Scaling
export let widgetEquipmentScale: number;
export let widgetGoldScale: number;
// Widget - Performance
export let widgetDisableOpacityTransitions: boolean;
export let widgetDisableFlashFeedback: boolean;
// Widget - Visibility
export let hideWidgets: boolean;
export let hideHandNames: boolean;
export let hideAmmoName: boolean;
export let hideGoldWidget: boolean;
// Widget - Dynamic Visibility
export let widgetDynamicVisibility: boolean;
export let widgetDVOnCombat: boolean;
export let widgetDVOnActivate: boolean;

// Misc - Messages
export let initMessage: boolean;
export let cycleEditorMessages: boolean;
// Misc - Debug
export let printCycles: boolean;
export let resetCycles: boolean;
export let uninstallMod: boolean;

// Used for initialization and changing the settings during a play session.
export function updateMCMSettings() {
    // Controls - Buttons
    upKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uUpButton:Buttons"));
    downKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uDownButton:Buttons"));
    leftKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uLeftButton:Buttons"));
    rightKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uRightButton:Buttons"));
    itemUseKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uItemUseButton:Buttons"));
    cycleEditorKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uCycleEditorButton:Buttons"));
    // Controls - Hold Times
    cycleEditorHoldTime = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fCycleEditor:HoldTimes"));
    pouchAccessHoldTime = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fPouchAccess:HoldTimes"));
    cycleButtonHoldTime = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fCycleButton:HoldTimes"));
    dualCastHoldTime = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fDualCast:HoldTimes"));
    useQuickItemAltHoldTime = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fUseQuickItemAlt:HoldTimes"));
    // Controls - Control Options
    disableControls = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bDisableControls:ControlOptions"));

    // Equipping - Unequip Slots
    leftHandCycleUnequip = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bLeftHandCycleUnequip:UnequipSlots"));
    rightHandCycleUnequip = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bRightHandCycleUnequip:UnequipSlots"));
    voiceCycleUnequip = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bVoiceCycleUnequip:UnequipSlots"));
    ammoCycleUnequip = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bAmmoCycleUnequip:UnequipSlots"));
    // Equipping - Hold Reset
    leftHandCycleHoldReset = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bLeftHandCycleHoldReset:HoldReset"));
    rightHandCycleHoldReset = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bRightHandCycleHoldReset:HoldReset"));
    voiceCycleHoldReset = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bVoiceCycleHoldReset:HoldReset"));
    ammoCycleHoldReset = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bAmmoCycleHoldReset:HoldReset"));
    // Equipping - Cycle Editor
    cycleEditorAddPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bCycleEditorAddPotion:CycleEditor"));
    // Equipping - Hold Options
    leftHandHoldDualCast = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bLeftHandHoldDualCast:HoldOptions"));
    rightHandHoldDualCast = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bRightHandHoldDualCast:HoldOptions"));
    useQuickItemAlt = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseQuickItemAlt:HoldOptions"));
    // Equipping - Optimal Potions
    useOptimalHealthPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalHealthPotion:OptimalPotions"));
    useOptimalMagickaPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalMagickaPotion:OptimalPotions"));
    useOptimalStaminaPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalStaminaPotion:OptimalPotions"));
    // Equipping - Pouch
    pouchOffset = ((sp as any).MCM.GetModSettingInt("EldenEquip", "uOffset:Pouch"));

    // Widget - Position
    widgetEquipmentX = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fEquipmentWidgetX:Position"));
    widgetEquipmentY = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fEquipmentWidgetY:Position"));
    widgetGoldX = 100 - ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fGoldWidgetX:Position"));
    widgetGoldY = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fGoldWidgetY:Position"));
    // Widget - Scale
    widgetEquipmentScale = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fEquipmentWidgetScale:Scaling"));
    widgetGoldScale = ((sp as any).MCM.GetModSettingFloat("EldenEquip", "fGoldWidgetScale:Scaling"));
    // Widget - Performance
    widgetDisableOpacityTransitions = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bDisableOpacityTransitions:Performance"));
    widgetDisableFlashFeedback = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bDisableFlashFeedback:Performance"));
    // Widget - Visibility
    hideWidgets = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bHideWidgets:Visibility"));
    hideHandNames = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bHideHandNames:Visibility"));
    hideAmmoName = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bHideAmmoName:Visibility"));
    hideGoldWidget = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bHideGoldWidget:Visibility"));
    // Widget - Dynamic Visibility
    widgetDynamicVisibility = (hideWidgets) ? false : ((sp as any).MCM.GetModSettingBool("EldenEquip", "bEnabled:DynamicVisibility"));
    widgetDVOnCombat = (widgetDynamicVisibility) ? ((sp as any).MCM.GetModSettingBool("EldenEquip", "bShowOnCombat:DynamicVisibility")) : false;
    widgetDVOnActivate = (widgetDynamicVisibility) ? ((sp as any).MCM.GetModSettingBool("EldenEquip", "bShowOnActivate:DynamicVisibility")) : false;

    // Misc - Messages
    initMessage = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bInitialization:Messages"));
    cycleEditorMessages = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bCycleEditor:Messages"));
    // Misc - Debug
    printCycles = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bPrintCycles:Debug"));
    if (printCycles) {
        // Requires initialized objects from index_fun.
        printCyclesConsole();
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bPrintCycles:Debug", false));
    }
    resetCycles = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bResetCycles:Debug"));
    if (resetCycles) {
        // Removes Elden Equip cycle arrays from JContainers
        solveObjSetter(LEFTHAND_ARRAY, 0, false);
        solveObjSetter(RIGHTHAND_ARRAY, 0, false);
        solveObjSetter(VOICE_ARRAY, 0, false);
        solveObjSetter(AMMO_ARRAY, 0, false);
        solveObjSetter(QUICKITEM_ARRAY, 0, false);
        // Resets all cycle objects' arrays found in index_fun.
        resetCyclesFunc();
        sp.Debug.messageBox(`All cycles from ${MOD_NAME} have been reset.`);
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bResetCycles:Debug", false));
    }
    uninstallMod = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUninstallMod:Debug"));
    if (uninstallMod) {
        // Removes Elden Equip from JContainers.
        setObj(MOD_KEY, 0);
        // Resets all cycle objects' arrays found in index_fun.
        resetCyclesFunc();
        sp.Debug.messageBox(`Removed all ${MOD_NAME} information stored in JContainers. Please make a game save, exit the game, and deactivate/remove Elden Equip.`);
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bUninstallMod:Debug", false));
    }

    // Applies all settings that were normally run during hot-reloads/plugin loading.
    initVariables();
    initWidgets();
}
