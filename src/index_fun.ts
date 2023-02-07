import { Actor, Ammo, Armor, browser, Debug, Form, FormType, Game, Input, InputDeviceType, Potion, printConsole, SlotMask, Ui, Utility } from "@skyrim-platform/skyrim-platform";
import { solveForm, solveFormSetter } from "@skyrim-platform/jcontainers/JDB";
import { Cycle, EquipmentCycle, QuickItemCycle } from "./cycles";
import { Pouch } from "./pouch";
import * as widget from "./widget";
import * as utils from "./utilities";
import * as consts from "./constants";
import * as settings from "./settings";

// --------------
// Initialization
// --------------

export let isLoaded = false;
// Player statuses
export let playerDead = false;
export let playerInCombat = false;
export let playerHolding2H = false;
export let playerHoldingBow = false;
export let playerHoldingCrossbow = false;
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
export let arrowCycle = new EquipmentCycle(3);
export let boltCycle = new EquipmentCycle(3);
export let quickItemCycle = new QuickItemCycle();
// Pouches
export let leftPouch = new Pouch(0);
export let upPouch = new Pouch(1);
export let rightPouch = new Pouch(2);
export let downPouch = new Pouch(3);
export let isPouchAssignButtonHeld = false; // distinguishes between button hold and presses while assigning in favorites menu

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
    playerHoldingCrossbow = utils.isCrossbow(rightHand);
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
    leftHandCycle.name = settings.leftHandCycle;
    initCycle(rightHandCycle, utils.readObjArrFromJCon(consts.RIGHTHAND_ARRAY));
    rightHandCycle.name = settings.rightHandCycle;
    initCycle(voiceCycle, utils.readObjArrFromJCon(consts.VOICE_ARRAY));
    voiceCycle.name = settings.voiceCycle;
    initCycle(arrowCycle, utils.readObjArrFromJCon(consts.ARROW_ARRAY));
    arrowCycle.name = settings.arrowCycle;
    initCycle(boltCycle, utils.readObjArrFromJCon(consts.BOLT_ARRAY));
    boltCycle.name = settings.boltCycle;
    initCycle(quickItemCycle, utils.readObjArrFromJCon(consts.QUICKITEM_ARRAY));
    quickItemCycle.name = settings.quickItemCycle;
    let quickItem = Game.getFormEx(quickItemCycle.getItemIdOffset(0));
    if (quickItem) {
        quickItemCycle.count = player?.getItemCount(quickItem) ?? 0;
    }
    let quickItemOffsetOne = Game.getFormEx(quickItemCycle.getItemIdOffset(1));
    if (quickItemOffsetOne) {
        quickItemCycle.offsetOneCount = player?.getItemCount(quickItemOffsetOne) ?? 0;
    }
    let quickItemOffsetTwo = Game.getFormEx(quickItemCycle.getItemIdOffset(2));
    if (quickItemOffsetTwo) {
        quickItemCycle.offsetTwoCount = player?.getItemCount(quickItemOffsetTwo) ?? 0;
    }
}

// Resets all current cycle objects' arrays
export function resetCyclesFunc() {
    leftHandCycle.arr = [];
    rightHandCycle.arr = [];
    voiceCycle.arr = [];
    arrowCycle.arr = [];
    boltCycle.arr = [];
    quickItemCycle.arr = [];
}

export function initBrowser() {
    browser.loadUrl(consts.UI_PATH);
    browser.setFocused(false);
}

export function initWidgets() {
    browser.setVisible(!settings.hideWidgets);
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
    widget.updatePouchWidget(Game.getHotkeyBoundObject(0 + settings.pouchOffset) ?? null, 0);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(1 + settings.pouchOffset) ?? null, 1);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(2 + settings.pouchOffset) ?? null, 2);
    widget.updatePouchWidget(Game.getHotkeyBoundObject(3 + settings.pouchOffset) ?? null, 3);
    // Gold
    widget.updateGoldCount(playerGold);
    widget.changeVisibility("player-gold", !settings.hideGoldWidget);
    // UI visibility
    if (menuClosed)
        widget.changeOpacity("ui", 0, 0, 1);
    // Hand name visibility
    widget.changeVisibility("left-hand-name", !settings.hideHandNames);
    widget.changeVisibility("right-hand-name", !settings.hideHandNames);
    widget.changeVisibility("ammo-name", !settings.hideAmmoName);
    // Dynamic UI visibility
    if (settings.widgetDynamicVisibility && settings.widgetDVOnCombat && !player?.isInCombat()) {
        setWidgetVisibility(false, 0);
    } else {
        setWidgetVisibility(true, 0);
    }
}

export function printCyclesConsole() {
    leftHandCycle.printCycleNames();
    rightHandCycle.printCycleNames();
    voiceCycle.printCycleNames();
    arrowCycle.printCycleNames();
    boltCycle.printCycleNames();
    quickItemCycle.printCycleNames();
}

// For once-update event
export function initialize() {
    initBrowser();
    settings.updateStrings();
}

// For on-load event
export async function initializeOnLoad() {
    await Utility.wait(1);
    initVariables();
    initCycles();
    updateActivateKey();
    settings.updateSettings();
    if (settings.initMessage) {
        printConsole(settings.initializationText);
    }
    isLoaded = true;
}

// --------------------
// After initialization
// --------------------

// Control/menu states

// Prevents the same action from being run again when held
export let upKeyHold = { isActionCompleted: false };
export let downKeyHold = { isActionCompleted: false };
export let leftKeyHold = { isActionCompleted: false };
export let rightKeyHold = { isActionCompleted: false };
// Pouch
export let pouch = { isOpen: false };
// Cycle editor
export let cycleEditor = { isLoading: false, isLoadingComplete: false, isOpen: false };

// Timers (duration in milliseconds)
export let currentTime = 0;
export let updateInterval = { startTime: -1, duration: 300 };                               // Minimizes the number of functions run in the on("update") event
export let equipmentVisible = { isEnabled: false, startTime: -1, duration: 5000 };          // Shows/hides equipment widget
export let leftHandNameVisible = { isEnabled: false, startTime: -1, duration: 1500 };       // Shows/hides left hand name
export let rightHandNameVisible = { isEnabled: false, startTime: -1, duration: 1500 };      // Shows/hides right hand name
export let ammoNameVisible = { isEnabled: false, startTime: -1, duration: 1500 };           // Shows/hides ammo name
export let goldVisible = { isEnabled: false, startTime: -1, duration: 5000 };               // Shows/hides gold widget
export let cycleEditorRemoveTimer = { isEnabled: false, startTime: -1, duration: 1000 };    // Prevents add/remove equip conflicts in cycle editor
export let exitMenuTimer = { isEnabled: false, startTime: -1, duration: 100 };              // Prevents controls for sometime after exiting a menu

export function updateTime() {
    currentTime = Date.now();
}

// Intends to reduce the number of executions in the on-update event
export function onUpdateInterval() {
    if ((currentTime - updateInterval.startTime) > updateInterval.duration) {
        updateInterval.startTime = currentTime;
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

export function updateAmmoCount(player: Actor) {
    if (!playerHoldingBow && !playerHoldingCrossbow) {
        return;
    }
    let ammo = (solveForm(consts.AMMO_RECENT) ?? null) as Ammo;
    if (!ammo) {
        return;
    }
    let currentAmmoCount = player?.getItemCount(ammo) ?? 0;
    widget.changeTextContent("ammo-count", currentAmmoCount.toString());
    if (settings.widgetDynamicVisibility) {
        startTimer(equipmentVisible);
    }
}

// indexOffset: 0 (current), 1 (first next), 2 (second next)
export function updateQuickItemCount(currentCount: number, quickItemCount: number, indexOffset: number) {
    if (currentCount === quickItemCount) {
        return;
    }
    let elementPrefix = "";
    if (indexOffset === 0) {
        elementPrefix = "quick-item";
        quickItemCycle.count = currentCount;
        // Shows equipment widget, given only the main quick item is changed
        if (settings.widgetDynamicVisibility && !pouch.isOpen) {
            startTimer(equipmentVisible);
        }
    } else if (indexOffset === 1) {
        elementPrefix = "quick-item-offset-1";
        quickItemCycle.offsetOneCount = currentCount;
    } else if (indexOffset === 2) {
        elementPrefix = "quick-item-offset-2";
        quickItemCycle.offsetTwoCount = currentCount;
    }
    let quickItemID = quickItemCycle.getItemIdOffset(indexOffset);
    widget.updateItemCount(`${elementPrefix}-count`, `${elementPrefix}-icon`, Game.getFormEx(quickItemID));
}

export function updateQuickItemCounts(player: Actor) {
    // Runs the optimal potion widget updater function by default, but depending on its return value,
    // the item count will update based on the specific Form in the quick item cycle.
    let isOptimalPotion = widget.updateOptimalPotionQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()));
    if (!isOptimalPotion) {
        let item = Game.getFormEx(quickItemCycle.getItemId());
        let itemCount = 0;
        if (item) {
            itemCount = player?.getItemCount(item) ?? 0;
        }
        if (itemCount !== quickItemCycle.count) {
            updateQuickItemCount(itemCount, quickItemCycle.count, 0);
        }
    }
    let itemOffsetOne = Game.getFormEx(quickItemCycle.getItemIdOffset(1));
    if (itemOffsetOne) {
        let offsetOneCount = player?.getItemCount(itemOffsetOne) ?? 0;
        if (offsetOneCount !== quickItemCycle.offsetOneCount) {
            updateQuickItemCount(offsetOneCount, quickItemCycle.offsetOneCount, 1);
        }
    }
    let itemOffsetTwo = Game.getFormEx(quickItemCycle.getItemIdOffset(2));
    if (itemOffsetTwo) {
        let offsetTwoCount = player?.getItemCount(itemOffsetTwo) ?? 0;
        if (offsetTwoCount !== quickItemCycle.offsetTwoCount) {
            updateQuickItemCount(offsetTwoCount, quickItemCycle.offsetTwoCount, 2);
        }
    }
}

function updatePouchObject(pouch: Pouch) {
    // Checks for changes in the hotkey assignment
    let hotkeyObject = Game.getHotkeyBoundObject(pouch.slot + settings.pouchOffset);
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
    let pouchItem = Game.getFormEx(pouch.itemID);
    let currentPouchCount = 0;
    if (pouchItem) {
        currentPouchCount = player?.getItemCount(pouchItem) ?? 0;
    }
    if (pouch.count !== currentPouchCount) {
        pouch.count = currentPouchCount;
        let pouchItem = Game.getFormEx(pouch.itemID);
        widget.updatePouchWidget(pouchItem, pouch.slot);
    }
}

export function updatePouchCounts(player: Actor) {
    updatePouchCount(player, upPouch);
    updatePouchCount(player, rightPouch);
    updatePouchCount(player, leftPouch);
    updatePouchCount(player, downPouch);
}

export function updateGoldCount(player: Actor) {
    let currentCount = player?.getGoldAmount() ?? 0;
    if (currentCount === playerGold) {
        return;
    }
    widget.goldCountAnimation(currentCount - playerGold);
    playerGold = currentCount;
    if (settings.widgetDynamicVisibility) {
        startTimer(goldVisible);
    }
}

export function updateLHNameVisibility() {
    if (!leftHandNameVisible.isEnabled || settings.hideHandNames) {
        return;
    }
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
    if (!rightHandNameVisible.isEnabled || settings.hideHandNames) {
        return;
    }
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
    if (!ammoNameVisible.isEnabled) {
        return;
    }
    if (ammoNameVisible.startTime === -1) {
        if (settings.hideAmmoName) {
            return;
        }
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
    // Conditions where the equipment widget should not fade in/out
    if (!equipmentVisible.isEnabled || (settings.widgetDVOnCombat && playerInCombat)) {
        return;
    }
    if (equipmentVisible.startTime === -1) {
        widget.changeOpacity("equipment", 0.2, 0, 1);
        equipmentVisible.isEnabled = true;
        equipmentVisible.startTime = currentTime;
        return;
    }
    // Cases that prevent the equipment widget from fading out
    if (cycleEditor.isLoading || cycleEditor.isLoadingComplete || cycleEditor.isOpen) {
        return;
    }
    if ((currentTime - equipmentVisible.startTime) > equipmentVisible.duration) {
        widget.changeOpacity("equipment", 0.2, 0, 0);
        equipmentVisible.isEnabled = false;
        return;
    }
}
export function updateGoldUIVisibility() {
    // Conditions where the gold widget should not fade in/out
    if (!goldVisible.isEnabled || (settings.widgetDVOnCombat && playerInCombat)) {
        return;
    }
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
function setWidgetVisibility(isVisible: boolean, delay: number) {
    if (pouch.isOpen) {
        return;
    }
    if (isVisible) {
        widget.changeOpacity("equipment", 0.2, delay, 1);
        widget.changeOpacity("player-gold", 0.2, delay, 1);
        equipmentVisible.isEnabled = true;
        goldVisible.isEnabled = true;
    }
    if (!isVisible) {
        widget.changeOpacity("equipment", 0.2, delay, 0);
        widget.changeOpacity("player-gold", 0.2, delay, 0);
        equipmentVisible.isEnabled = false;
        goldVisible.isEnabled = false;
    }
}
// Dynamic visibility events, particularly for the "show on combat" event
// A merged function to prevent conflicting logic with both events
export function dynamicVisibilityEvents(player: Actor | null) {
    let currPlayerInCombat = player?.isInCombat() ?? false;
    // "Show on combat" is enabled.
    if (settings.widgetDVOnCombat) {
        if (currPlayerInCombat && !playerInCombat) { // combat start
            setWidgetVisibility(true, 0);
        }
        if (!currPlayerInCombat && playerInCombat) { // combat end
            setWidgetVisibility(false, 5);
        }
    }
    playerInCombat = currPlayerInCombat;
}

export let voice = { prevTime: 0, isRecovering: false };

export function updateShoutCooldown(player: Actor | null) {
    let currentShoutTime = player?.getVoiceRecoveryTime() ?? 0;
    if (voice.prevTime === 0 && currentShoutTime > 0) {
        voice.isRecovering = true;
        // currentShoutTime is floored since the animation parameter
        // seems to not accept float values
        widget.shoutFlashAnim(Math.floor(currentShoutTime));
        if (settings.widgetDynamicVisibility) {
            startTimer(equipmentVisible);
        }
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
    if (!settings.widgetDynamicVisibility) {
        return;
    }
    updateEquipmentUIVisibility();
    updateGoldUIVisibility();
}

export function updateCycleEditorRemoveTimer() {
    if (!cycleEditorRemoveTimer.isEnabled) {
        return;
    }
    if (cycleEditorRemoveTimer.startTime === -1) {
        cycleEditorRemoveTimer.startTime = currentTime;
    }
    if ((currentTime - cycleEditorRemoveTimer.startTime) > cycleEditorRemoveTimer.duration) { // 1 second
        cycleEditorRemoveTimer.isEnabled = false;
    }
}

export function updateExitMenuTimer() {
    if (!exitMenuTimer.isEnabled) {
        return;
    }
    if (exitMenuTimer.startTime === -1) {
        exitMenuTimer.startTime = currentTime;
    }
    if ((currentTime - exitMenuTimer.startTime) > exitMenuTimer.duration) { // 0.1 seconds
        exitMenuTimer.isEnabled = false;
    }
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
    if (cycleEditor.isOpen) {
        // Unequips the automatically equipped pre-2H item. This occurs when the 2H weapon is unequipped
        // This allows two-handed items to be removed in cycle editor
        if (currentRH === solveForm(consts.RIGHTHAND_ONEHANDED)) {
            utils.unequip(currentRH, 1);
            return;
        }
        if (!cycleEditorRemoveTimer.isEnabled) {
            rightHandCycle.add(currentRH.getFormID());
        }
    }
    // Updates variables and cycle
    // Stores last equipped one-handed item
    let tempPlayerHolding2H = utils.isItem2H(currentRH);
    if (tempPlayerHolding2H) {
        playerHolding2H = true;
        playerHoldingBow = utils.isBow(currentRH);
        playerHoldingCrossbow = utils.isCrossbow(currentRH);
        if (playerHoldingBow || playerHoldingCrossbow) {
            widget.updateAmmoWidget();
        }
    }
    if (!tempPlayerHolding2H) {
        solveFormSetter(consts.RIGHTHAND_ONEHANDED, currentRH, true);
        playerHolding2H = false;
        playerHoldingBow = false;
        playerHoldingCrossbow = false;
    }
    // Unequip ammo if right hand is not a bow/crossbow
    if ((!playerHoldingBow && !playerHoldingCrossbow) && settings.unequipAmmo) {
        let ammo = solveForm(consts.AMMO_RECENT) ?? null;
        utils.unequip(ammo);
    }
    solveFormSetter(consts.RIGHTHAND_RECENT, currentRH, true);
    rightHandCycle.autoIndex();
    // Updates widget
    widget.updateEquippedItemWidget(1, currentRH);
    startTimer(rightHandNameVisible);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
    // Updates visibility. Requires bow/crossbow equipped
    if (playerHoldingBow || playerHoldingCrossbow) {
        if (!settings.hideAmmoName) {
            widget.changeOpacity("ammo", 0, 0, 0.5); // always sets to half opacity
        }
        widget.setAmmoWidgetVisibility(true);
        startTimer(ammoNameVisible);
        return;
    }
    widget.setAmmoWidgetVisibility(false);
    ammoNameVisible.startTime =  Date.now() - (ammoNameVisible.duration); // overrides timer
}

export function leftHandEquipEvent(currentLH: Form) {
    if (playerHolding2H) {
        return;
    }
    // Updates variables and cycle
    solveFormSetter(consts.LEFTHAND_RECENT, currentLH, true);
    if (cycleEditor.isOpen && !cycleEditorRemoveTimer.isEnabled) {
        leftHandCycle.add(currentLH.getFormID());
    }
    leftHandCycle.autoIndex();
    // Updates left hand widget
    widget.updateEquippedItemWidget(0, currentLH);
    startTimer(leftHandNameVisible);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

export function voiceEquipEvent(currentVoice: Form) {
    // Updates variables and cycle
    solveFormSetter(consts.VOICE_RECENT, currentVoice, true);
    if (cycleEditor.isOpen && !cycleEditorRemoveTimer.isEnabled) {
        voiceCycle.add(currentVoice.getFormID());
    }
    voiceCycle.autoIndex();
    // Updates voice widget
    widget.updateEquippedItemWidget(2, currentVoice);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

export function ammoEquipEvent(equipped: Form) {
    let ammo = Ammo.from(equipped) as Ammo;
    if (!settings.hideAmmoName) {
        widget.changeOpacity("ammo", 0, 0, 0.5); // always sets to half opacity
    }
    // Updates variables and cycle
    solveFormSetter(consts.AMMO_RECENT, equipped, true);
    if (cycleEditor.isOpen && !cycleEditorRemoveTimer.isEnabled) {
        if (ammo.isBolt()) {
            boltCycle.add(equipped.getFormID());
        } else {
            arrowCycle.add(equipped.getFormID());
        }
    }
    if (ammo.isBolt()) {
        boltCycle.autoIndex();
    } else {
        arrowCycle.autoIndex();
    }
    // Updates ammo widget
    widget.updateAmmoWidget();
    // Updates visibility. Requires bow equipped
    if (playerHoldingBow || playerHoldingCrossbow) {
        startTimer(ammoNameVisible);
        if (settings.widgetDynamicVisibility && !pouch.isOpen) {
            startTimer(equipmentVisible);
        }
    }
}

export function equipQuickItemEvent(equipped: Form) {
    if (!cycleEditor.isOpen) {
        return;
    }
    // Updates cycle
    let equippedType = equipped.getType();
    // Prevents shields from being added
    if (equippedType === FormType.Armor && Armor.from(equipped)?.getSlotMask() === SlotMask.Shield)
        return;
    quickItemCycle.add(equipped.getFormID());
    if (settings.cycleEditorAddPotion) {
        let player = Game.getPlayer();
        if (equippedType === FormType.Potion && !player?.isInCombat()) {
            player?.addItem(equipped, 1, false);
        }
    }
    // Updates quick item widget
    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
}

// A container change event for adding poisons to the quick item
export function quickItemAddPoisonEvent(baseObj: Form) {
    if (!cycleEditor.isOpen) {
        return;
    }
    if (baseObj.getType() !== FormType.Potion) {
        return;
    }
    if (!Potion.from(baseObj)?.isPoison()) {
        return;
    }
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
    // Unequip ammo if right hand is unequipped
    if (settings.unequipAmmo) {
        let ammo = solveForm(consts.AMMO_RECENT) ?? null;
        utils.unequip(ammo);
    }
    // Forces next quick items to be opaque when unequipped.
    if (rightHandNameVisible.isEnabled) {
        rightHandNameVisible.startTime = currentTime - (rightHandNameVisible.duration - 100);
    }
    playerHoldingBow = false;
    playerHoldingCrossbow = false;
    // Index remains stationary in the cycle editor
    if (!cycleEditor.isOpen) {
        rightHandCycle.index = rightHandCycle.arr.length;
    }
    widget.updateEquippedItemWidget(1, null);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

export function leftHandUnequipEvent() {
    solveFormSetter(consts.LEFTHAND_RECENT, null, true);
    // Index remains stationary in cycle editor
    if (!cycleEditor.isOpen) {
        leftHandCycle.index = leftHandCycle.arr.length;
    }
    widget.updateEquippedItemWidget(0, null);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

export function voiceUnequipEvent() {
    solveFormSetter(consts.VOICE_RECENT, null, true);
    // Index remains stationary in cycle editor
    if (!cycleEditor.isOpen) {
        voiceCycle.index = voiceCycle.arr.length;
    }
    widget.updateEquippedItemWidget(2, null);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

export function ammoUnequipEvent() {
    solveFormSetter(consts.AMMO_RECENT, null, true);
    // Index remains stationary in cycle editor
    if (!cycleEditor.isOpen) {
        arrowCycle.index = arrowCycle.arr.length;
        boltCycle.index = boltCycle.arr.length;
    }
    // Updates ammo widget.
    widget.updateAmmoWidget();
    // Updates visibility. Requires bow equipped
    if (!playerHoldingBow || !playerHoldingCrossbow) {
        return;
    }
    // Overrides timer to finish sooner
    ammoNameVisible.startTime = currentTime - (ammoNameVisible.duration - 100);
    if (settings.widgetDynamicVisibility && !pouch.isOpen) {
        startTimer(equipmentVisible);
    }
}

// -------------
// Button events
// -------------

function dualCast(hand: number): boolean {
    let player = Game.getPlayer();
    let handItem = player?.getEquippedObject(hand);
    if (handItem?.getType() !== FormType.Spell) {
        return false;
    }
    let otherHand = 0;
    if (hand === 0) {
        otherHand = 1;
    }
    let otherHandItem = player?.getEquippedObject(otherHand);
    if (handItem === otherHandItem) {
        return false;
    }
    utils.equip(handItem, otherHand);
    return true;
}

export function leftKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.leftKey.device || cycleEditor.isLoading || cycleEditor.isLoadingComplete) {
        return;
    }
    // Pouch item assignment for gamepad
    if (Ui.isMenuOpen("FavoritesMenu") && device === InputDeviceType.Gamepad) {
        if (isUp) {
            if (isPouchAssignButtonHeld) {
                isPouchAssignButtonHeld = false;
                return;
            }
            Input.tapKey(2+settings.pouchOffset); // 1 on keyboard + offset
        }
        if (isHeld && heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
            if (isPouchAssignButtonHeld) {
                return;
            }
            Input.tapKey(3+settings.pouchOffset); // 2 on keyboard + offset
            isPouchAssignButtonHeld = true;
        }
        return;
    }
    if (!menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    // -----------------
    // Left button press
    // -----------------
    if (isDown) {
        if (cycleEditor.isOpen) {
            if (playerHoldingBow) {
                arrowCycle.remove();
                startTimer(cycleEditorRemoveTimer);
                return;
            }
            if (playerHoldingCrossbow) {
                boltCycle.remove();
                startTimer(cycleEditorRemoveTimer);
                return;
            }
            if (playerHolding2H) {
                return;
            }
            leftHandCycle.remove();
            startTimer(cycleEditorRemoveTimer);
            return;
        }
        if (pouch.isOpen) {
            leftPouch.use();
            return;
        }
        if (playerHoldingBow) {
            arrowCycle.advance();
            return;
        }
        if (playerHoldingCrossbow) {
            boltCycle.advance();
            return;
        }
        widget.flashAnim(2);
        // LH cycling with LH dual casting disabled
        if (!settings.leftHandHoldDualCast) {
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
            if (playerHolding2H) {
                startTimer(leftHandNameVisible);
                return;
            }
            leftHandCycle.advance();
            return;
        }
    }
    if (cycleEditor.isOpen || pouch.isOpen) { // States that would not require isUp or isHeld
        return;
    }
    // -------------------
    // Left button release
    // -------------------
    if (isUp) {
        if (leftKeyHold.isActionCompleted) { // After finishing holding
            leftKeyHold.isActionCompleted = false;
            return;
        }
        // LH cycling with LH dual casting enabled
        if (settings.leftHandHoldDualCast && (!playerHoldingBow || !playerHoldingCrossbow)) {
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
            if (playerHolding2H) {
                startTimer(leftHandNameVisible);
                return;
            }
            leftHandCycle.advance();
            return;
        }
    }
    // ----------------
    // Left button hold
    // ----------------
    if (isHeld) {
        if (leftKeyHold.isActionCompleted) { // Holding in-progress
            return;
        }
        // Dual cast hold time.
        if (settings.leftHandHoldDualCast && heldDuration >= settings.dualCastHoldTime - 0.1 && heldDuration <= settings.dualCastHoldTime + 0.1) {
            // Hold dual cast. Returns true if a successful dual cast is completed
            if (dualCast(0)) {
                leftKeyHold.isActionCompleted = true;
                return;
            }
        }
        // Reset cycle hold time.
        if (heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
            if (playerHoldingBow && settings.ammoCycleHoldReset) { // Resets ammo cycle, if holding a bow
                arrowCycle.resetIndex();
            }
            if (playerHoldingCrossbow && settings.ammoCycleHoldReset) {
                boltCycle.resetIndex();
            }
            if (!playerHolding2H && settings.leftHandCycleHoldReset) { // Resets left hand cycle
                if (leftHandCycle.resetIndex()) {
                    widget.flashRedAnim(2);
                }
            }
            leftKeyHold.isActionCompleted = true;
            return;
        }
    }
}

export function rightKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.rightKey.device || cycleEditor.isLoading || cycleEditor.isLoadingComplete) {
        return;
    }
    // Pouch item assignment for gamepad
    if (Ui.isMenuOpen("FavoritesMenu") && device === InputDeviceType.Gamepad) {
        if (isUp) {
            if (isPouchAssignButtonHeld) {
                isPouchAssignButtonHeld = false;
                return;
            }
            Input.tapKey(4+settings.pouchOffset); // 1 on keyboard + offset
        }
        if (isHeld && heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
            if (isPouchAssignButtonHeld) {
                return;
            }
            Input.tapKey(5+settings.pouchOffset); // 2 on keyboard + offset
            isPouchAssignButtonHeld = true;
        }
        return;
    }
    if (!menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    // ------------------
    // Right button press
    // ------------------
    if (isDown) {
        if (cycleEditor.isOpen) {
            rightHandCycle.remove();
            startTimer(cycleEditorRemoveTimer);
            return;
        }
        if (pouch.isOpen) {
            rightPouch.use();
            return;
        }
        widget.flashAnim(3);
        // LH cycling with LH dual casting disabled
        if (!settings.rightHandHoldDualCast) {
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
            rightHandCycle.advance();
            return;
        }
    }
    if (cycleEditor.isOpen || pouch.isOpen) { // States that would not require isUp or isHeld
        return;
    }
    // --------------------
    // Right button release
    // --------------------
    if (isUp) {
        if (rightKeyHold.isActionCompleted) { // After finishing holding
            rightKeyHold.isActionCompleted = false;
            return;
        }
        // RH cycling with RH dual casting enabled
        if (settings.rightHandHoldDualCast) {
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
            rightHandCycle.advance();
            return;
        }
    }
    // ------------------
    // Right button hold.
    // ------------------
    if (isHeld) {
        if (rightKeyHold.isActionCompleted) { // Holding in-progress
            return;
        }
        // Dual cast hold time.
        if (settings.rightHandHoldDualCast && heldDuration >= settings.dualCastHoldTime - 0.1 && heldDuration <= settings.dualCastHoldTime + 0.1) {
            // Hold dual cast. Returns true if a successful dual cast is completed
            if (dualCast(1)) {
                rightKeyHold.isActionCompleted = true;
                return;
            }
        }
        // Reset cycle hold time.
        if (settings.rightHandCycleHoldReset && heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
            if (rightHandCycle.resetIndex()) {
                widget.flashRedAnim(3);
            }
            rightKeyHold.isActionCompleted = true;
            return;
        }
    }
}

export function upKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.upKey.device || cycleEditor.isLoading || cycleEditor.isLoadingComplete || !menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    // ---------------
    // Up button press
    // ---------------
    if (isDown) {
        if (cycleEditor.isOpen) {
            voiceCycle.remove();
            startTimer(cycleEditorRemoveTimer);
            return;
        }
        if (pouch.isOpen) {
            upPouch.use();
            return;
        }
        widget.flashAnim(0);
        if (settings.widgetDynamicVisibility) {
            let prevVisible = equipmentVisible.isEnabled;
            startTimer(equipmentVisible);
            if (!prevVisible) {
                return;
            }
        }
        voiceCycle.advance();
        return;
    }
    // States that would not require isUp or isHeld
    if (cycleEditor.isOpen || pouch.isOpen) {
        return;
    }
    // -----------------
    // Up button release
    // -----------------
    if (isUp) {
        if (upKeyHold.isActionCompleted) { // After finishing holding
            upKeyHold.isActionCompleted = false;
            return;
        }
    }
    // --------------
    // Up button hold
    // --------------
    if (isHeld) {
        if (!upKeyHold.isActionCompleted && settings.voiceCycleHoldReset) {
            // Reset cycle hold time
            if (heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
                if (voiceCycle.resetIndex()) {
                    widget.flashRedAnim(0);
                }
                upKeyHold.isActionCompleted = true;
                return;
            }
        }
    }
}

export function downKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.downKey.device || cycleEditor.isLoading || cycleEditor.isLoadingComplete || !menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    // -----------------
    // Down button press
    // -----------------
    if (isDown) {
        if (cycleEditor.isOpen) {
            quickItemCycle.remove();
            widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
            return;
        }
        if (pouch.isOpen) {
            downPouch.use();
            return;
        }
        widget.flashAnim(1);
        if (settings.quickItemUse === 0) { // Cycle quick item - quickItemUse = 0 (disabled)
            if (settings.widgetDynamicVisibility) {
                let prevVisible = equipmentVisible.isEnabled;
                startTimer(equipmentVisible);
                if (!prevVisible) {
                    return;
                }
            }
            quickItemCycle.advance();
            widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
        }
        return;
    }
    // States that would not require isUp or isHeld
    if (cycleEditor.isOpen || pouch.isOpen) {
        return;
    }
    // -------------------
    // Down button release
    // -------------------
    if (isUp) {
        // This allows an action when held to be played only once
        if (downKeyHold.isActionCompleted) {
            downKeyHold.isActionCompleted = false;
            return;
        }
        if (settings.quickItemUse === 1) { // Cycle quick item - quickItemUse = 1 (normal)
            if (settings.widgetDynamicVisibility) {
                let prevVisible = equipmentVisible.isEnabled;
                startTimer(equipmentVisible);
                if (!prevVisible) {
                    return;
                }
            }
            quickItemCycle.advance();
            widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
        }
        if (settings.quickItemUse === 2) { // Use quick item - quickItemUse = 2 (inverted)
            quickItemCycle.use();
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
        }
    }
    // ----------------
    // Down button hold
    // ----------------
    if (isHeld) {
        if (downKeyHold.isActionCompleted) {
            return;
        }
        if (heldDuration >= settings.cycleButtonHoldTime - 0.1 && heldDuration <= settings.cycleButtonHoldTime + 0.1) {
            if (settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
            if (settings.quickItemUse === 0) { // Quick item index reset - quickItemUse = 0 (disabled)
                if (quickItemCycle.resetIndex()) {
                    widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
                    widget.flashRedAnim(1);
                }
            }
            if (settings.quickItemUse === 1) { // Use quick item - quickItemUse = 1 (normal)
                quickItemCycle.use();
            }
            if (settings.quickItemUse === 2) { // Cycle quick item - quickItemUse = 2 (inverted)
                if (settings.widgetDynamicVisibility) {
                    let prevVisible = equipmentVisible.isEnabled;
                    startTimer(equipmentVisible);
                    if (!prevVisible) {
                        return;
                    }
                }
                quickItemCycle.advance();
                widget.updateQuickItemWidget(Game.getFormEx(quickItemCycle.getItemId()), Game.getFormEx(quickItemCycle.getItemIdOffset(1)), Game.getFormEx(quickItemCycle.getItemIdOffset(2)));
            }
            downKeyHold.isActionCompleted = true;
        }
    }
}

export function visibilityPouchEvent(isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    // -------------------------
    // Pouch access button press
    // -------------------------
    if (isDown) {
        if (!menuClosed || pouch.isOpen) {
            return;
        }
        if (Game.getCurrentCrosshairRef()) {
            if (settings.visibilityPouchButton.code == activateKeyKeyboard.code ||
                settings.visibilityPouchButton.code == activateKeyGamepad.code) {
                return;
            }
        }
        // Shows names of items on the equipment widget
        startTimer(leftHandNameVisible);
        if (solveForm(consts.RIGHTHAND_RECENT)) {
            startTimer(rightHandNameVisible);
        }
        if (playerHoldingBow || playerHoldingCrossbow) {
            startTimer(ammoNameVisible);
        }
        // Shows equipment and gold widgets if this setting is enabled
        if (!settings.widgetDVOnButtonPress) {
            return;
        }
        startTimer(equipmentVisible);
        startTimer(goldVisible);
        return;
    }
    // ---------------------------
    // Pouch access button release
    // ---------------------------
    if (isUp) {
        // Exits pouch.
        if (pouch.isOpen) {
            pouch.isOpen = false;
            widget.changeOpacity("pouch", 0.2, 0, 0);
            if (settings.widgetDynamicVisibility && !settings.widgetDVOnButtonPress) {
                // Does not show equipment depending on combat state and settings
                if ((settings.widgetDVOnCombat && !playerInCombat) || !settings.widgetDVOnCombat) {
                    return;
                }
            }
            widget.changeOpacity("equipment", 0.1, 0, 1);
            equipmentVisible.isEnabled = true;
            if (settings.widgetDVOnButtonPress && settings.widgetDynamicVisibility) {
                startTimer(equipmentVisible);
            }
        }
        return;
    }
    // ------------------------
    // Pouch access button hold
    // ------------------------
    if (isHeld) {
        if (Game.getCurrentCrosshairRef()) {
            if (settings.visibilityPouchButton.code == activateKeyKeyboard.code ||
                settings.visibilityPouchButton.code == activateKeyGamepad.code) {
                return;
            }
        }
        if (cycleEditor.isOpen) {
            return;
        }
        if (heldDuration >= settings.pouchAccessHoldTime - 0.1 && heldDuration <= settings.pouchAccessHoldTime + 0.1) {
            widget.changeOpacity("equipment", 0.2, 0, 0);
            equipmentVisible.isEnabled = false;
            widget.changeOpacity("pouch", 0.1, 0, 1);
            pouch.isOpen = true;
        }
    }
}

export function openCycleEditor() {
    if (settings.cycleEditorMessages) {
        Debug.notification(settings.cycleEditorOpened);
    }
    if (settings.widgetDynamicVisibility) {
        widget.changeOpacity("equipment", 0, 0, 1);
        equipmentVisible.isEnabled = true;
    }
    widget.changeSource("left-hand-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("right-hand-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("voice-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("ammo-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("quick-item-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("quick-item-offset-1-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    widget.changeSource("quick-item-offset-2-frame", consts.FRAME_CYCLE_EDITOR_IMAGE);
    cycleEditor.isLoading = false;
    cycleEditor.isLoadingComplete = true;
}

export function closeCycleEditor() {
    if (settings.cycleEditorMessages) {
        Debug.notification(settings.cycleEditorClosed);
    }
    // Updates JContainers
    utils.writeObjArrToJCon(voiceCycle.arr, consts.VOICE_ARRAY);
    utils.writeObjArrToJCon(quickItemCycle.arr, consts.QUICKITEM_ARRAY);
    utils.writeObjArrToJCon(leftHandCycle.arr, consts.LEFTHAND_ARRAY);
    utils.writeObjArrToJCon(arrowCycle.arr, consts.ARROW_ARRAY);
    utils.writeObjArrToJCon(boltCycle.arr, consts.BOLT_ARRAY);
    utils.writeObjArrToJCon(rightHandCycle.arr, consts.RIGHTHAND_ARRAY);
    // Closes the menu and returns to normal
    widget.changeSource("left-hand-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("right-hand-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("voice-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("ammo-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-offset-1-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    widget.changeSource("quick-item-offset-2-frame", consts.FRAME_EQUIPMENT_POUCH_IMAGE);
    cycleEditor.isOpen = false;
    if (settings.widgetDynamicVisibility)
        startTimer(equipmentVisible);
}

export function itemUseKeyEvent(device: number, isDown: boolean, isUp: boolean) {
    if (device !== settings.itemUseKey.device || settings.quickItemUse !== 0 || !menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    if (isDown) {
        if (cycleEditor.isLoading || cycleEditor.isLoadingComplete || cycleEditor.isOpen)
            return;
        if (!settings.widgetDynamicVisibility)
            return;
        startTimer(equipmentVisible);
        return;
    }
    if (isUp) {
        // Quick item use
        if (!cycleEditor.isLoading && !cycleEditor.isLoadingComplete && !cycleEditor.isOpen) {
            if (settings.widgetDynamicVisibility && !pouch.isOpen)
                startTimer(equipmentVisible);
            quickItemCycle.use();
            return;
        }
    }
}

export function cycleEditorKeyEvent(device: number, isDown: boolean, isUp: boolean, isHeld: boolean, heldDuration: number) {
    if (device !== settings.cycleEditorKey.device || !menuClosed || Ui.isMenuOpen("LootMenu")) {
        return;
    }
    if (isDown) {
        if (cycleEditor.isLoading || cycleEditor.isLoadingComplete || cycleEditor.isOpen)
            return;
        if (!settings.widgetDynamicVisibility)
            return;
        startTimer(equipmentVisible);
        return;
    }
    if (isUp) {
        if (pouch.isOpen)
            return;
        // Cancel cycle editor load
        if (cycleEditor.isLoading && !cycleEditor.isOpen) {
            cycleEditor.isLoading = false;
            if (settings.widgetDynamicVisibility)
                startTimer(equipmentVisible);
            return;
        }
        // Initial key release after loading cycle editor
        if (!cycleEditor.isOpen && cycleEditor.isLoadingComplete) {
            cycleEditor.isLoadingComplete = false;
            cycleEditor.isOpen = true;
            return;
        }
        if (cycleEditor.isOpen && !cycleEditor.isLoadingComplete) {
            closeCycleEditor();
            return;
        }
        return;
    }
    if (isHeld) {
        // Load cycle editor
        if (heldDuration < settings.cycleEditorHoldTime || pouch.isOpen || cycleEditor.isOpen) {
            return;
        }
        openCycleEditor();
        return;
    }
}
