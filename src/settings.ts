import * as sp from "@skyrim-platform/skyrim-platform";
import { Debug, settings } from "@skyrim-platform/skyrim-platform";
import { setObj, solveObjSetter } from "@skyrim-platform/jcontainers/JDB";
import { LEFTHAND_ARRAY, RIGHTHAND_ARRAY, VOICE_ARRAY, ARROW_ARRAY, BOLT_ARRAY, QUICKITEM_ARRAY, MOD_KEY } from "./constants";
import { initWidgets, initVariables, printCyclesConsole, resetCyclesFunc } from "./index_fun"
import { convertKeyValue, key }  from "./utilities";

// Controls - Buttons
export let upKey: key;
export let downKey: key;
export let leftKey: key;
export let rightKey: key;
export let itemUseKey: key;
export let cycleEditorKey: key;
export let visibilityPouchButton: key;
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
export let quickItemUse: number;
// Equipping - Optimal Potions
export let useOptimalHealthPotion: boolean;
export let useOptimalMagickaPotion: boolean;
export let useOptimalStaminaPotion: boolean;
// Equipping - Pouch
export let pouchOffset: number;
// Equipping - Unequip Ammo
export let unequipAmmo: boolean;
// Equipping - Lock Left Hand Cycle
export let lockLeftHandCycle: boolean;
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
export let widgetDVOnButtonPress: boolean;
// Misc - Messages
export let initMessage: boolean;
export let cycleEditorMessages: boolean;
// Misc - Debug
export let printCycles: boolean;
export let resetCycles: boolean;
export let uninstallMod: boolean;
// From elden-equip-settings.txt
// Not necessarily settings, but strings for translations
export let cycleEditorOpened: string;
export let cycleEditorClosed: string;
export let added: string;
export let removed: string;
export let isInThe: string;
export let toThe: string;
export let doesNotExistInThe: string;
export let fromThe: string;
export let leftHandCycle: string;
export let rightHandCycle: string;
export let voiceCycle: string;
export let arrowCycle: string;
export let boltCycle: string;
export let quickItemCycle: string;
export let potionOfHealthRestoration: string;
export let potionOfMagickaRestoration: string;
export let potionOfStaminaRestoration: string;
export let resetCycleText: string;
export let uninstallText: string;
export let initializationText: string;

// Used for updating strings from the elden-equip-settings.txt file
export function updateStrings() {
    // Strings - cycle editor
    cycleEditorOpened = settings["elden-equip"]["cycleEditorOpened"] as string;
    cycleEditorClosed = settings["elden-equip"]["cycleEditorClosed"] as string;
    added = settings["elden-equip"]["added"] as string;
    removed = settings["elden-equip"]["removed"] as string;
    isInThe = settings["elden-equip"]["isInThe"] as string;
    toThe = settings["elden-equip"]["toThe"] as string;
    doesNotExistInThe = settings["elden-equip"]["doesNotExistInThe"] as string;
    fromThe = settings["elden-equip"]["fromThe"] as string;
    // Strings - cycle names
    leftHandCycle = settings["elden-equip"]["leftHandCycle"] as string;
    rightHandCycle = settings["elden-equip"]["rightHandCycle"] as string;
    voiceCycle = settings["elden-equip"]["voiceCycle"] as string;
    arrowCycle = settings["elden-equip"]["arrowCycle"] as string;
    boltCycle = settings["elden-equip"]["boltCycle"] as string;
    quickItemCycle = settings["elden-equip"]["quickItemCycle"] as string;
    // Strings - potions
    potionOfHealthRestoration = settings["elden-equip"]["potionOfHealthRestoration"] as string;
    potionOfMagickaRestoration = settings["elden-equip"]["potionOfMagickaRestoration"] as string;
    potionOfStaminaRestoration = settings["elden-equip"]["potionOfStaminaRestoration"] as string;
    // Strings - messages
    resetCycleText = settings["elden-equip"]["resetCycleText"] as string;
    uninstallText = settings["elden-equip"]["uninstallText"] as string;
    initializationText = settings["elden-equip"]["initializationText"] as string;
}

// Used for initialization and changing the settings during a play session
export function updateSettings() {
    // Controls - Buttons
    upKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uUpButton:Buttons"));
    downKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uDownButton:Buttons"));
    leftKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uLeftButton:Buttons"));
    rightKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uRightButton:Buttons"));
    itemUseKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uItemUseButton:Buttons"));
    cycleEditorKey = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uCycleEditorButton:Buttons"));
    visibilityPouchButton = convertKeyValue((sp as any).MCM.GetModSettingInt("EldenEquip", "uVisibilityPouchButton:Buttons"));
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
    // Equipping - Quick Items
    quickItemUse = ((sp as any).MCM.GetModSettingInt("EldenEquip", "uQuickItemUse:QuickItems"));
    useOptimalHealthPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalHealthPotion:QuickItems"));
    useOptimalMagickaPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalMagickaPotion:QuickItems"));
    useOptimalStaminaPotion = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUseOptimalStaminaPotion:QuickItems"));
    // Equipping - Pouch
    pouchOffset = ((sp as any).MCM.GetModSettingInt("EldenEquip", "uOffset:Pouch"));
    // Equipping - Unequip Ammo
    unequipAmmo = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUnequipAmmo:UnequipAmmo"));
    // Equipping - Lock Left Hand Cycle
    lockLeftHandCycle = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bLockLeftHandCycle:LockLeftHandCycle"));
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
    widgetDVOnButtonPress = (widgetDynamicVisibility) ? ((sp as any).MCM.GetModSettingBool("EldenEquip", "bShowOnButtonPress:DynamicVisibility")) : false;
    // Misc - Messages
    initMessage = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bInitialization:Messages"));
    cycleEditorMessages = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bCycleEditor:Messages"));
    // Misc - Debug
    printCycles = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bPrintCycles:Debug"));
    if (printCycles) {
        // Requires initialized objects from index_fun
        printCyclesConsole();
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bPrintCycles:Debug", false));
    }
    resetCycles = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bResetCycles:Debug"));
    if (resetCycles) {
        // Removes Elden Equip cycle arrays from JContainers
        solveObjSetter(LEFTHAND_ARRAY, 0, false);
        solveObjSetter(RIGHTHAND_ARRAY, 0, false);
        solveObjSetter(VOICE_ARRAY, 0, false);
        solveObjSetter(ARROW_ARRAY, 0, false);
        solveObjSetter(BOLT_ARRAY, 0, false);
        solveObjSetter(QUICKITEM_ARRAY, 0, false);
        // Resets all cycle objects' arrays found in index_fun
        resetCyclesFunc();
        Debug.messageBox(resetCycleText);
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bResetCycles:Debug", false));
    }
    uninstallMod = ((sp as any).MCM.GetModSettingBool("EldenEquip", "bUninstallMod:Debug"));
    if (uninstallMod) {
        // Removes Elden Equip from JContainers
        setObj(MOD_KEY, 0);
        // Resets all cycle objects' arrays found in index_fun
        resetCyclesFunc();
        Debug.messageBox(uninstallText);
        ((sp as any).MCM.SetModSettingBool("EldenEquip", "bUninstallMod:Debug", false));
    }
    // Applies all settings that were normally run during hot-reloads/plugin loading
    initVariables();
    initWidgets();
}