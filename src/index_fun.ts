// index_fun.ts
// This filename might be confusing, but this file
// contains functions to be used in index.ts, in which
// index.ts contains events.

import { Actor, Armor, browser, Debug, Form, FormType, Game, Input, InputDeviceType, Potion, printConsole, SlotMask, Ui, Utility } from "@skyrim-platform/skyrim-platform";
import { setObj, solveForm, solveFormSetter } from "@skyrim-platform/jcontainers/JDB";
import { Cycle, EquipmentCycle, QuickItemCycle } from "./cycles";
import { Pouch } from "./pouch";
import * as widget from "./widget";
import * as utils from "./utilities";
import * as consts from "./constants";
import * as settings from "./settings";

// --------------
// Initialization
// --------------

// Player statuses
export let playerDead = false;
export let playerInCombat = false;
export let playerHolding2H = false;
export let playerHoldingBow = false;
export let playerGold = 0;
// Menus
export let menuClosed = false;
// Keys
export let activateKeyKeyboard: utils.key = { code: -1, device: -1 };
export let activateKeyGamepad: utils.key = { code: -1, device: -1 };
// Cycles
export let leftHandCycle = new EquipmentCycle(0);
export let rightHandCycle = new EquipmentCycle(1);
export let voiceCycle = new EquipmentCycle(2);
export let ammoCycle = new EquipmentCycle(3);
export let quickItemCycle = new QuickItemCycle();
// Pouches
export let upPouch = new Pouch(0);
export let rightPouch = new Pouch(1);
export let leftPouch = new Pouch(2);
export let downPouch = new Pouch(3);

export function updateMenuClosed() {
    menuClosed = widget.isMenuClosed();
}
export function initVariables() {
    let player = Game.getPlayer();
    let rightHand = player?.getEquippedObject(1) ?? null;
    // Player states
    playerDead = player?.isDead() ?? false;
    playerInCombat = player?.isInCombat() ?? false;
    playerHolding2H = utils.isItem2H(rightHand);
    playerHoldingBow = utils.isBow(rightHand);
    playerGold = player?.getGoldAmount() ?? 0;
    // Menu state
    menuClosed = widget.isMenuClosed();
    // Default game keys
    activateKeyKeyboard = utils.convertKeyValue(Input.getMappedKey("Activate", InputDeviceType.Keyboard));
    activateKeyGamepad = utils.convertKeyValue(Input.getMappedKey("Activate", InputDeviceType.Gamepad));
}

export function initCycle(cycle: Cycle, arr: number[]) {
    cycle.arr = arr;
    cycle.autoIndex();
}

export function initCycles() {
    let player = Game.getPlayer();
    // Cycles
    initCycle(leftHandCycle, utils.readObjArrFromJCon(consts.LEFTHAND_ARRAY));
    initCycle(rightHandCycle, utils.readObjArrFromJCon(consts.RIGHTHAND_ARRAY));
    initCycle(voiceCycle, utils.readObjArrFromJCon(consts.VOICE_ARRAY));
    initCycle(ammoCycle, utils.readObjArrFromJCon(consts.AMMO_ARRAY));
    initCycle(quickItemCycle, utils.readObjArrFromJCon(consts.QUICKITEM_ARRAY));
    quickItemCycle.count = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemIdOffset(0))) ?? 0;
    quickItemCycle.offsetOneCount = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemIdOffset(1))) ?? 0;
    quickItemCycle.offsetTwoCount = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemIdOffset(2))) ?? 0;
}

export function initBrowser() {
    if (!settings.uiVisible) {
        browser.setVisible(false);
        return;
    }
    browser.loadUrl(consts.UI_PATH);
    browser.setFocused(false);
    browser.setVisible(true);
}

export function initWidgets() {
    let player = Game.getPlayer();
    widget.initWidgetPosition();
    widget.initWidgetScale();
    // Cycles
    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
        Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
        Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
    widget.updateEquippedItemWidget(0, player?.getEquippedObject(0) ?? null);
    widget.updateEquippedItemWidget(1, player?.getEquippedObject(1) ?? null);
    widget.updateEquippedItemWidget(2, player?.getEquippedObject(2) ?? null);
    widget.updateAmmoWidget();
    widget.setAmmoWidgetVisibility(playerHoldingBow);
    // Pouches
    widget.updatePouchWidget(Game.getHotkeyBoundObject(0) ?? null, 0);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(1) ?? null, 1);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(2) ?? null, 2);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(3) ?? null, 3);
    // Gold
    widget.updateGoldCount(playerGold);
    if (!settings.uiGoldWidgetVisibility)
        widget.changeVisibility("player-gold", false);
    // UI visibility
    if (menuClosed)
        widget.changeOpacity("ui", 0, 0, 1);
    // Hand name visibility
    widget.changeVisibility("left-hand-name", settings.uiHandNameVisibility);
    widget.changeVisibility("right-hand-name", settings.uiHandNameVisibility);
    widget.changeVisibility("ammo-name", settings.uiHandNameVisibility);
    // Dynamic UI visibility
    if (settings.uiDynamicVisibility) {
        widget.changeOpacity("equipment", 0, 0, 0);
        widget.changeOpacity("player-gold", 0, 0, 0);
        return;
    }
    widget.changeOpacity("equipment", 0, 0, 1);
    widget.changeOpacity("player-gold", 0, 0, 1);
}

export async function initUI() {
    initBrowser();
    await Utility.wait(settings.uiInitTime);
    initWidgets();
}

export function uninstallMod() {
    // Removes Elden Equip from JContainers
    setObj(consts.MOD_KEY, 0);
    browser.setVisible(false);
    Debug.messageBox(`${consts.MOD_NAME} uninstalled.`);
}

export function printCycles() {
    leftHandCycle.printCycleNames();
    rightHandCycle.printCycleNames();
    voiceCycle.printCycleNames();
    ammoCycle.printCycleNames();
    quickItemCycle.printCycleNames();
}

export let allowInit = true;
export let isInit = false;

export async function initialize() {
    if (!allowInit)
        return;
    allowInit = false;
    // Pre-initialization
    if (!settings.validateSettings())
        return;
    if (settings.uninstallMod) {
        uninstallMod();
        return;
    }
    // Main initialization
    initVariables();
    initCycles();
    initUI();
    printConsole(`${consts.MOD_NAME} is initialized!`);
    if (settings.printCycles)
        printCycles();
    // Delay to allow other initialize() calls
    await Utility.wait(1);
    isInit = true;
    allowInit = true;
}



// --------------------
// After initialization
// --------------------

// Control/menu states
export let downKeyHold = { isActionCompleted: false }; // prevents the same action from being run again
export let pouch = { isOpen: false };
export let editMode = { isLoading: false, isLoadingComplete: false, isOpen: false };

// Timers (duration in milliseconds)
export let currentTime = 0;
export let interval = { startTime: -1, duration: 300 };                                // Minimizes the number of functions run in the on("update") event
export let equipmentVisible = { isEnabled: false, startTime: -1, duration: 5000 };     // Shows/hides equipment widget
export let leftHandNameVisible = { isEnabled: false, startTime: -1, duration: 1500 };  // Shows/hides left hand name
export let rightHandNameVisible = { isEnabled: false, startTime: -1, duration: 1500 }; // Shows/hides right hand name
export let ammoNameVisible = { isEnabled: false, startTime: -1, duration: 1500 };      // Shows/hides ammo name
export let goldVisible = { isEnabled: false, startTime: -1, duration: 5000 };          // Shows/hides gold widget
export let editModeRemoveTimer = { isEnabled: false, startTime: -1, duration: 1000 };  // Prevents add/remove equip conflicts in edit mode

export function updateTime() {
    currentTime = Date.now();
}

export function onUpdateInterval() {
    if ((currentTime - interval.startTime) > interval.duration) {
        interval.startTime = currentTime;
        return true;
    }
    return false;
}

export function startTimer(object: {startTime: number, isEnabled: boolean}) {
    object.startTime = -1;
    object.isEnabled = true;
}

export function updateActivateKey() {
    activateKeyKeyboard = utils.convertKeyValue(Input.getMappedKey("Activate", InputDeviceType.Keyboard));
    activateKeyGamepad = utils.convertKeyValue(Input.getMappedKey("Activate", InputDeviceType.Gamepad));
}

export function updateAmmoCount(player: Actor | null) {
    if (!playerHoldingBow)
        return;
    let ammo = solveForm(consts.AMMO_RECENT) ?? null;
    if (!ammo)
        return;
    let currentAmmoCount = player?.getItemCount(ammo) ?? 0;
    if (ammoCycle.count === currentAmmoCount)
        return;
    ammoCycle.count = currentAmmoCount;
    widget.changeTextContent("ammo-count", currentAmmoCount.toString());
    if (settings.uiDynamicVisibility)
        startTimer(equipmentVisible);
}

// indexOffset: 0 (current), 1 (first next), 2 (second next)
export function updateQuickItemCount(currentCount: number, quickItemCount: number, indexOffset: number) {
    if (currentCount === quickItemCount)
        return;
    let elementPrefix = "";
    switch (indexOffset) {
        case 0:
            elementPrefix = "quick-item";
            quickItemCycle.count = currentCount;
            // Shows equipment widget, given only the main quick item is changed
            if (settings.uiDynamicVisibility && !pouch.isOpen)
                startTimer(equipmentVisible);
            break;
        case 1:
            elementPrefix = "quick-item-offset-1";
            quickItemCycle.offsetOneCount = currentCount;
            break;
        case 2:
            elementPrefix = "quick-item-offset-2";
            quickItemCycle.offsetTwoCount = currentCount;
            break;
    }
    let quickItemID = quickItemCycle.getItemIdOffset(indexOffset);
    widget.updateItemCount(`${elementPrefix}-count`, `${elementPrefix}-icon`, Game.getFormEx(quickItemID));
}

export function updateQuickItemCounts(player: Actor | null) {
    let count = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemId())) ?? 0;
    let offsetOneCount = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemIdOffset(1))) ?? 0;
    let offsetTwoCount = player?.getItemCount(Game.getFormEx(quickItemCycle.getItemIdOffset(2))) ?? 0;
    if (count !== quickItemCycle.count)
        updateQuickItemCount(count, quickItemCycle.count, 0);
    if (offsetOneCount !== quickItemCycle.offsetOneCount)
        updateQuickItemCount(offsetOneCount, quickItemCycle.offsetOneCount, 1);
    if (offsetTwoCount !== quickItemCycle.offsetTwoCount)
        updateQuickItemCount(offsetTwoCount, quickItemCycle.offsetTwoCount, 2);
}

function updatePouchObject(pouch: Pouch) {
    // Checks for changes in the hotkey assignment
    let hotkeyObject = Game.getHotkeyBoundObject(pouch.slot);
    let item = Game.getFormEx(pouch.itemID);
    if (hotkeyObject !== item) {
        pouch.itemID = hotkeyObject?.getFormID() ?? 0;
        widget.updatePouchWidget(hotkeyObject, pouch.slot);
    }
}

export function updatePouchObjects() {
    updatePouchObject(upPouch);
    updatePouchObject(rightPouch);
    updatePouchObject(leftPouch);
    updatePouchObject(downPouch);
}

function updatePouchCount(player: Actor | null, pouch: Pouch) {
    // Checks for changes in the pouch item's count
    let currentPouchCount = player?.getItemCount(Game.getFormEx(pouch.itemID)) ?? 0;
    if (pouch.count !== currentPouchCount) {
        pouch.count = currentPouchCount;
        let pouchItem = Game.getFormEx(pouch.itemID);
        widget.updatePouchWidget(pouchItem, pouch.slot);
    }
}

export function updatePouchCounts(player: Actor | null) {
    updatePouchCount(player, upPouch);
    updatePouchCount(player, rightPouch);
    updatePouchCount(player, leftPouch);
    updatePouchCount(player, downPouch);
}

export function updateGoldCount(player: Actor | null) {
    let currentCount = player?.getGoldAmount() ?? 0;
    if (currentCount === playerGold)
        return;
    widget.goldCountAnimation(currentCount - playerGold);
    playerGold = currentCount;
    if (settings.uiDynamicVisibility)
        startTimer(goldVisible);
}

export function updateLHNameVisibility() {
    if (!leftHandNameVisible.isEnabled || !settings.uiHandNameVisibility)
        return;
    if (leftHandNameVisible.startTime === -1) {
        widget.changeOpacity("left-hand-name", 0.2, 0, 1);
        leftHandNameVisible.startTime = currentTime;
        return;
    }
    if ((currentTime - leftHandNameVisible.startTime) > leftHandNameVisible.duration) {
        leftHandNameVisible.isEnabled = false;
        widget.changeOpacity("left-hand-name", 0.2, 0, 0);
        return;
    }
}
export function updateRHNameVisibility() {
    if (!rightHandNameVisible.isEnabled || !settings.uiHandNameVisibility)
        return;
    if (rightHandNameVisible.startTime === -1) {
        widget.changeOpacity("right-hand-name", 0.2, 0, 1);
        if (solveForm(consts.RIGHTHAND_RECENT)) {
            widget.changeOpacity("quick-item-offset-1", 0.2, 0, 0.5);
            widget.changeOpacity("quick-item-offset-2", 0.2, 0, 0.5);
        }
        rightHandNameVisible.startTime = currentTime;
        return;
    }
    if ((currentTime - rightHandNameVisible.startTime) > rightHandNameVisible.duration) {
        rightHandNameVisible.isEnabled = false;
        widget.changeOpacity("right-hand-name", 0.2, 0, 0);
        widget.changeOpacity("quick-item-offset-1", 0.2, 0, 1);
        widget.changeOpacity("quick-item-offset-2", 0.2, 0, 1);
        return;
    }
}
export function updateAmmoNameVisibility() {
    if (!ammoNameVisible.isEnabled)
        return;
    if (ammoNameVisible.startTime === -1) {
        if (!settings.uiHandNameVisibility)
            return;
        widget.changeOpacity("ammo-name", 0.2, 0, 1);
        widget.changeOpacity("ammo", 0.2, 0, 0.5);
        ammoNameVisible.startTime = currentTime;
        return;
    }
    if ((currentTime - ammoNameVisible.startTime) > ammoNameVisible.duration) {
        ammoNameVisible.isEnabled = false;
        widget.changeOpacity("ammo-name", 0.2, 0, 0);
        widget.changeOpacity("ammo", 0.2, 0, 1);
        return;
    }
}
export function updateEquipmentUIVisibility() {
    if (!equipmentVisible.isEnabled || playerInCombat)
        return;
    if (equipmentVisible.startTime === -1) {
        widget.changeOpacity("equipment", 0.2, 0, 1);
        equipmentVisible.startTime = currentTime;
        return;
    }
    // Cases that prevent the equipment widget from fading out.
    if (editMode.isLoading || editMode.isLoadingComplete || editMode.isOpen)
        return;
    if ((currentTime - equipmentVisible.startTime) > equipmentVisible.duration) {
        equipmentVisible.isEnabled = false;
        widget.changeOpacity("equipment", 0.2, 0, 0);
        return;
    }
}
export function updateGoldUIVisibility() {
    if (!goldVisible.isEnabled || playerInCombat)
        return;
    if (goldVisible.startTime === -1) {
        widget.changeOpacity("player-gold", 0.2, 0, 1);
        goldVisible.startTime = currentTime;
        return;
    }
    if ((currentTime - goldVisible.startTime) > goldVisible.duration) {
        goldVisible.isEnabled = false;
        widget.changeOpacity("player-gold", 0.2, 0, 0);
        return;
    }
}
export function updateCombatUIOpacity(isInCombat: boolean) {
    // Enter/exit combat opacity
    if (pouch.isOpen)
        return;
    // Enters combat
    if (isInCombat) {
        widget.changeOpacity("equipment", 0.2, 0, 1);
        widget.changeOpacity("player-gold", 0.2, 0, 1);
    }
    // Exits combat
    if (!isInCombat) {
        widget.changeOpacity("equipment", 0.2, 5, 0);
        widget.changeOpacity("player-gold", 0.2, 5, 0);
    }
    playerInCombat = isInCombat;
}

export let voice = { prevTime: 0, isRecovering: false };

export function updateShoutCooldown(player: Actor | null) {
    let currentShoutTime = player?.getVoiceRecoveryTime() ?? 0;
    if (voice.prevTime === 0 && currentShoutTime > 0) {
        voice.isRecovering = true;
        // currentShoutTime is floored since the animation parameter
        // seems to not accept float values
        widget.shoutFlashAnim(Math.floor(currentShoutTime));
        if (settings.uiDynamicVisibility)
            startTimer(equipmentVisible);
    }
    if (voice.isRecovering && currentShoutTime === 0) {
        // Triggers flash once the shout has been recharged
        widget.shoutRechargedFlashAnim();
        voice.isRecovering = false;
    }
    voice.prevTime = currentShoutTime;
}

export function updateElementOpacities() {
    updateLHNameVisibility();
    updateRHNameVisibility();
    updateAmmoNameVisibility();
    if (!settings.uiDynamicVisibility)
        return;
    updateEquipmentUIVisibility();
    updateGoldUIVisibility();
}

export function updateEditModeRemoveTimer() {
    if (!editModeRemoveTimer.isEnabled)
        return;
    if (editModeRemoveTimer.startTime === -1)
        editModeRemoveTimer.startTime = currentTime;
    if ((currentTime - editModeRemoveTimer.startTime) > editModeRemoveTimer.duration) // 1 second
        editModeRemoveTimer.isEnabled = false;
}

export function setPlayerDead(value: boolean) {
    playerDead = value;
}

export function updateWidgetVisibility() {
    if (playerDead) {
        widget.changeOpacity("ui", 0.2, 0, 0);
        return;
    }
    if (menuClosed) {
        widget.changeOpacity("ui", 0.2, 0, 1);
        return;
    }
    widget.changeOpacity("ui", 0, 0, 0);
}

// ------------
// Equip events
// ------------

export function rightHandEquipEvent(currentRH: Form) {
    if (editMode.isOpen) {
        // Unequips the automatically equipped pre-2H item. This occurs when the 2H weapon is unequipped.
        // This allows two-handed items to be removed in edit mode.
        if (currentRH === solveForm(consts.RIGHTHAND_ONEHANDED)) {
            utils.unequip(currentRH, 1);
            return;
        }
        if (!editModeRemoveTimer.isEnabled)
            rightHandCycle.add(currentRH.getFormID());
    }
    // Updates variables and cycle
    // Stores last equipped one-handed item
    let tempPlayerHolding2H = utils.isItem2H(currentRH);
    if (tempPlayerHolding2H) {
        playerHolding2H = true;
        playerHoldingBow = utils.isBow(currentRH); // bow implies two-handed
        if (playerHoldingBow)
            widget.updateAmmoWidget();
    }
    if (!tempPlayerHolding2H) {
        solveFormSetter(consts.RIGHTHAND_ONEHANDED, currentRH, true);
        playerHolding2H = false;
        playerHoldingBow = false;
    }
    solveFormSetter(consts.RIGHTHAND_RECENT, currentRH, true);
    rightHandCycle.autoIndex();
    // Updates widget
    widget.updateEquippedItemWidget(1, currentRH);
    startTimer(rightHandNameVisible);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);

    // Updates visibility. Requires bow equipped.
    if (playerHoldingBow) {
        if (settings.uiHandNameVisibility)
            widget.changeOpacity("ammo", 0, 0, 0.5); // always sets to half opacity
        widget.setAmmoWidgetVisibility(true);
        startTimer(ammoNameVisible);
        return;
    }
    widget.setAmmoWidgetVisibility(false);
    ammoNameVisible.startTime =  Date.now() - (ammoNameVisible.duration); // overrides timer
}

export function leftHandEquipEvent(currentLH: Form) {
    if (playerHolding2H)
        return;
    // Updates variables and cycle
    solveFormSetter(consts.LEFTHAND_RECENT, currentLH, true);
    if (editMode.isOpen && !editModeRemoveTimer.isEnabled)
        leftHandCycle.add(currentLH.getFormID());
    leftHandCycle.autoIndex();
    // Updates left hand widget
    widget.updateEquippedItemWidget(0, currentLH);
    startTimer(leftHandNameVisible);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function voiceEquipEvent(currentVoice: Form) {
    // Updates variables and cycle
    solveFormSetter(consts.VOICE_RECENT, currentVoice, true);
    if (editMode.isOpen && !editModeRemoveTimer.isEnabled)
        voiceCycle.add(currentVoice.getFormID());
    voiceCycle.autoIndex();
    // Updates voice widget
    widget.updateEquippedItemWidget(2, currentVoice);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function ammoEquipEvent(equipped: Form) {
    if (settings.uiHandNameVisibility)
        widget.changeOpacity("ammo", 0, 0, 0.5); // always sets to half opacity
    if (equipped === solveForm(consts.AMMO_RECENT))
        return;
    // Updates variables and cycle
    solveFormSetter(consts.AMMO_RECENT, equipped, true);
    if (editMode.isOpen && !editModeRemoveTimer.isEnabled)
        ammoCycle.add(equipped.getFormID());
    ammoCycle.autoIndex();
    // Updates ammo widget.
    widget.updateAmmoWidget();
    // Updates visibility. Requires bow equipped.
    if (!playerHoldingBow)
        return;
    startTimer(ammoNameVisible);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function equipQuickItemEvent(equipped: Form) {
    if (!editMode.isOpen)
        return;
    // Updates cycle
    let equippedType = equipped.getType();
    // Prevents shields from being added
    if (equippedType === FormType.Armor && Armor.from(equipped)?.getSlotMask() === SlotMask.Shield)
        return;
    quickItemCycle.add(equipped.getFormID());
    // Adds potion if equipped
    let player = Game.getPlayer();
    if (player?.getCombatState() === 0 && equippedType === FormType.Potion)
        player?.addItem(equipped, 1, false);
    // Updates quick item widget
    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
        Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
        Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
}

// A container change event for adding poisons to the quick item
export function quickItemAddPoisonEvent(baseObj: Form) {
    if (!editMode.isOpen)
        return;
    if (baseObj.getType() !== FormType.Potion)
        return;
    if (!Potion.from(baseObj)?.isPoison())
        return;
    quickItemCycle.add(baseObj.getFormID());
    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
        Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
        Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
}

// --------------
// Unequip events
// --------------

export function rightHandUnequipEvent() {
    solveFormSetter(consts.RIGHTHAND_RECENT, null, true);
    solveFormSetter(consts.RIGHTHAND_ONEHANDED, null, true);
    // Hides ammo count
    widget.setAmmoWidgetVisibility(false);
    playerHolding2H = false;
    // Forces next quick items to be opaque when unequipped.
    if (rightHandNameVisible.isEnabled)
        rightHandNameVisible.startTime = currentTime - (rightHandNameVisible.duration - 100);
    playerHoldingBow = false;
    // Index remains stationary in Edit Mode
    if (!editMode.isOpen)
        rightHandCycle.index = rightHandCycle.arr.length;
    widget.updateEquippedItemWidget(1, null);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function leftHandUnequipEvent() {
    solveFormSetter(consts.LEFTHAND_RECENT, null, true);
    // Index remains stationary in Edit Mode
    if (!editMode.isOpen)
        leftHandCycle.index = leftHandCycle.arr.length;
    widget.updateEquippedItemWidget(0, null);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function voiceUnequipEvent() {
    solveFormSetter(consts.VOICE_RECENT, null, true);
    // Index remains stationary in Edit Mode
    if (!editMode.isOpen)
        voiceCycle.index = voiceCycle.arr.length;
    widget.updateEquippedItemWidget(2, null);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

export function ammoUnequipEvent() {
    solveFormSetter(consts.AMMO_RECENT, null, true);
    // Index remains stationary in Edit Mode
    if (!editMode.isOpen)
        ammoCycle.index = ammoCycle.arr.length;
    // Updates ammo widget.
    widget.updateAmmoWidget();
    // Updates visibility. Requires bow equipped.
    if (!playerHoldingBow)
        return;
    // Overrides timer to finish sooner
    ammoNameVisible.startTime = currentTime - (ammoNameVisible.duration - 100);
    if (settings.uiDynamicVisibility && !pouch.isOpen)
        startTimer(equipmentVisible);
}

// -------------
// Button events
// -------------

export function leftKeyEvent(device: number, isDown: boolean) {
    if (device !== settings.leftKey.device || !isDown)
        return;
    if (editMode.isLoading || editMode.isLoadingComplete)
        return;
    if (!menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (editMode.isOpen) {
        if (playerHoldingBow) {
            ammoCycle.remove();
            startTimer(editModeRemoveTimer);
            return;
        }
        if (playerHolding2H)
            return;
        leftHandCycle.remove();
        startTimer(editModeRemoveTimer);
        return;
    }
    if (pouch.isOpen) {
        leftPouch.use();
        return;
    }
    if (playerHoldingBow) { // cycles ammo
        ammoCycle.advance();
        return;
    }
    widget.flashAnim(2);
    // Allows visibility even when unequipped
    if (settings.uiDynamicVisibility)
        startTimer(equipmentVisible);
    // Prevents left hand cycling while holding two-handed weapon
    if (playerHolding2H) {
        startTimer(leftHandNameVisible);
        return;
    }
    leftHandCycle.advance();
}

export function rightKeyEvent(device: number, isDown: boolean) {
    if (device !== settings.rightKey.device || !isDown)
        return;
    if (editMode.isLoading || editMode.isLoadingComplete)
        return;
    if (!menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (editMode.isOpen) {
        rightHandCycle.remove();
        startTimer(editModeRemoveTimer);
        return;
    }
    if (pouch.isOpen) {
        rightPouch.use();
        return;
    }
    rightHandCycle.advance();
    widget.flashAnim(3);
    // Allows visibility even when unequipped
    if (settings.uiDynamicVisibility)
        startTimer(equipmentVisible);
}

export function upKeyEvent(device: number, isDown: boolean) {
    if (device !== settings.upKey.device || !isDown)
        return;
    if (editMode.isLoading || editMode.isLoadingComplete)
        return;
    if (!menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (editMode.isOpen) {
        voiceCycle.remove();
        startTimer(editModeRemoveTimer);
        return;
    }
    if (pouch.isOpen) {
        upPouch.use();
        return;
    }
    widget.flashAnim(0);
    if (settings.uiDynamicVisibility) {
        let prevVisible = equipmentVisible.isEnabled;
        startTimer(equipmentVisible);
        if (!prevVisible)
            return;
    }
    voiceCycle.advance();
}

// To save some lines of code here.
function advanceQuickItemCycle() {
    if (editMode.isOpen) {
        quickItemCycle.remove();
        widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
            Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
            Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
        return;
    }
    if (pouch.isOpen) {
        downPouch.use();
        return;
    }
    if (settings.uiDynamicVisibility) {
        let prevVisible = equipmentVisible.isEnabled;
        startTimer(equipmentVisible);
        if (!prevVisible)
            return;
    }
    widget.flashAnim(1);
    quickItemCycle.advance();
    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
        Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
        Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
}

export function downKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.downKey.device)
        return;
    if (editMode.isLoading || editMode.isLoadingComplete)
        return;
    if (!menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (isDown) {
        if (settings.useQuickItemByHoldingDown)
            return;
        advanceQuickItemCycle();
        return;
    }
    if (isUp) {
        if (downKeyHold.isActionCompleted) {
            downKeyHold.isActionCompleted = false;
            return;
        }
        if (!settings.useQuickItemByHoldingDown)
            return;
        advanceQuickItemCycle();
        return;
    }
    if (isHeld) {
        if (heldDuration < settings.downKeyHoldTime - 0.1 ||
            heldDuration > settings.downKeyHoldTime + 0.1 ||
            Ui.isMenuOpen("LootMenu")) {
                return;
        }
        // Prevents the desired action from being run again.
        if (downKeyHold.isActionCompleted) {
            return;
        }
        if (editMode.isLoading || editMode.isLoadingComplete ||
            editMode.isOpen || pouch.isOpen) {
                return;
        }
        if (settings.uiDynamicVisibility && !pouch.isOpen)
            startTimer(equipmentVisible);
        // Quick item use.
        if (settings.useQuickItemByHoldingDown) {
            quickItemCycle.use();
        }
        // Quick item index reset.
        else {
            if (!quickItemCycle.resetIndex())
                return;
            widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()),
                Game.getFormEx(quickItemCycle.getItemIdOffset(1)),
                Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
            widget.flashRedAnim();
        }
        downKeyHold.isActionCompleted = true;
    }
}

export function activateKeyEvent(isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (isDown) {
        if (Game.getCurrentCrosshairRef() || !menuClosed || pouch.isOpen)
            return;
        startTimer(leftHandNameVisible);
        // Confirms that the right hand name can be displayed
        if (solveForm(consts.RIGHTHAND_RECENT))
            startTimer(rightHandNameVisible);
        // Confirms that the ammo name can be displayed
        if (playerHoldingBow)
            startTimer(ammoNameVisible);
        if (!settings.uiDynamicVisibility)
            return;
        startTimer(equipmentVisible);
        startTimer(goldVisible);
        return;
    }
    if (isUp) {
        if (!pouch.isOpen)
            return;
        pouch.isOpen = false;
        widget.changeOpacity("pouch", 0.2, 0, 0);
        widget.changeOpacity("equipment", 0.1, 0, 1);
        if (settings.uiDynamicVisibility)
            startTimer(equipmentVisible);
        return;
    }
    if (isHeld) {
        if (heldDuration < settings.pouchAccessHoldTime - 0.1 ||
            heldDuration > settings.pouchAccessHoldTime + 0.1 ||
            editMode.isOpen || Game.getCurrentCrosshairRef())
            return;
        widget.changeOpacity("equipment", 0.2, 0, 0);
        widget.changeOpacity("pouch", 0.1, 0, 1);
        pouch.isOpen = true;
    }
}

export function openEditMode() {
    Debug.notification(`Opened Edit Mode.`);
    if (settings.uiDynamicVisibility)
        widget.changeOpacity("equipment", 0, 0, 1);
    widget.changeSource("left-hand-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("right-hand-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("voice-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("ammo-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("quick-item-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("quick-item-offset-1-frame", consts.FRAME_EDIT_MODE_IMAGE);
    widget.changeSource("quick-item-offset-2-frame", consts.FRAME_EDIT_MODE_IMAGE);
    editMode.isLoading = false;
    editMode.isLoadingComplete = true;
}

export function closeEditMode() {
    Debug.notification(`Closed Edit Mode.`);
    // Updates JContainers
    utils.writeObjArrToJCon(voiceCycle.arr, consts.VOICE_ARRAY);
    utils.writeObjArrToJCon(quickItemCycle.arr, consts.QUICKITEM_ARRAY);
    utils.writeObjArrToJCon(leftHandCycle.arr, consts.LEFTHAND_ARRAY);
    utils.writeObjArrToJCon(ammoCycle.arr, consts.AMMO_ARRAY);
    utils.writeObjArrToJCon(rightHandCycle.arr, consts.RIGHTHAND_ARRAY);
    // Closes the menu and returns to normal
    widget.changeSource("left-hand-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("right-hand-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("voice-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("ammo-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-offset-1-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-offset-2-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    editMode.isOpen = false;
    if (settings.uiDynamicVisibility)
        startTimer(equipmentVisible);
}

// Includes edit mode key by if the separateEditKey setting is set to false.
// Makes it easier for gamepad users to not switch back and forth between
// either gamepad or keyboard and mouse.
export function itemUseKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.itemUseKey.device)
        return;
    if (settings.useQuickItemByHoldingDown || !menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (isDown) {
        if (editMode.isLoading || editMode.isLoadingComplete || editMode.isOpen)
            return;
        if (!settings.uiDynamicVisibility)
            return;
        startTimer(equipmentVisible);
        return;
    }
    if (isUp) {
        // Quick item use
        if (!editMode.isLoading && !editMode.isLoadingComplete && !editMode.isOpen) {
            if (settings.uiDynamicVisibility && !pouch.isOpen)
                startTimer(equipmentVisible);
            quickItemCycle.use();
            return;
        }
        if (pouch.isOpen)
            return;
        // Cancel edit mode load
        if (editMode.isLoading && !editMode.isOpen) {
            editMode.isLoading = false;
            if (settings.uiDynamicVisibility)
                startTimer(equipmentVisible);
            return;
        }
        // Initial key release after loading edit mode
        if (!editMode.isOpen && editMode.isLoadingComplete) {
            editMode.isLoadingComplete = false;
            editMode.isOpen = true;
            return;
        }
        if (editMode.isOpen && !editMode.isLoadingComplete) {
            closeEditMode();
            return;
        }
        return;
    }
    if (isHeld) {
        // Load edit mode
        if (settings.separateEditKey || heldDuration < settings.editModeHoldTime || pouch.isOpen || editMode.isOpen)
            return;
        openEditMode();
        return;
    }
}

// Note: using a bunch of the same code from the itemUseEvent() function
// only to enter and exit edit mode.
// Can only be used if the separateEditKey is set to true.
export function editModeKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.editModeKey.device)
        return;
    if (!menuClosed || Ui.isMenuOpen("LootMenu"))
        return;
    if (isDown) {
        if (editMode.isLoading || editMode.isLoadingComplete || editMode.isOpen)
            return;
        if (!settings.uiDynamicVisibility)
            return;
        startTimer(equipmentVisible);
        return;
    }
    if (isUp) {
        if (pouch.isOpen)
            return;
        // Cancel edit mode load
        if (editMode.isLoading && !editMode.isOpen) {
            editMode.isLoading = false;
            if (settings.uiDynamicVisibility)
                startTimer(equipmentVisible);
            return;
        }
        // Initial key release after loading edit mode
        if (!editMode.isOpen && editMode.isLoadingComplete) {
            editMode.isLoadingComplete = false;
            editMode.isOpen = true;
            return;
        }
        if (editMode.isOpen && !editMode.isLoadingComplete) {
            closeEditMode();
            return;
        }
        return;
    }
    if (isHeld) {
        // Load edit mode
        if (!settings.separateEditKey || heldDuration < settings.editModeHoldTime || pouch.isOpen || editMode.isOpen)
            return;
        openEditMode();
        return;
    }
}
