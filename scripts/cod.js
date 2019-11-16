/**
 * Extend the basic ActorSheet with some very simple modifications
 */
class SimpleActorSheet extends ActorSheet {

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = options.classes.concat(["cod", "actor-sheet"]);
	  options.template = "public/systems/cod/templates/actor/actor-sheet.html";
    options.width = 610;
    options.height = 610;
	  return options;
  }

  /* -------------------------------------------- */

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
	activateListeners(html) {
    super.activateListeners(html);

    // Activate tabs
    let tabs = html.find('.tabs');
    let initial = this.actor.data.flags["_sheetTab"];
    new Tabs(tabs, {
      initial: initial,
      callback: clicked => this.actor.data.flags["_sheetTab"] = clicked.attr("data-tab")
    });

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Update Inventory Item
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.getOwnedItem(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      this.actor.deleteOwnedItem(li.data("itemId"));
      li.slideUp(200, () => this.render(false));
    });
  }
}

Actors.unregisterSheet("core", ActorSheet);
Actors.registerSheet("core", SimpleActorSheet, {
  types: [],
  makeDefault: true
});


/* -------------------------------------------- */


/**
 * Extend the basic ItemSheet with some very simple modifications
 */
class SimpleItemSheet extends ItemSheet {

  /**
   * Extend and override the default options used by the 5e Actor Sheet
   */
	static get defaultOptions() {
	  const options = super.defaultOptions;
	  options.classes = options.classes.concat(["worldbuilding", "item-sheet"]);
	  options.template = "public/systems/cod/templates/item-sheet.html";
	  options.height = 400;
	  return options;
  }
}

Items.unregisterSheet("core", ItemSheet);
Items.registerSheet("core", SimpleItemSheet, {
  types: [],
  makeDefault: true
});


/**
 * Set an initiative formula for the system
 * @type {String}
 */
CONFIG.initiative.formula = "1d20";

Hooks.once("init", () => {
    loadTemplates([
	"public/systems/cod/templates/actor/actor-main.html"
    ]);
  });
  
  Hooks.once("init", () => {
    loadTemplates([
	"public/systems/cod/templates/actor/actor-skills.html"
    ]);
  });