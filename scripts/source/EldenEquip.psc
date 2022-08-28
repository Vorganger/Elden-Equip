Scriptname EldenEquip extends ReferenceAlias

event OnInit()
    RegisterForModEvent("ELDEN_EQUIP_equipItem", "OnEquipItem")
    RegisterForModEvent("ELDEN_EQUIP_equipItemEx", "OnEquipItemEx")
    RegisterForModEvent("ELDEN_EQUIP_equipSpell", "OnEquipSpell")
    RegisterForModEvent("ELDEN_EQUIP_equipShout", "OnEquipShout")
    RegisterForModEvent("ELDEN_EQUIP_unequipItem", "OnUnequipItem")
    RegisterForModEvent("ELDEN_EQUIP_unequipItemEx", "OnUnequipItemEx")
    RegisterForModEvent("ELDEN_EQUIP_unequipSpell", "OnUnequipSpell")
    RegisterForModEvent("ELDEN_EQUIP_unequipShout", "OnUnequipShout")
endEvent

event OnEquipItem(Form item)
    Game.getPlayer().equipItem(item, false, true)
endEvent

event OnEquipItemEx(Form item, int slot)
    Game.getPlayer().equipItemEx(item, slot, false, false)
endEvent

event OnEquipSpell(Form item, int slot)
    Spell itemSpell = item as Spell
    Game.getPlayer().equipSpell(itemSpell, slot)
endEvent

event OnEquipShout(Form item)
    Shout itemShout = item as Shout
    Game.getPlayer().equipShout(itemShout)
endEvent

event OnUnequipItem(Form item)
    Game.getPlayer().unequipItem(item, false, true)
endEvent

event OnUnequipItemEx(Form item, int slot)
    Game.getPlayer().unequipItemEx(item, slot, false)
endEvent

event OnUnequipSpell(Form item, int slot)
    Spell itemSpell = item as Spell
    Game.getPlayer().unequipSpell(itemSpell, slot)
endEvent

event OnUnequipShout(Form item)
    Shout itemShout = item as Shout
    Game.getPlayer().unequipShout(itemShout)
endEvent
