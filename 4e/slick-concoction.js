/* 
 * Macro for applying Slick Concoction to allies within range
 * 
 * Cody Newman, 2023
 */

// Get relevant player targets
let targets = canvas.tokens.placeables.filter((t) => {
    if (t.id === token.id) return false;
    let distance = canvas.grid.measureDistance(token, t, {gridSpaces:true})
    console.log(t.actor, distance);
    // Only apply to PCs within range
    return distance < 4 && t.actor.type === "Player Character";
});
console.log(targets)

// Not really used, but pull round combat details for effect
let encounter;
let startRound;
let startTurn;
try { 
    encounter = token.combatant.combat.id; 
    startRound = token.combatant.combat.current.round;
    startTurn = token.combatant.combat.current.turn;
} catch (e) {}
if (encounter === undefined || encounter === null) {
    ui.notifications.warn("This requires being in an active encounter");
    return;
}
console.log(encounter, startRound, startTurn);

// Build effect
const effect = {
    name: 'Slick Concoction',
    icon: "icons/consumables/potions/bottle-bulb-empty-glass.webp",
    origin: 'Actor.8aUNbQwhL1GYAjCS',
    duration: {
        startRound,
        startTurn,
        rounds: 1,
        // combat: 'Combat.'+encounter,
    },
    disabled: false,
    changes: [{
        key: 'data.defences.ref.temp',
        mode: 2,
        value: 4,
    }]
}

// Apply effect to targets
targets.forEach((target) => {
    let macroActor = target.actor;
    if (macroActor === undefined || macroActor === null) {
        ui.notifications.warn("Please target a token first.");
        return;
    }

    let encounter;
    try { encounter = target.combatant.combat.id; } catch (e) {}
    if (encounter === undefined || encounter === null) {
        ui.notifications.warn("This requires being in an active encounter");
        return;
    }

    // Check if target already has the effect
    let existing;
    macroActor.effects.forEach((e) => {
        if (e.name === effect.name) {
            existing = e.id;
        }
    })

    if (!existing) {
        // Create new Effect
        macroActor.createEmbeddedDocuments("ActiveEffect", [effect]);
    } else {
        // Update existing effect
        try {
            macroActor.effects.get(existing).update(effect);
        } catch (error) {
            console.error(error);
        }
    }
})