import { Actor, FormType, Game, on, once } from "@skyrim-platform/skyrim-platform";
import { solveForm } from "@skyrim-platform/jcontainers/JDB";
import * as fun from "./index_fun";
import * as consts from "./constants";
import * as settings from "./settings";

once("update", () => {
    fun.initialize();
});

on("loadGame", () => {
    fun.initialize();
});

on("update", () => {
    if (!fun.isInit)
        return;
    fun.updateTime();
    fun.updateElementOpacities();
    fun.updateEditModeRemoveTimer();
    if (!fun.onUpdateInterval())
        return;
    let player = Game.getPlayer();
    fun.updateActivateKey();
    fun.updatePouchObjects();
    fun.updateShoutCooldown(player);
});

on("combatState", (event) => {
    let player = Game.getPlayer();
    if (player?.isInCombat() && event.isCombat) {
        fun.updateCombatUIOpacity(true);
        return;
    }
    if (!player?.isInCombat() && !event.isCombat) {
        fun.updateCombatUIOpacity(false);
        return;
    }
});

on("deathStart", (event) => {
    if (event.actorDying.getFormID() === consts.PLAYER_ID) {
        fun.setPlayerDead(true);
        fun.updateWidgetVisibility();
    }
});

on("menuClose", () => {
    fun.updateMenuClosed();
    fun.updateWidgetVisibility();
});

on("menuOpen", () => {
    fun.updateMenuClosed();
    fun.updateWidgetVisibility();
});

on("containerChanged", (event) => {
    let player = Game.getPlayer();
    fun.updateAmmoCount(player);
    fun.updateQuickItemCounts(player);
    fun.updatePouchCounts(player);
    fun.updateGoldCount(player);
    if (event.baseObj)
        fun.quickItemAddPoisonEvent(event.baseObj);
});

on("equip", (event) => {
    if (!fun.isInit || event.actor.getFormID() !== consts.PLAYER_ID)
        return;
    let player = Actor.from(event.actor);
    let equipped = event.baseObj;
    // Right hand
    if (equipped !== solveForm(consts.RIGHTHAND_RECENT) &&
        equipped === player?.getEquippedObject(1)) {
            fun.rightHandEquipEvent(equipped);
            return;
    }
    // Left hand
    if (equipped !== solveForm(consts.LEFTHAND_RECENT) &&
        equipped === player?.getEquippedObject(0)) {
            fun.leftHandEquipEvent(equipped);
            return;
    }
    // Voice
    if (equipped !== solveForm(consts.VOICE_RECENT) &&
        equipped === player?.getEquippedObject(2)) {
            fun.voiceEquipEvent(equipped);
            return;
    }
    // Ammo
    if (equipped !== solveForm(consts.AMMO_RECENT) &&
        equipped.getType() === FormType.Ammo) {
            fun.ammoEquipEvent(equipped);
            return;
    }
    // Quick item (for cycle adding)
    fun.equipQuickItemEvent(equipped);
});


on("unequip", (event) => {  
    if (!fun.isInit || event.actor.getFormID() !== consts.PLAYER_ID)
        return;
    let unequipped = event.baseObj;
    let player = Actor.from(event.actor);
    // Right hand
    if (solveForm(consts.RIGHTHAND_RECENT) && !player?.getEquippedObject(1)) {
        fun.rightHandUnequipEvent();
        return;
    }
    // Left hand
    if (solveForm(consts.LEFTHAND_RECENT) && !player?.getEquippedObject(0)) {
        fun.leftHandUnequipEvent();
        return;
    }
    // Voice
    if (solveForm(consts.VOICE_RECENT) && !player?.getEquippedObject(2)) {
        fun.voiceUnequipEvent();
        return;
    }
    // Ammo
    if (unequipped === solveForm(consts.AMMO_RECENT)) {
        fun.ammoUnequipEvent();
        return;
    }
});

on("buttonEvent", (event) => {
    if (!fun.isInit || fun.playerDead || settings.disableControls)
        return;
    switch (event.code) {
        case settings.leftKey.code:
            fun.leftKeyEvent(event.device, event.isDown);
            return;
        case settings.rightKey.code:
            fun.rightKeyEvent(event.device, event.isDown);
            return;
        case settings.upKey.code:
            fun.upKeyEvent(event.device, event.isDown);
            return;
        case settings.downKey.code:
            fun.downKeyEvent(event.device, event.isDown, event.isHeld, event.heldDuration);
            return;
        case settings.useKey.code:
            fun.useKeyEvent(event.device, event.isDown, event.isUp, event.isHeld, event.heldDuration);
            return;
        case fun.activateKeyKeyboard.code:
            fun.activateKeyEvent(event.isDown, event.isUp, event.isHeld, event.heldDuration);
            return;
        case fun.activateKeyGamepad.code:
            fun.activateKeyEvent(event.isDown, event.isUp, event.isHeld, event.heldDuration);
            return;
    }
});
