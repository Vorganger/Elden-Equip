import { Ammo, Armor, browser, Game, Form, FormType, MagicEffect, Potion, SlotMask, Spell, Ui, Utility, Weapon, WeaponType } from "@skyrim-platform/skyrim-platform";
import { solveForm } from "@skyrim-platform/jcontainers/JDB";
import * as settings from "./settings";
import * as utils from "./utilities";
import * as consts from "./constants";

export function isMenuClosed(): boolean {
    return !Utility.isInMenuMode() && (!Ui.isMenuOpen("Crafting Menu") && !Ui.isMenuOpen("Fader Menu") && !Ui.isMenuOpen("Dialogue Menu")
            && !Ui.isMenuOpen("PluginExplorerMenu") || (Ui.isMenuOpen("LootMenu")));
}

export function changeOpacity(element: string, time: number, delay: number, opacity: number) {
    if (settings.widgetDisableOpacityTransitions)
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
    changeLeft("equipment", settings.widgetEquipmentX);
    changeBottom("equipment", settings.widgetEquipmentY);

    changeLeft("pouch", settings.widgetEquipmentX);
    changeBottom("pouch", settings.widgetEquipmentY);

    changeRight("player-gold", settings.widgetGoldX);
    changeBottom("player-gold", settings.widgetGoldY);
}

export function initWidgetScale() {
    changeScale("equipment", settings.widgetEquipmentScale);
    changeScale("pouch", settings.widgetEquipmentScale);
    changeScale("player-gold", settings.widgetGoldScale);
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
        if (result === "Alteration") {
            changeSource(iconElement, consts.MAGIC_ALTERATION_ICON);
        } else if (result === "Conjuration") {
            changeSource(iconElement, consts.MAGIC_CONJURATION_ICON);
        } else if (result === "Destruction") {
            changeSource(iconElement, consts.MAGIC_DESTRUCTION_ICON);
            if (effectResistance === "ElectricResist") {
                changeSource(`${iconElement}-secondary`, consts.EFFECT_ELECTRIC_ICON);
            } else if (effectResistance === "FireResist") {
                changeSource(`${iconElement}-secondary`, consts.EFFECT_FIRE_ICON);
            } else if (effectResistance === "FrostResist") {
                changeSource(`${iconElement}-secondary`, consts.EFFECT_FROST_ICON);
            }
        } else if (result === "Illusion") {
            changeSource(iconElement, consts.MAGIC_ILLUSION_ICON);
        } else if (result === "Restoration") {
            changeSource(iconElement, consts.MAGIC_RESTORATION_ICON);
        } else {
            changeSource(iconElement, "");
        }
    });
}

function updateIconArmor(item: Form, iconElement: string) {
    let armor = Armor.from(item);
    let weightClass = armor?.getWeightClass(); // 0: light, 1: heavy, 2: neither
    let slotMask = armor?.getSlotMask();
    // For some strange reason, helmet is not found in the SlotMask enum
    // Here are their values:
    if (slotMask === 4098) { // head
        if (weightClass === 0) {
            changeSource(iconElement, consts.ARMOR_HEAD_LIGHT_ICON);
        } else if (weightClass === 1) {
            changeSource(iconElement, consts.ARMOR_HEAD_HEAVY_ICON);
        } else if (weightClass === 2) {
            changeSource(iconElement, consts.ARMOR_HEAD_ICON);
        }
    } else if (slotMask === 12291) { // head (heavy)
        changeSource(iconElement, consts.ARMOR_HEAD_HEAVY_ICON);
    } else if (slotMask === SlotMask.Body) {
        if (weightClass === 0) {
            changeSource(iconElement, consts.ARMOR_BODY_LIGHT_ICON);
        } else if (weightClass === 1) {
            changeSource(iconElement, consts.ARMOR_BODY_HEAVY_ICON);
        } else if (weightClass === 2) {
            changeSource(iconElement, consts.ARMOR_BODY_ICON);
        }
    } else if (slotMask === SlotMask.Hands) {
        if (weightClass === 0) {
            changeSource(iconElement, consts.ARMOR_HANDS_LIGHT_ICON);
        } else if (weightClass === 1) {
            changeSource(iconElement, consts.ARMOR_HANDS_HEAVY_ICON);
        } else if (weightClass === 2) {
            changeSource(iconElement, consts.ARMOR_HANDS_ICON);
        }
    } else if (slotMask === SlotMask.Amulet) {
        changeSource(iconElement, consts.ARMOR_AMULET_ICON);
    } else if (slotMask === SlotMask.Ring) {
        changeSource(iconElement, consts.ARMOR_RING_ICON);
    } else if (slotMask === SlotMask.Feet) {
        if (weightClass === 0) {
            changeSource(iconElement, consts.ARMOR_FEET_LIGHT_ICON);
        } else if (weightClass === 1) {
            changeSource(iconElement, consts.ARMOR_FEET_HEAVY_ICON);
        } else if (weightClass === 2) {
            changeSource(iconElement, consts.ARMOR_FEET_ICON);
        }
    } else if (slotMask === SlotMask.Shield) {
        if (weightClass === 0)
            changeSource(iconElement, consts.ARMOR_SHIELD_LIGHT_ICON);
        if (weightClass === 1)
            changeSource(iconElement, consts.ARMOR_SHIELD_HEAVY_ICON);
    } else if (SlotMask.Circlet) {
        changeSource(iconElement, consts.ARMOR_CIRCLET_ICON);
    } else {
        changeSource(iconElement, consts.ARMOR_ICON);
    }
}

function updateIconWeapon(item: Form, iconElement: string) {
    // SkyUI Weapons Pack icons
    if (utils.isClaw(item)) {
        changeSource(iconElement, consts.WEAPON_CLAW_ICON);
    } else if (utils.isGun(item)) {
        changeSource (iconElement, consts.WEAPON_GUN_ICON);
    } else if (utils.isHalberd(item)) {
        changeSource(iconElement, consts.WEAPON_HALBERD_ICON);
    } else if (utils.isJavelin(item)) {
        changeSource(iconElement, consts.WEAPON_JAVELIN_ICON);
    } else if (utils.isKatana(item)) {
        changeSource(iconElement, consts.WEAPON_KATANA_ICON);
    } else if (utils.isPike(item)) {
        changeSource(iconElement, consts.WEAPON_PIKE_ICON);
    } else if (utils.isQuarterstaff(item)) {
        changeSource(iconElement, consts.WEAPON_QUARTERSTAFF_ICON);
    } else if (utils.isRapier(item)) {
        changeSource(iconElement, consts.WEAPON_RAPIER_ICON);
    } else if (utils.isScythe(item)) {
        changeSource(iconElement, consts.WEAPON_SCYTHE_ICON);
    } else if (utils.isSpear(item)) {
        changeSource(iconElement, consts.WEAPON_SPEAR_ICON);
    } else if (utils.isWhip(item)) {
        changeSource(iconElement, consts.WEAPON_WHIP_ICON);
    } // Regular weapon icons
    else if (utils.isBattleaxe(item)) {
        changeSource(iconElement, consts.WEAPON_2H_BATTLEAXE_ICON);
    } else if (utils.isBow(item)) {        
        changeSource(iconElement, consts.WEAPON_BOW_ICON);
    } else if (utils.isCrossbow(item)) {
        changeSource(iconElement, consts.WEAPON_CROSSBOW_ICON);
    } else if (utils.isDagger(item)) {
        changeSource(iconElement, consts.WEAPON_1H_DAGGER_ICON);
    } else if (utils.isGreatsword(item)) {
        changeSource(iconElement, consts.WEAPON_2H_GREATSWORD_ICON);
    } else if (utils.isMace(item)) {
        changeSource(iconElement, consts.WEAPON_1H_MACE_ICON);
    } else if (utils.isStaff(item)) {        
        changeSource(iconElement, consts.WEAPON_STAFF_ICON);
    } else if (utils.isSword(item)) {
        changeSource(iconElement, consts.WEAPON_1H_SWORD_ICON);
    } else if (utils.isWarAxe(item)) {
        let itemID = item.getFormID();
        // Pickaxe (ancient nordic pickaxe does not have the pickaxe icon)
        if (itemID === consts.NOTCHED_PICKAXE_ID || itemID === consts.PICKAXE_ID) {
            changeSource(iconElement, consts.WEAPON_PICKAXE_ICON);
        } else if (itemID === consts.WOODCUTTERS_AXE_ID) {
            changeSource(iconElement, consts.WEAPON_WOODCUTTERAXE_ICON);
        } else {
            changeSource(iconElement, consts.WEAPON_1H_WARAXE_ICON);
        }
    } else if (utils.isWarhammer(item)) {
        changeSource(iconElement, consts.WEAPON_2H_WARHAMMER_ICON);
    }
    let weapon = Weapon.from(item);
    let weaponEnchantment = weapon?.getEnchantment();
    if (weaponEnchantment) {
        let weaponResistance = weaponEnchantment.getNthEffectMagicEffect(0)?.getResistance();
        if (weaponResistance === "ElectricResist") {
            changeSource(`${iconElement}-secondary`, consts.EFFECT_ELECTRIC_ICON);
        } else if (weaponResistance === "FireResist") {
            changeSource(`${iconElement}-secondary`, consts.EFFECT_FIRE_ICON);
        } else if (weaponResistance === "FrostResist") {
            changeSource(`${iconElement}-secondary`, consts.EFFECT_FROST_ICON);
        } else {
            changeSource(`${iconElement}-secondary`, consts.EFFECT_ENCHANTMENT_ICON);
        }
    }
}

function updateIconAmmo(item: Form, iconElement: string) {
    let ammo = Ammo.from(item);
    if (!ammo) {
        return;
    } else if (ammo.isBolt()) {
        changeSource(iconElement, consts.AMMO_BOLT_ICON);
    } else {
        changeSource(iconElement, consts.AMMO_ARROW_ICON);
    }
}

function updateIconPotion(item: Form, iconElement: string) {
    let potion = Potion.from(item);
    let potionTypeID = potion?.getNthEffectMagicEffect(0)?.getFormID();
    // Resistance potions
    if (potionTypeID === consts.RESIST_FIRE_ID) {
        changeSource(iconElement, consts.POTION_RESIST_FIRE_ICON);
    } else if (potionTypeID === consts.RESIST_FROST_ID) {
        changeSource(iconElement, consts.POTION_RESIST_FROST_ICON);
    } else if (potionTypeID === consts.RESIST_SHOCK_ID) {
        changeSource(iconElement, consts.POTION_RESIST_SHOCK_ICON);
    }
    // Regeneration/restoration potions
    else if (potionTypeID === consts.REGENERATE_HEALTH_ID || potionTypeID === consts.RESTORE_HEALTH_ID) {
        changeSource(iconElement, consts.POTION_HEALTH_ICON);
    } else if (potionTypeID === consts.REGENERATE_STAMINA_ID || potionTypeID === consts.RESTORE_STAMINA_ID) {
        changeSource(iconElement, consts.POTION_STAMINA_ICON);
    } else if (potionTypeID === consts.REGENERATE_MAGICKA_ID || potionTypeID === consts.RESTORE_MAGICKA_ID) {
        changeSource(iconElement, consts.POTION_MAGICKA_ICON);
    }
    // Restoration foods
    else if (potionTypeID === consts.RESTORE_HEALTH_FOOD_ID) {
        changeSource(iconElement, consts.POTION_FOOD_ICON);
    } else if (potionTypeID === consts.RESTORE_STAMINA_FOOD_ID) {
        changeSource(iconElement, consts.POTION_ALCOHOL_ICON);
    }
    // Poisons
    else if (potionTypeID === potion?.isPoison()) {
        changeSource(iconElement, consts.POTION_POISON_ICON);
    }
    // Generic potion
    else {
        changeSource(iconElement, consts.POTION_ICON);
    }
}

function updateIcon(item: Form | null, iconElement: string) {
    if (settings.hideWidgets)
        return;
    // Resets secondary icon
    changeSource(`${iconElement}-secondary`, "");
    if (!item) {
        changeSource(iconElement, "");
        return;
    }
    // Sets main icon
    let itemType = item.getType();
    if (itemType === FormType.Spell) {
        updateIconSpell(item, iconElement);
    } else if (itemType === FormType.ScrollItem) {
        changeSource(iconElement, consts.ITEM_SCROLL_ICON);
    } else if (itemType === FormType.Armor) {
        updateIconArmor(item, iconElement);
    } else if (itemType === FormType.Light) {
        changeSource(iconElement, consts.ITEM_TORCH_ICON);
    } else if (itemType === FormType.Weapon) {
        updateIconWeapon(item, iconElement);
    } else if (itemType === FormType.Ammo) {
        updateIconAmmo(item, iconElement);
    } else if (itemType === FormType.Potion) {
        updateIconPotion(item, iconElement);
    } else if (itemType === FormType.Shout) {
        changeSource(iconElement, consts.VOICE_SHOUT_ICON);
    }
}

function updateIconOpacity(item: Form | null, iconElement: string) {
    // Special case for quick item icons (including offset icons) to have
    // the optimal potion icon opacities be changed
    if (item?.getType() === FormType.Potion && (iconElement === "quick-item-icon" || iconElement === "quick-item-offset-1-icon" || iconElement === "quick-item-offset-2-icon"))
    {
        let potion = Potion.from(item);
        let potionType = potion?.getNthEffectMagicEffect(0)?.getFormID() ?? 0;
        if ((potionType === consts.RESTORE_HEALTH_ID && settings.useOptimalHealthPotion) ||
            (potionType === consts.RESTORE_MAGICKA_ID && settings.useOptimalMagickaPotion) ||
            (potionType === consts.RESTORE_STAMINA_ID && settings.useOptimalStaminaPotion))
        {
            let potionTypeCount = getTotalPotionTypeCount(potionType);
            if (potionTypeCount > 0) {
                changeOpacity(iconElement, 0, 0, 1);
                return;
            }
        }
    }
    if (utils.hasItem(item)) {
        changeOpacity(iconElement, 0, 0, 1);
        return;
    }
    changeOpacity(iconElement, 0, 0, 0.5);
}

export function updateItemCount(countElement: string, iconElement: string, item: Form | null) {
    if (settings.hideWidgets)
        return;
    updateIconOpacity(item, iconElement);
    let itemType = item?.getType();
    if (item && (itemType === FormType.Ammo || itemType === FormType.Potion)) {
        let itemCount = Game.getPlayer()?.getItemCount(item) ?? 0;
        changeTextContent(countElement, itemCount.toString());
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
    if (settings.hideWidgets) {
        return;
    }
    let elementPrefix: string;
    if (slot === 0) {
        elementPrefix = "left-hand";
    } else if (slot === 1) {
        elementPrefix = "right-hand";
        updateLeftHandIconOpacity(item);
    } else if (slot === 2) {
        elementPrefix = "voice";
    } else { // Not a valid equipment item
        return;
    }
    updateIcon(item, `${elementPrefix}-icon`);
    changeTextContent(`${elementPrefix}-name`, item?.getName() ?? "");
}

// Used for optimal restoration potions option
// Could be moved to utils.ts instead
function getTotalPotionTypeCount(potionTypeID: number): number {
    let player = Game.getPlayer();
    let playerNumItems = player?.getNumItems() ?? 0;
    let potionTypeCount = 0;
    for (let i = 0; i < playerNumItems; i++) {
        let item = player?.getNthForm(i);
        // Item is not a potion
        if (item?.getType() !== FormType.Potion)
            continue;
        let potion = Potion.from(item);
        if (potion) {
            let type = potion?.getNthEffectMagicEffect(0)?.getFormID();
            // Item does not match the type
            if (potionTypeID !== type)
                continue;
            potionTypeCount += player?.getItemCount(potion) ?? 0;
        }
    }
    return potionTypeCount;
}

// - This is to be used with the optimal restoration potions option
// - Updates the name to be "Potion (Health/Magicka/Stamina) Restoration"
//   and the count to be the total count of restoration potions of that type
// - The return type determines whether or not to use the Form name/count
//   For instance, true would indicate not to update
export function updateOptimalPotionQuickItemWidget(item: Form | null): boolean {
    updateIconOpacity(item, "quick-item-icon");
    let potion = Potion.from(item);
    let potionType = potion?.getNthEffectMagicEffect(0)?.getFormID(); // Health/magicka/stamina restoration potion
    // Cases to update the quick item widget, depending on the potion type
    if (potionType === consts.RESTORE_HEALTH_ID && settings.useOptimalHealthPotion) {
        changeTextContent("quick-item-name", settings.potionOfHealthRestoration);
        let potionTypeCount = getTotalPotionTypeCount(consts.RESTORE_HEALTH_ID);
        changeTextContent("quick-item-count", potionTypeCount.toString());
        return true;
    }
    if (potionType === consts.RESTORE_MAGICKA_ID && settings.useOptimalMagickaPotion) {
        changeTextContent("quick-item-name", settings.potionOfMagickaRestoration);
        let potionTypeCount = getTotalPotionTypeCount(consts.RESTORE_MAGICKA_ID);
        changeTextContent("quick-item-count", potionTypeCount.toString());
        return true;
    }
    if (potionType === consts.RESTORE_STAMINA_ID && settings.useOptimalStaminaPotion) {
        changeTextContent("quick-item-name", settings.potionOfStaminaRestoration);
        let potionTypeCount = getTotalPotionTypeCount(consts.RESTORE_STAMINA_ID);
        changeTextContent("quick-item-count", potionTypeCount.toString());
        return true;
    }
    return false;
}

// Updates icon and name of the quick item widget, given Form objects (i.e. quick items)
export function updateQuickItemWidget(item: Form | null, firstNextItem: Form | null, secondNextItem: Form | null) {
    if (settings.hideWidgets)
        return;
    // Keeps optimal restoration potions and regular Form objects separate
    if (!updateOptimalPotionQuickItemWidget(item)) {
        changeTextContent("quick-item-name", item?.getName() ?? "");
        updateItemCount("quick-item-count", "quick-item-icon", item);
    }
    updateIcon(item, "quick-item-icon");
    updateIconOpacity(item, "quick-item-icon");
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
    if (settings.hideWidgets)
        return;
    let elementPrefix = "";
    if (pouchIndex === 0) {
        elementPrefix = "left-pouch";
    } else if (pouchIndex === 1) {
        elementPrefix = "up-pouch";
    } else if (pouchIndex === 2) {
        elementPrefix = "right-pouch";
    } else if (pouchIndex === 3) {
        elementPrefix = "down-pouch";
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
    let ammoCount = 0;
    if (ammo) {
        ammoCount = player?.getItemCount(ammo) ?? 0;
    }
    let ammoCountStr;
    if (ammoCount === 0) {
        ammoCountStr = "";
    } else {
        ammoCountStr = ammoCount.toString();
    }
    changeTextContent("ammo-count", ammoCountStr);
    // Updates icon opacity depending on weapon and ammo compatibility
    let weapon = Weapon.from(player?.getEquippedObject(1) ?? null);
    if (utils.isAmmoCompatible(weapon, Ammo.from(ammo))) {
        changeOpacity("ammo-icon", 0, 0, 1);
        return;
    }
    changeOpacity("ammo-icon", 0, 0, 0.5);
}

export function flashAnim(element: number) {
    if (settings.hideWidgets)
        return;
    if (settings.widgetDisableFlashFeedback)
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

export function flashRedAnim(element: number) {
    if (settings.hideWidgets)
        return;
    if (settings.widgetDisableFlashFeedback)
        return;
    let id = "";
    if (element === 0)
        id = "voice-flash-red";
    if (element === 1)
        id = "quick-item-flash-red";
    if (element === 2)
        id = "left-hand-flash-red";
    if (element === 3)
        id = "right-hand-flash-red";
    fadeOut(id, 0.6, 12);
}

export function shoutFlashAnim(maxShoutTime: number) {
    if (settings.hideWidgets)
        return;
    fadeIn("voice-icon", maxShoutTime, maxShoutTime * 4);
    fadeOut("voice-flash", 0.2, 4);
    fullHalfFullOpacity("voice-name", maxShoutTime, maxShoutTime);
}

export function shoutRechargedFlashAnim() {
    if (settings.hideWidgets)
        return;
    fadeOut("voice-flash-alt", 0.2*2, 4*2);
}

export function updateGoldCount(goldCount: number) {
    if (settings.hideWidgets)
        return;
    changeTextContent("player-gold-count", goldCount.toString());
}

// ---------------------------------------------
// goldCountAnimation(goldDelta)
// goldDelta: change in gold count
// Plays a count animation of added/removed gold
// ---------------------------------------------
export async function goldCountAnimation(goldDelta: number) {
    if (settings.hideWidgets)
        return;
    if (settings.hideGoldWidget)
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
