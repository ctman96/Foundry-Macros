/* 
 * Macro for clearing my single-turn effects from allies
 * 
 * Cody Newman, 2022
 */

// Get Player Characters
let targets = canvas.tokens.placeables.filter((t) => {
    if (t.id === token.id) return false;
    // let distance = canvas.grid.measureDistance(token, t, {gridSpaces:true})
    return t.actor.type === "Player Character";
});
console.log(targets)

// Only affect own effects
const effects = ['Magic Weapon', 'Burning Weapons', 'Slick Concoction', 'Galeforce Infusion'];

targets.forEach((target) => {
    let macroActor = target.actor;
    if (macroActor === undefined || macroActor === null) {
        ui.notifications.warn("Please target a token first.");
        return;
    }

    // Disable effects
    macroActor.effects.forEach((e) => {
        console.log(e);
        if (effects.includes(e.name)) {
            macroActor.effects.get(e.id).update({ disabled: true })
        }
    })
})