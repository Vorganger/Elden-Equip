import { Ammo, Form, FormType, Game, InputDeviceType, MagicEffect, Spell, Weapon, WeaponType } from "@skyrim-platform/skyrim-platform";
import { addForm, count, getForm, object } from "@skyrim-platform/jcontainers/JArray";
import { solveObj, solveObjSetter } from "@skyrim-platform/jcontainers/JDB";
import *  as modevents from "./modEvents";

// --------------
// Form utilities
// --------------

export function hasKeywordString(form: Form | null, keywordStr: String): boolean {
    if (!form)
        return false;
    for (let n = 0; n < form.getNumKeywords(); n++) {
        let keyword = form.getNthKeyword(n);
        if (!keyword)
            continue;
        if (keyword.getString() === keywordStr)
            return true;
    }
    return false; 
}
export function isBattleaxe(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeBattleaxe"); }
export function isBow(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeBow"); }
export function isDagger(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeDagger"); }
export function isGreatsword(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeGreatsword"); }
export function isMace(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeMace"); }
export function isStaff(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeStaff"); }
export function isSword(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeSword"); }
export function isWarhammer(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeWarhammer"); }
export function isWarAxe(form: Form | null): boolean {
    return hasKeywordString(form, "WeapTypeWarAxe"); }
export function isShield(form: Form | null): boolean {
    return hasKeywordString(form, "ArmorShield"); }
export function isItem2H(form: Form | null | undefined): boolean {
    if (!form)
        return false;
    for (let n = 0; n < form.getNumKeywords(); n++) {
        let keyword = form.getNthKeyword(n);
        if (!keyword)
            continue;
        if (keyword.getString() === "WeapTypeBattleaxe" || keyword.getString() === "WeapTypeBow" ||
            keyword.getString() === "WeapTypeGreatsword" || keyword.getString() === "WeapTypeWarhammer") {
                return true;
        }
    }
    return false; 
}

export function isAmmoCompatible(weapon: Weapon | null, ammo: Ammo | null): boolean {
    if (!weapon || !ammo)
        return false;
    let weaponType = weapon.getWeaponType();
    let ammoIsBolt = ammo.isBolt();
    if (weaponType === WeaponType.Bow && !ammoIsBolt)
        return true;
    if (weaponType === WeaponType.Crossbow && ammoIsBolt)
        return true;
    return false;
}

export async function getSpellSchool(spell: Spell | null): Promise<string> {
    if (!spell)
        return "";
    let effect = MagicEffect.from(spell.getNthEffectMagicEffect(0));
    if (!effect)
        return "";
    let school = await effect.getAssociatedSkill();
    return school;
}

export function hasItem(item: Form | null): boolean {
    if (!item)
        return false;
    let itemType = item.getType();
    if (itemType === FormType.Spell || itemType === FormType.Shout) {
        if (!Game.getPlayer()?.hasSpell(item))
            return false;
        return true;
    }
    if ((Game.getPlayer()?.getItemCount(item) ?? 0) === 0)
        return false;
    return true;
}

export function equip(item: Form | null, slot?: number): boolean {
    if (!item)
        return false;
    let itemType = item.getType();

    if (!hasItem(item))
        return false;

    // Prevents the pre-2H item from being re-equipped
    let currentRH = Game.getPlayer()?.getEquippedObject(1) ?? null;
    if (isItem2H(item) && !isItem2H(currentRH)) {
        unequip(currentRH, 1);
    }

    switch (itemType) {
        case FormType.Spell:
            modevents.equipSpellPapyrus(item, slot ?? 1);
            break;
        case FormType.ScrollItem:
            modevents.equipItemPapyrus(item);
            break;
        case FormType.Armor:
            modevents.equipItemPapyrus(item);
            break;
        case FormType.Light:
            modevents.equipItemExPapyrus(item, 2); // 2: left hand
            break;
        case FormType.Weapon:
            let hand = (slot === 0) ? 2 : 1;
            modevents.equipItemExPapyrus(item, hand);
            break;
        case FormType.Ammo:
            modevents.equipItemPapyrus(item);
            break;
        case FormType.Potion:
            modevents.equipItemPapyrus(item);
            break;
        case FormType.Shout:
            modevents.equipShoutPapyrus(item);
            break;
    }
    return true;
}

export function unequip(item: Form | null, slot?: number): boolean {
    if (!item) {
        if (!slot)
            return false;
        return false;
    }
    let itemType = item.getType();

    switch (itemType) {
        case FormType.Spell:
            modevents.unequipSpellPapyrus(item, slot ?? 1);
            break;
        case FormType.ScrollItem:
            modevents.unequipItemPapyrus(item);
            break;
        case FormType.Armor:
            modevents.unequipItemPapyrus(item);
            break;
        case FormType.Light:
            modevents.unequipItemExPapyrus(item, 2); // 2: left hand
            break;
        case FormType.Weapon:
            let hand = (slot === 0) ? 2 : 1;
            modevents.unequipItemExPapyrus(item, hand);
            break;
        case FormType.Ammo:
            modevents.unequipItemPapyrus(item);
            break;
        case FormType.Shout:
            modevents.unequipShoutPapyrus(item);
            break;
    }
    return true;
}

// ---------------------
// JContainers utilities
// ---------------------

// ----------------------------------------------
// readObjArrFromJCon(path)
// path: location of the setting.
// To be used for cycles. Returns a number array.
// The object stored in JContainers is an array
// of forms, instead of form IDs.
// ----------------------------------------------
export function readObjArrFromJCon(path: string): number[] {
    let objArr = solveObj(path);
    let objLen = count(objArr);
    let convertedArr: number[] = [];
    for (let i = 0; i < objLen; i++) {
        let formID = getForm(objArr, i)?.getFormID() ?? 0;
        convertedArr.push(formID);
    }
    return convertedArr;
}

// -----------------------------------
// writeObjArrToJCon(arr, path)
// arr: array to be added in.
// path: location of the setting.
// To be used for cycles.
// -----------------------------------
export function writeObjArrToJCon(arr: number[], path: string) {
    let objArr = object();
    for (let i = 0; i < arr.length; i++) {
        addForm(objArr, Game.getFormEx(arr[i]));
    }
    solveObjSetter(path, objArr, true);
}

// ---------------
// Input utilities
// ---------------

export interface key {
    code: number;
    device: InputDeviceType;
}

export function convertKeyValue(paramCode: number): key {
    // Keyboard
    if (1 <= paramCode && paramCode <= 211)
        return {code: paramCode, device: InputDeviceType.Keyboard};
    // Mouse
    if (256 <= paramCode && paramCode <= 265) {
        let offset = 256;
        let newCode = paramCode - offset;
        return {code: newCode, device: InputDeviceType.Mouse};
    }
    // Gamepad
    if (266 <= paramCode && paramCode <= 281) {
        let newCode = -1;
        if (266 <= paramCode && paramCode <= 275) {
            let offset = 266;
            let exp = paramCode - offset;
            newCode = Math.pow(2, exp);
        }
        if (276 <= paramCode && paramCode <= 279) {
            let offset = 264;
            let exp = (paramCode - offset);
            newCode = Math.pow(2, exp);
        }
        if (paramCode === 280)
            newCode = 9;
        if (paramCode === 281)
            newCode = 10;
        return {code: newCode, device: InputDeviceType.Gamepad};
    }
    return {code: -1, device: -1};
}
