import { Actor, Form, FormType, Game, on, once, Ui } from "@skyrim-platform/skyrim-platform";
import { solveForm } from "@skyrim-platform/jcontainers/JDB";
import * as fun from "./index_fun";
import * as consts from "./constants";
import * as settings from "./settings";

once("update", () => {
    fun.initialize();
});

on("loadGame", () => {
    fun.initializeOnLoad();
});

on("update", () => {
    if (!fun.isLoaded) {
        return;
    }
    fun.updateTime();
    fun.updateElementOpacities();
    fun.updateCycleEditorRemoveTimer();
    fun.updateExitMenuTimer();
    if (!fun.onUpdateInterval()) {
        return;
    }
    let player = Game.getPlayer();
    fun.updatePouchObjects();
    fun.updateShoutCooldown(player);
    fun.dynamicVisibilityEvents(player);
});

on("deathStart", (event) => {
    if (event.actorDying.getFormID() === consts.PLAYER_ID) {
        fun.setPlayerDead(true);
        fun.updateWidgetVisibility();
    }
});

on("menuClose", (event) => {
    fun.updateMenuClosed();
    fun.updateWidgetVisibility();
    // No particular event to detect changes to the MCM
    // And so, closing the Journal Menu will update the settings
    if (event.name === "Journal Menu") {
        settings.updateSettings();
    }
    fun.startTimer(fun.exitMenuTimer); // Starts exitMenuTimer
});

on("menuOpen", () => {
    fun.updateMenuClosed();
    fun.updateWidgetVisibility();
});

on("containerChanged", (event) => {
    // Intended to workaround a Skyrim Platform issue with the containerChanged event
    // Intended to fix an issue with leveling up triggering this event
    // Intended to fix an issue with QUI plugin explorer container being opened
    // These menus are are excluded since they typically have containerChanged events in them
    if (!fun.menuClosed && !Ui.isMenuOpen("InventoryMenu") && !Ui.isMenuOpen("Dialogue Menu") &&
    !Ui.isMenuOpen("Console") && !Ui.isMenuOpen("MessageBoxMenu")) {
        return;
    }
    let player = Game.getPlayer();
    if (!player) {
        return;
    }
    fun.updateAmmoCount(player);
    fun.updateQuickItemCounts(player);
    fun.updatePouchCounts(player);
    fun.updateGoldCount(player);
    if (event.baseObj) {
        fun.quickItemAddPoisonEvent(event.baseObj);
    }
});

on("equip", (event) => {
    if (!fun.isLoaded || event.actor.getFormID() !== consts.PLAYER_ID) {
        return;
    }
    let player = Actor.from(event.actor);
    let equipped = Form.from(event.baseObj);
    if (!equipped) {
        return;
    }
    // Right hand
    if (equipped !== solveForm(consts.RIGHTHAND_RECENT) && equipped === player?.getEquippedObject(1)) {
        fun.rightHandEquipEvent(equipped);
    }
    // Left hand
    else if (equipped !== solveForm(consts.LEFTHAND_RECENT) && equipped === player?.getEquippedObject(0)) {
        fun.leftHandEquipEvent(equipped);
    }
    // Voice
    else if (equipped !== solveForm(consts.VOICE_RECENT) && equipped === player?.getEquippedObject(2)) {
        fun.voiceEquipEvent(equipped);
    }
    // Ammo
    else if (equipped !== solveForm(consts.AMMO_RECENT) && equipped.getType() === FormType.Ammo) {
        fun.ammoEquipEvent(equipped);
    }
    // Quick item (for cycle adding)
    else {
        fun.equipQuickItemEvent(equipped);
    }
});


on("unequip", (event) => {
    // Intended to workaround a Skyrim Platform issue with the unequip event
    // being called a bunch of times when leveling up
    // Prevents stuttering when leveling up
    if (Ui.isMenuOpen("LevelUp Menu")) {
        return;
    }
    if (!fun.isLoaded || event.actor.getFormID() !== consts.PLAYER_ID) {
        return;
    }
    let unequipped = Form.from(event.baseObj);
    if (!unequipped) {
        return;
    }
    let player = Actor.from(event.actor);
    // Right hand
    if (solveForm(consts.RIGHTHAND_RECENT) && !player?.getEquippedObject(1)) {
        fun.rightHandUnequipEvent();
    }
    // Left hand
    else if (solveForm(consts.LEFTHAND_RECENT) && !player?.getEquippedObject(0)) {
        fun.leftHandUnequipEvent();
    }
    // Voice
    else if (solveForm(consts.VOICE_RECENT) && !player?.getEquippedObject(2)) {
        fun.voiceUnequipEvent();
    }
    // Ammo
    else if (unequipped === solveForm(consts.AMMO_RECENT)) {
        fun.ammoUnequipEvent();
    }
});

on("buttonEvent", (event) => {
    if (!fun.isLoaded || fun.playerDead || settings.disableControls || fun.exitMenuTimer.isEnabled)
        return;
    if (event.code === settings.leftKey.code) {
        fun.leftKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
    } if (event.code === settings.rightKey.code) {
        fun.rightKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
    } if (event.code === settings.upKey.code) {
        fun.upKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
    } if (event.code === settings.downKey.code) {
        fun.downKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
    } if (event.code === settings.itemUseKey.code) {
        fun.itemUseKeyEvent(event.device, event.isDown, event.isUp);
    } if (event.code === settings.cycleEditorKey.code) {
        fun.cycleEditorKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
    } if (event.code === settings.visibilityPouchButton.code) {
        fun.visibilityPouchEvent(event.isDown, event.isUp, event.isHeld, event.heldDuration);
    }
});
