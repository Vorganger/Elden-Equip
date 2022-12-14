import * as sp from "@skyrim-platform/skyrim-platform";

export function equipItemPapyrus(item: sp.Form) {
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_equipItem");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, item);
    (sp as any).ModEvent.Send(handle);
}

export function equipItemExPapyrus(item: sp.Form, slot: number) {
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_equipItemEx");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, item);
    (sp as any).ModEvent.PushInt(handle, slot);
    (sp as any).ModEvent.Send(handle);
}

export function equipSpellPapyrus(spell: sp.Form, slot: number) {
    // Type casting is done in the modEvent.
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_equipSpell");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, spell);
    (sp as any).ModEvent.PushInt(handle, slot);
    (sp as any).ModEvent.Send(handle);
}

export function equipShoutPapyrus(shout: sp.Form) {
    // Type casting is done in the modEvent.
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_equipShout");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, shout);
    (sp as any).ModEvent.Send(handle);
}

export function unequipItemPapyrus(item: sp.Form) {
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_unequipItem");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, item);
    (sp as any).ModEvent.Send(handle);
}

export function unequipItemExPapyrus(item: sp.Form, slot: number) {
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_unequipItemEx");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, item);
    (sp as any).ModEvent.PushInt(handle, slot);
    (sp as any).ModEvent.Send(handle);
}

export function unequipSpellPapyrus(spell: sp.Form, slot: number) {
    // Type casting is done in the modEvent.
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_unequipSpell");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, spell);
    (sp as any).ModEvent.PushInt(handle, slot);
    (sp as any).ModEvent.Send(handle);
}

export function unequipShoutPapyrus(shout: sp.Form) {
    // Type casting is done in the modEvent.
    let handle = (sp as any).ModEvent.Create("ELDEN_EQUIP_unequipShout");
    if (!handle)
        return;
    (sp as any).ModEvent.PushForm(handle, shout);
    (sp as any).ModEvent.Send(handle);
}
