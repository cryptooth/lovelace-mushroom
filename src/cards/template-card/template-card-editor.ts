import { fireEvent, HomeAssistant, LovelaceCardEditor } from "custom-card-helpers";
import { CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { assert } from "superstruct";
import setupCustomlocalize from "../../localize";
import { configElementStyle } from "../../utils/editor-styles";
import { GENERIC_FIELDS } from "../../utils/form/fields";
import { HaFormSchema } from "../../utils/form/ha-form";
import { loadHaComponents } from "../../utils/loader";
import { TEMPLATE_CARD_EDITOR_NAME } from "./const";
import { TemplateCardConfig, templateCardConfigStruct } from "./template-card-config";

export const TEMPLATE_FIELDS = ["content", "primary", "secondary", "multiline_secondary"];

const SCHEMA: HaFormSchema[] = [
    { name: "entity", selector: { entity: {} } },
    { name: "icon", selector: { text: { multiline: true } } },
    { name: "icon_color", selector: { text: { multiline: true } } },
    { name: "primary", selector: { text: { multiline: true } } },
    { name: "secondary", selector: { text: { multiline: true } } },
    {
        type: "grid",
        name: "",
        schema: [
            { name: "layout", selector: { "mush-layout": {} } },
            { name: "multiline_secondary", selector: { boolean: {} } },
        ],
    },
    { name: "tap_action", selector: { "mush-action": {} } },
    { name: "hold_action", selector: { "mush-action": {} } },
    { name: "double_tap_action", selector: { "mush-action": {} } },
];

@customElement(TEMPLATE_CARD_EDITOR_NAME)
export class TemplateCardEditor extends LitElement implements LovelaceCardEditor {
    @property({ attribute: false }) public hass?: HomeAssistant;

    @state() private _config?: TemplateCardConfig;

    connectedCallback() {
        super.connectedCallback();
        void loadHaComponents();
    }

    public setConfig(config: TemplateCardConfig): void {
        assert(config, templateCardConfigStruct);
        this._config = config;
    }

    private _computeLabelCallback = (schema: HaFormSchema) => {
        const customLocalize = setupCustomlocalize(this.hass!);

        if (schema.name === "entity") {
            return `${this.hass!.localize(
                "ui.panel.lovelace.editor.card.generic.entity"
            )} (${customLocalize("editor.card.template.entity_extra")})`;
        }
        if (GENERIC_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.generic.${schema.name}`);
        }
        if (TEMPLATE_FIELDS.includes(schema.name)) {
            return customLocalize(`editor.card.template.${schema.name}`);
        }
        return this.hass!.localize(`ui.panel.lovelace.editor.card.generic.${schema.name}`);
    };

    protected render(): TemplateResult {
        if (!this.hass || !this._config) {
            return html``;
        }

        return html`
            <ha-form
                .hass=${this.hass}
                .data=${this._config}
                .schema=${SCHEMA}
                .computeLabel=${this._computeLabelCallback}
                @value-changed=${this._valueChanged}
            ></ha-form>
        `;
    }

    private _valueChanged(ev: CustomEvent): void {
        fireEvent(this, "config-changed", { config: ev.detail.value });
    }

    static get styles(): CSSResultGroup {
        return configElementStyle;
    }
}
