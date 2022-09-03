import { Ammo, Armor, browser, Game, Form, FormType, MagicEffect, Potion, SlotMask, Spell, Ui, Utility, Weapon, WeaponType, printConsole } from "@skyrim-platform/skyrim-platform";
import { solveForm } from "@skyrim-platform/jcontainers/JDB";
import * as settings from "./settings";
import * as utils from "./utilities";
import * as consts from "./constants";

export function isMenuClosed(): boolean {
    return !Utility.isInMenuMode() && (!Ui.isMenuOpen("Crafting Menu") && !Ui.isMenuOpen("Fader Menu") && !Ui.isMenuOpen("Dialogue Menu") || (Ui.isMenuOpen("LootMenu")));
}

// ---------------------------------------
// Simplified JavaScript browser functions
// ---------------------------------------

export function changeOpacity(element: string, time: number, delay: number, opacity: number) {
    if (!settings.uiOpacityTransitions)
        time = 0;
    browser.executeJavaScript(`document.getElementById("${element}").style.transition = "opacity ${time}s";`);
    browser.executeJavaScript(`document.getElementById("${element}").style.transitionDelay = "${delay}s";`);
    browser.executeJavaScript(`document.getElementById("${element}").style.opacity = "${opacity}";`);
}
export function changeScale(element: string, scale: number) {
    browser.executeJavaScript(`document.getElementById("${element}").style.transform = "scale(${scale})";`);
}
export function changeLeft(element: string, viewportWidth: number) {
    browser.executeJavaScript(`document.getElementById("${element}").style.left = "${viewportWidth}vw";`);
}
export function changeRight(element: string, viewportWidth: number) {
    browser.executeJavaScript(`document.getElementById("${element}").style.right = "${viewportWidth}vw";`);
}
export function changeBottom(element: string, viewportHeight: number) {
    browser.executeJavaScript(`document.getElementById("${element}").style.bottom = "${viewportHeight}vh";`);
}
export function changeSource(element: string, source: string) {
    browser.executeJavaScript(`document.getElementById("${element}").src = "${source}";`);
}
export function changeTextContent(element: string, text: string) {
    browser.executeJavaScript(`document.getElementById("${element}").textContent = "${text}";`);
}
export function changeVisibility(element: string, isVisible: boolean) {
    if (isVisible) {
        browser.executeJavaScript(`document.getElementById("${element}").style.visibility = "visible";`);
        return;
    }
    browser.executeJavaScript(`document.getElementById("${element}").style.visibility = "hidden";`);
}
export function resetAnim(element: String) {
    browser.executeJavaScript(`document.getElementById("${element}").style.animation = "none";`);
    browser.executeJavaScript(`document.getElementById("${element}").offsetWidth;`); // reflow
}
export function fullHalfFullOpacity(element: string, time: number, steps: number) {
    resetAnim(element);
    browser.executeJavaScript(`document.getElementById("${element}").style.animation = "full-half-full-opacity ${time}s steps(${steps})";`);
}
export function fadeIn(element: string, time: number, steps: number) {
    resetAnim(element);
    browser.executeJavaScript(`document.getElementById("${element}").style.animation = "fade-in ${time}s steps(${steps})";`);
}
export function fadeOut(element: string, time: number, steps: number) {
    resetAnim(element);
    browser.executeJavaScript(`document.getElementById("${element}").style.animation = "fade-out ${time}s steps(${steps})";`);
}
export function fadeInOut(element: string, time: number, steps: number) {
    resetAnim(element);
    browser.executeJavaScript(`document.getElementById("${element}").style.animation = "fade-in-out ${time}s steps(${steps})";`);
}

// Sets the position based on screen's width and height percentage
export function initWidgetPosition() {
    changeLeft("equipment", settings.uiEquipmentPosition_X);
    changeBottom("equipment", settings.uiEquipmentPosition_Y);

    changeLeft("pouch", settings.uiEquipmentPosition_X);
    changeBottom("pouch", settings.uiEquipmentPosition_Y);

    changeRight("player-gold", settings.uiGoldPosition_X);
    changeBottom("player-gold", settings.uiGoldPosition_Y);
}

export function initWidgetScale() {
    changeScale("equipment", settings.uiEquipmentScaleMult);
    changeScale("pouch", settings.uiEquipmentScaleMult);
    changeScale("player-gold", settings.uiGoldScaleMult);
}

// --------------------
// updateIcon functions
// --------------------

function updateIconSpell(item: Form, iconElement: string) {
    let spell = Spell.from(item);
    let effect = MagicEffect.from(spell?.getNthEffectMagicEffect(0) ?? null);
    let effectResistance = effect?.getResistance();
    // Since voice spells do not take up any magicka
    if (spell?.getMagickaCost() === 0) {
        changeSource(iconElement, consts.VOICE_POWER_ICON);
        return;
    }
    // LH/RH magic spells
    utils.getSpellSchool(spell).then(function(result) {
        switch (result) {
            case "Alteration":
                changeSource(iconElement, consts.MAGIC_ALTERATION_ICON);
                break;
            case "Conjuration":
                changeSource(iconElement, consts.MAGIC_CONJURATION_ICON);
                break;
            case "Destruction":
                changeSource(iconElement, consts.MAGIC_DESTRUCTION_ICON);
                if (effectResistance === "ElectricResist") {
                    changeSource(`${iconElement}-secondary`, consts.EFFECT_ELECTRIC_ICON);
                    break;
                }
                if (effectResistance === "FireResist") {
                    changeSource(`${iconElement}-secondary`, consts.EFFECT_FIRE_ICON);
                    break;
                }
                if (effectResistance === "FrostResist") {
                    changeSource(`${iconElement}-secondary`, consts.EFFECT_FROST_ICON);
                    break;
                }
                break;
            case "Illusion":
                changeSource(iconElement, consts.MAGIC_ILLUSION_ICON);
                break;
            case "Restoration":
                changeSource(iconElement, consts.MAGIC_RESTORATION_ICON);
                break;
            default:
                changeSource(iconElement, "");
                break;
        }
    });
}

function updateIconArmor(item: Form, iconElement: string) {
    let armor = Armor.from(item);
    let weightClass = armor?.getWeightClass(); // 0: light, 1: heavy, 2: neither
    let slotMask = armor?.getSlotMask();
    switch (slotMask) {
        // For some strange reason, helmet is not found in the SlotMask enum.
        // Here are their values:
        case 4098: // head
            if (weightClass === 0)
                changeSource(iconElement, consts.ARMOR_HEAD_LIGHT_ICON);
            if (weightClass === 1)
            changeSource(iconElement, consts.ARMOR_HEAD_HEAVY_ICON);
            if (weightClass === 2)
                changeSource(iconElement, consts.ARMOR_HEAD_ICON);
            return;
        case 12291: // head (heavy)
            changeSource(iconElement, consts.ARMOR_HEAD_HEAVY_ICON);
            return;
        case SlotMask.Body:
            if (weightClass === 0)
                changeSource(iconElement, consts.ARMOR_BODY_LIGHT_ICON);
            if (weightClass === 1)
                changeSource(iconElement, consts.ARMOR_BODY_HEAVY_ICON);
            if (weightClass === 2)
                changeSource(iconElement, consts.ARMOR_BODY_ICON);
            break;
        case SlotMask.Hands:
            if (weightClass === 0)
                changeSource(iconElement, consts.ARMOR_HANDS_LIGHT_ICON);
            if (weightClass === 1)
                changeSource(iconElement, consts.ARMOR_HANDS_HEAVY_ICON);
            if (weightClass === 2)
                changeSource(iconElement, consts.ARMOR_HANDS_ICON);
            break;
        case SlotMask.Amulet:
            changeSource(iconElement, consts.ARMOR_AMULET_ICON);
            break;
        case SlotMask.Ring:
            changeSource(iconElement, consts.ARMOR_RING_ICON);
            break;
        case SlotMask.Feet:
            if (weightClass === 0)
                changeSource(iconElement, consts.ARMOR_FEET_LIGHT_ICON);
            if (weightClass === 1)
                changeSource(iconElement, consts.ARMOR_FEET_HEAVY_ICON);
            if (weightClass === 2)
                changeSource(iconElement, consts.ARMOR_FEET_ICON);
            break;
        case SlotMask.Shield:
            if (weightClass === 0)
                changeSource(iconElement, consts.ARMOR_SHIELD_LIGHT_ICON);
            if (weightClass === 1)
                changeSource(iconElement, consts.ARMOR_SHIELD_HEAVY_ICON);
            break;
        case SlotMask.Circlet:
            changeSource(iconElement, consts.ARMOR_CIRCLET_ICON);
            break;
        case 0x80000: // several SlotMask values use this
            changeSource(iconElement, consts.ARMOR_ICON);
        default:
            break;
    }
}

function updateIconWeapon(item: Form, iconElement: string) {
    let weapon = Weapon.from(item);
    if (!weapon)
        return;
    let weaponType = weapon.getWeaponType();
    switch (weaponType) {
        case WeaponType.Fist:
            break;
        case WeaponType.Sword:
            changeSource(iconElement, consts.WEAPON_1H_SWORD_ICON);
            break;
        case WeaponType.Dagger:
            changeSource(iconElement, consts.WEAPON_1H_DAGGER_ICON);
            break;
        case WeaponType.WarAxe:
            let weaponID = weapon.getFormID();
            // Pickaxe (ancient nordic pickaxe does not have the pickaxe icon)
            if (weaponID === consts.NOTCHED_PICKAXE_ID ||
                weaponID === consts.PICKAXE_ID) {
                    changeSource(iconElement, consts.WEAPON_PICKAXE_ICON);
                    break;
            }
            // Woodcutter's axe
            if (weaponID === consts.WOODCUTTERS_AXE_ID) {
                changeSource(iconElement, consts.WEAPON_WOODCUTTERAXE_ICON);
                break;
            }
            // Any other war axe
            changeSource(iconElement, consts.WEAPON_1H_WARAXE_ICON);
            break;
        case WeaponType.Mace:
            changeSource(iconElement, consts.WEAPON_1H_MACE_ICON);
            break;
        case WeaponType.Greatsword:
            changeSource(iconElement, consts.WEAPON_2H_GREATSWORD_ICON);
            break;
        case WeaponType.Battleaxe: 
            if (utils.isBattleaxe(item))
                changeSource(iconElement, consts.WEAPON_2H_BATTLEAXE_ICON);
            if (!utils.isBattleaxe(item))
                changeSource(iconElement, consts.WEAPON_2H_WARHAMMER_ICON);
            break;
        case WeaponType.Bow:
            changeSource(iconElement, consts.WEAPON_BOW_ICON);
            break;
        case WeaponType.Staff:
            changeSource(iconElement, consts.WEAPON_STAFF_ICON);
            break;
        case WeaponType.Crossbow:
            changeSource(iconElement, consts.WEAPON_CROSSBOW_ICON);
            break;
    }
    let weaponEnchantment = weapon.getEnchantment();
    if (weaponEnchantment) {
        let weaponResistance = weaponEnchantment.getNthEffectMagicEffect(0)?.getResistance();
        switch (weaponResistance) {
            case "ElectricResist":
                changeSource(`${iconElement}-secondary`, consts.EFFECT_ELECTRIC_ICON);
                break;
            case "FireResist":
                changeSource(`${iconElement}-secondary`, consts.EFFECT_FIRE_ICON);
                break;
            case "FrostResist":
                changeSource(`${iconElement}-secondary`, consts.EFFECT_FROST_ICON);
                break;
            default:
                changeSource(`${iconElement}-secondary`, consts.EFFECT_ENCHANTMENT_ICON);
                break;
        }
    }
}

function updateIconAmmo(item: Form, iconElement: string) {
    let ammo = Ammo.from(item);
    if (!ammo)
        return;
    if (ammo.isBolt())
        changeSource(iconElement, consts.AMMO_BOLT_ICON);
    if (!ammo.isBolt())
        changeSource(iconElement, consts.AMMO_ARROW_ICON);
}

function updateIconPotion(item: Form, iconElement: string) {
    let potion = Potion.from(item);
    switch (potion?.getNthEffectMagicEffect(0)?.getFormID()) {
        // Resistance potions
        case consts.RESIST_FIRE_ID:
            changeSource(iconElement, consts.POTION_RESIST_FIRE_ICON);
            return;
        case consts.RESIST_FROST_ID:
            changeSource(iconElement, consts.POTION_RESIST_FROST_ICON);
            return;
        case consts.RESIST_SHOCK_ID:
            changeSource(iconElement, consts.POTION_RESIST_SHOCK_ICON);
            return;
        // Regeneration potions
        case consts.REGENERATE_HEALTH_ID:
            changeSource(iconElement, consts.POTION_HEALTH_ICON);
            return;
        case consts.REGENERATE_STAMINA_ID:
            changeSource(iconElement, consts.POTION_STAMINA_ICON);
            return;
        case consts.REGENERATE_MAGICKA_ID:
            changeSource(iconElement, consts.POTION_MAGICKA_ICON);
            return;
        // Restoration potions
        case consts.RESTORE_HEALTH_ID:
            changeSource(iconElement, consts.POTION_HEALTH_ICON);
            return;
        case consts.RESTORE_STAMINA_ID:
            changeSource(iconElement, consts.POTION_STAMINA_ICON);
            return;
        case consts.RESTORE_MAGICKA_ID:
            changeSource(iconElement, consts.POTION_MAGICKA_ICON);
            return;
        // Restoration foods
        case consts.RESTORE_HEALTH_FOOD_ID:
            changeSource(iconElement, consts.POTION_FOOD_ICON);
            return;
        case consts.RESTORE_STAMINA_FOOD_ID:
            changeSource(iconElement, consts.POTION_ALCOHOL_ICON);
            return;
    }
    // Poisons
    if (potion?.isPoison()) {
        changeSource(iconElement, consts.POTION_POISON_ICON);
        return;
    }
    // Generic potion
    changeSource(iconElement, consts.POTION_ICON);
}

function updateIcon(item: Form | null, iconElement: string) {
    if (!settings.uiVisible)
        return;
    // Resets secondary icon
    changeSource(`${iconElement}-secondary`, "");
    if (!item) {
        changeSource(iconElement, "");
        return;
    }
    // Sets main icon
    switch (item.getType()) {
        case FormType.Spell:
            updateIconSpell(item, iconElement);
            return;
        case FormType.Armor:
            updateIconArmor(item, iconElement);
            return;
        case FormType.Light:
            changeSource(iconElement, consts.ITEM_TORCH_ICON);
            return;
        case FormType.Weapon:
            updateIconWeapon(item, iconElement);
            return;
        case FormType.Ammo:
            updateIconAmmo(item, iconElement);
            return;
        case FormType.Potion:
            updateIconPotion(item, iconElement);
            return;
        case FormType.Shout:
            changeSource(iconElement, consts.VOICE_SHOUT_ICON);
            return;
    }
}

function updateIconOpacity(item: Form | null, iconElement: string) {
    if (utils.hasItem(item)) {
        changeOpacity(iconElement, 0, 0, 1);
        return;
    }
    changeOpacity(iconElement, 0, 0, 0.5);
}

export function updateItemCount(countElement: string, iconElement: string, item: Form | null) {
    if (!settings.uiVisible)
        return;
    updateIconOpacity(item, iconElement);
    let itemType = item?.getType();
    if (itemType === FormType.Ammo || itemType === FormType.Potion) {
        let itemCount = (Game.getPlayer()?.getItemCount(item) ?? 0).toString();
        changeTextContent(countElement, itemCount);
        return;
    }
    changeTextContent(countElement, "");
}

// --------------------------------------
// Functions for specific widget elements
// --------------------------------------

// 2H held? -> left hand icon opacity is 0.5
function updateLeftHandIconOpacity(currentRH: Form | null) {
    if (utils.isItem2H(currentRH)) {
        let recentLH = solveForm(consts.LEFTHAND_RECENT) ?? null;
        updateIcon(recentLH, "left-hand-icon");
        changeOpacity("left-hand-icon", 0, 0, 0.5);
        changeOpacity("left-hand-icon-secondary", 0, 0, 0.5);
        changeTextContent("left-hand-name", recentLH?.getName() ?? "");
        return;
    }
    changeOpacity("left-hand-icon", 0, 0, 1);
    changeOpacity("left-hand-icon-secondary", 0, 0, 1);
}

// Updates icon and name of specified slot, given a Form object (i.e. equipped item)
export function updateEquippedItemWidget(slot: number, item: Form | null) {
    if (!settings.uiVisible)
        return;
    let elementPrefix: string;
    switch (slot) {
        case 0:
            elementPrefix = "left-hand";
            break;
        case 1:
            elementPrefix = "right-hand";
            updateLeftHandIconOpacity(item);
            break;
        case 2:
            elementPrefix = "voice";
            break;
        default:
            return;
    }
    updateIcon(item, `${elementPrefix}-icon`);
    changeTextContent(`${elementPrefix}-name`, item?.getName() ?? "");
}

// Updates icon and name of the quick item widget, given Form objects (i.e. quick items)
export function updateQuickItemWidget(item: Form | null, firstNextItem: Form | null, secondNextItem: Form | null) {
    if (!settings.uiVisible)
        return;
    changeTextContent("quick-item-name", item?.getName() ?? "");
    updateItemCount("quick-item-count", "quick-item-icon", item);
    updateIcon(item, "quick-item-icon");
    if (!firstNextItem) {
        changeVisibility("quick-item-offset-1", false);
        changeVisibility("quick-item-offset-2", false);
        return;
    }
    updateIcon(firstNextItem, "quick-item-offset-1-icon");
    updateIconOpacity(firstNextItem, "quick-item-offset-1-icon");
    changeVisibility("quick-item-offset-1", true);
    if (!secondNextItem) {
        changeVisibility("quick-item-offset-2", false);
        return;
    }
    updateIcon(secondNextItem, "quick-item-offset-2-icon");
    updateIconOpacity(secondNextItem, "quick-item-offset-2-icon");
    changeVisibility("quick-item-offset-2", true);
}

// Updates icons and names of all elements in the pouch widget, given an index
export function updatePouchWidget(item: Form | null, pouchIndex: number) {
    if (!settings.uiVisible)
        return;
    let elementPrefix = "";
    switch (pouchIndex) {
        case 0:
            elementPrefix = "up-pouch"; break;
        case 1:
            elementPrefix = "right-pouch"; break;
        case 2:
            elementPrefix = "left-pouch"; break;
        case 3:
            elementPrefix = "down-pouch"; break;
    }
    changeTextContent(`${elementPrefix}-name`, item?.getName() ?? "");
    updateItemCount(`${elementPrefix}-count`, `${elementPrefix}-icon`, item);
    updateIcon(item, `${elementPrefix}-icon`);
}

export function setAmmoWidgetVisibility(isVisible: boolean) {
    if (isVisible) {
        changeVisibility("ammo", true);
        changeVisibility("ammo-name", true);
        return;
    }
    changeVisibility("ammo", false);
    changeVisibility("ammo-name", false);
}

export async function updateAmmoWidget() {
    let player = Game.getPlayer();
    let ammo = solveForm(consts.AMMO_RECENT) ?? null;
    // Updates the icon, name, and count
    updateIcon(ammo, "ammo-icon");
    changeTextContent("ammo-name", (ammo?.getName() ?? ""));
    changeTextContent("ammo-count", ((ammo) ? player?.getItemCount(ammo).toString() ?? "" : ""));
    // Updates icon opacity based on ammo and weapon are compatibility.
    let weapon = Weapon.from(player?.getEquippedObject(1) ?? null);
    if (utils.isAmmoCompatible(weapon, Ammo.from(ammo))) {
        changeOpacity("ammo-icon", 0, 0, 1);
        return;
    }
    changeOpacity("ammo-icon", 0, 0, 0.5);
}

export function flashAnim(element: number) {
    if (!settings.uiVisible)
        return;
    if (!settings.uiFlashFeedback)
        return;
    let id = "";
    if (element === 0)
        id = "voice-flash";
    if (element === 1)
        id = "quick-item-flash";
    if (element === 2)
        id = "left-hand-flash";
    if (element === 3)
        id = "right-hand-flash";
    fadeOut(id, 0.1, 2);
}

export function flashRedAnim() {
    if (!settings.uiVisible)
        return;
    if (!settings.uiFlashFeedback)
        return;
    fadeOut("quick-item-flash-red", 0.6, 12);
}

export function shoutFlashAnim(maxShoutTime: number) {
    if (!settings.uiVisible)
        return;
    fadeIn("voice-icon", maxShoutTime, maxShoutTime * 4);
    fadeOut("voice-flash", 0.2, 4);
    fullHalfFullOpacity("voice-name", maxShoutTime, maxShoutTime);
}

export function shoutRechargedFlashAnim() {
    if (!settings.uiVisible)
        return;
    fadeOut("voice-flash-alt", 0.2*2, 4*2);
}

export function updateGoldCount(goldCount: number) {
    if (!settings.uiVisible)
        return;
    changeTextContent("player-gold-count", goldCount.toString());
}

// ----------------------------------------------
// goldCountAnimation(goldDelta)
// goldDelta: change in gold count.
// Plays a count animation of added/removed gold.
// ----------------------------------------------
export async function goldCountAnimation(goldDelta: number) {
    if (!settings.uiVisible)
        return;
    if (!settings.uiGoldWidgetVisibility)
        return;
    if (goldDelta === 0)
        return;
    let player = Game.getPlayer();
    if (!player)
        return;
    let playerGold = player.getGoldAmount();
    let tempGold = playerGold - goldDelta; // starting amount
    let incrementMult = 2;
    let goldIncrement = incrementMult * Math.floor(Math.sqrt(Math.abs(goldDelta)));
    // Shows gold delta
    let goldDeltaDuration = 2;
    let deltaSign = "";
    if (goldDelta > 0)
        deltaSign = "+";
    changeTextContent("player-gold-delta", `${deltaSign}${goldDelta}`);
    fadeInOut("player-gold-delta", goldDeltaDuration, 4);
    await Utility.wait(1); // delay before playing the counter animation
    // Positive delta counter animation
    if (goldDelta > 0) {
        while (tempGold < playerGold) {
            changeTextContent("player-gold-count", tempGold.toString());
            tempGold += goldIncrement;
            await Utility.wait(0.001);
        }
    }
    // Negative delta counter animation
    if (goldDelta < 0) {
        while (tempGold > playerGold) {
            changeTextContent("player-gold-count", tempGold.toString());
            tempGold -= goldIncrement;
            await Utility.wait(0.001);
        }
    }
    changeTextContent("player-gold-count", playerGold.toString());
}
