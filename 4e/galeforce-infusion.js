/* 
 * Macro for applying Galeforce Infusion to a target within range
 * 
 * Cody Newman, 2023
 */

// Get possible targets
let players = canvas.tokens.placeables.filter((t) => {
    if (t.id === token.id) return false;
    let distance = canvas.grid.measureDistance(token, t, {gridSpaces:true})
    console.log(t.actor.name, distance, t.actor.type)
    return distance < 11 && t.actor.type === "Player Character";
});

if (players === undefined || players === null || players.length === 0) {
    ui.notifications.warn("No valid targets");
    return;
}

const applyGI = (html) => {
    const targetId = html.find('[name="targetSelect"]').val();
    console.log(targetId);
    const target = players.find(({ id }) => id === targetId);
    console.log(target);
    
    if (target === undefined || target === null) {
        ui.notifications.warn("No valid target");
        return;
    }
    let macroActor = target.actor;
    if (macroActor === undefined || macroActor === null) {
        ui.notifications.warn("Cannot access target actor");
        return;
    }

    // Not really used, but pull round combat details for effect
    let encounter;
    let startRound;
    let startTurn;
    try { 
        encounter = target.combatant.combat.id; 
        startRound = target.combatant.combat.current.round;
        startTurn = target.combatant.combat.current.turn;
    } catch (e) {}

    if (encounter === undefined || encounter === null) {
        ui.notifications.warn("This requires being in an active encounter");
        return;
    }

    // Build effect
    const effect = {
        name: 'Galeforce Infusion',
        icon: "icons/magic/air/wind-tornado-spiral-blue-gray.webp",
        origin: 'Actor.dxrbuZ9E8eadpWmT',
        duration: {
            startRound,
            startTurn,
            rounds: 99,
            // combat: 'Combat.'+target.combatant.combat.id,
        },
        disabled: false,
        changes: [{
            key: 'data.defences.ac.temp',
            mode: 2,
            value: token.actor.system.intMod,
        }]
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
        macroActor.effects.get(existing).update(effect)
    }
}

// Construct selection options
let targetHtml = '';
players.forEach((player) => {
    targetHtml = `${targetHtml}\n<option value="${player.id}"><img src="${player.actor.img}">${player.actor.name}</option>`
})

// Prompt for a which target to apply it to
let d = new Dialog({
    title: "Apply Galeforce Infusion",
    content: `
        <form>
        <div class="form-group">
            <label>Target</label>
            <select name="targetSelect" id="targetSelect">
                ${targetHtml}
            </select>
        </div>
        </form>
    `,
    buttons: {
     one: {
      icon: '<i class="fas fa-check"></i>',
      label: "Yes",
      callback: applyGI
     },
     two: {
      icon: '<i class="fas fa-times"></i>',
      label: "No",
      callback: () => {}
     }
    },
    default: "two",
    render: html => console.log("Register interactivity in the rendered dialog"),
    close: html => console.log("This always is logged no matter which option is chosen")
});
d.render(true);