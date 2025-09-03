// package.json
var name = "anywidget";
var version = "0.9.0";

// src/widget.js
function is_href(str) {
  return str.startsWith("http://") || str.startsWith("https://");
}
async function load_css_href(href, anywidget_id) {
  let prev = document.querySelector(`link[id='${anywidget_id}']`);
  if (prev) {
    let newLink = (
      /** @type {HTMLLinkElement} */
      prev.cloneNode()
    );
    newLink.href = href;
    newLink.addEventListener("load", () => prev?.remove());
    newLink.addEventListener("error", () => prev?.remove());
    prev.after(newLink);
    return;
  }
  return new Promise((resolve) => {
    let link = Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href,
      onload: resolve
    });
    document.head.appendChild(link);
  });
}
function load_css_text(css_text, anywidget_id) {
  let prev = document.querySelector(`style[id='${anywidget_id}']`);
  if (prev) {
    prev.textContent = css_text;
    return;
  }
  let style = Object.assign(document.createElement("style"), {
    id: anywidget_id,
    type: "text/css"
  });
  style.appendChild(document.createTextNode(css_text));
  document.head.appendChild(style);
}
async function load_css(css, anywidget_id) {
  if (!css)
    return;
  if (is_href(css))
    return load_css_href(css, anywidget_id);
  return load_css_text(css, anywidget_id);
}
async function load_esm(esm) {
  if (is_href(esm)) {
    return import(
      /* webpackIgnore: true */
      esm
    );
  }
  let url = URL.createObjectURL(new Blob([esm], { type: "text/javascript" }));
  let widget;
  try {
    widget = await import(
      /* webpackIgnore: true */
      url
    );
  } catch (e) {
    console.log(e);
    throw e;
  }
  URL.revokeObjectURL(url);
  return widget;
}
function warn_render_deprecation() {
  console.warn(`[anywidget] Deprecation Warning. Direct export of a 'render' will likely be deprecated in the future. To migrate ...

Remove the 'export' keyword from 'render'
-----------------------------------------

export function render({ model, el }) { ... }
^^^^^^

Create a default export that returns an object with 'render'
------------------------------------------------------------

function render({ model, el }) { ... }
         ^^^^^^
export default { render }
                 ^^^^^^

To learn more, please see: https://github.com/manzt/anywidget/pull/395
`);
}
async function load_widget(esm) {
  let mod = await load_esm(esm);
  if (mod.render) {
    warn_render_deprecation();
    return {
      async initialize() {
      },
      render: mod.render
    };
  }
  if (!mod.default) {
    throw new Error(
      `[anywidget] module must export a default function or object.`
    );
  }
  let widget = typeof mod.default === "function" ? await mod.default() : mod.default;
  return widget;
}
var initialize_marker = Symbol("anywidget.initialize");
async function run_initialize(widget, model) {
  let cleanup = await widget.initialize?.({
    model: model_proxy(model, initialize_marker)
  });
  return async () => {
    try {
      await cleanup?.();
    } catch (e) {
      console.warn("[anywidget] error cleaning up initialize.", e);
    }
    model.off(null, null, initialize_marker);
  };
}
async function run_render(widget, view) {
  let cleanup = await widget.render?.({
    model: model_proxy(view.model, view),
    el: view.el
  });
  return async () => {
    try {
      await cleanup?.();
    } catch (e) {
      console.warn("[anywidget] error cleaning up render.", e);
    }
    view.model.off(null, null, view);
    view.$el.empty();
  };
}
function model_proxy(model, context) {
  return {
    get: model.get.bind(model),
    set: model.set.bind(model),
    save_changes: model.save_changes.bind(model),
    send: model.send.bind(model),
    // @ts-expect-error
    on(name2, callback) {
      model.on(name2, callback, context);
    },
    off(name2, callback) {
      model.off(name2, callback, context);
    },
    widget_manager: model.widget_manager
  };
}
function widget_default({ DOMWidgetModel, DOMWidgetView }) {
  class AnyModel extends DOMWidgetModel {
    static model_name = "AnyModel";
    static model_module = name;
    static model_module_version = version;
    static view_name = "AnyView";
    static view_module = name;
    static view_module_version = version;
    /** @param {Parameters<InstanceType<DOMWidgetModel>["initialize"]>} args */
    initialize(...args) {
      super.initialize(...args);
      this.on("change:_css", () => {
        let id = this.get("_anywidget_id");
        if (!id)
          return;
        console.debug(`[anywidget] css hot updated: ${id}`);
        load_css(this.get("_css"), id);
      });
      this.on("change:_esm", async () => {
        let id = this.get("_anywidget_id");
        if (!id)
          return;
        console.debug(`[anywidget] esm hot updated: ${id}`);
        this._widget_promise = load_widget(this.get("_esm"));
        let widget = await this._widget_promise;
        await this._anywidget_initialize_cleanup();
        this._anywidget_initialize_cleanup = await run_initialize(widget, this);
        let views = (
          /** @type {unknown} */
          Object.values(this.views ?? {})
        );
        for await (
          let view of
          /** @type {Promise<AnyView>[]} */
          views
        ) {
          await view._anywidget_render_cleanup();
          view._anywidget_render_cleanup = await run_render(widget, view);
        }
      });
      this._widget_promise = load_widget(this.get("_esm")).then(async (widget) => {
        this._anywidget_initialize_cleanup = await run_initialize(
          widget,
          this
        );
        return widget;
      });
    }
    /** @type {() => Promise<void>} */
    async _anywidget_initialize_cleanup() {
    }
    /**
     * @param {Record<string, any>} state
     *
     * We override to support binary trailets because JSON.parse(JSON.stringify())
     * does not properly clone binary data (it just returns an empty object).
     *
     * https://github.com/jupyter-widgets/ipywidgets/blob/47058a373d2c2b3acf101677b2745e14b76dd74b/packages/base/src/widget.ts#L562-L583
     */
    serialize(state) {
      let serializers = (
        /** @type {DOMWidgetModel} */
        this.constructor.serializers || {}
      );
      for (let k of Object.keys(state)) {
        try {
          let serialize = serializers[k]?.serialize;
          if (serialize) {
            state[k] = serialize(state[k], this);
          } else if (k === "layout" || k === "style") {
            state[k] = JSON.parse(JSON.stringify(state[k]));
          } else {
            state[k] = structuredClone(state[k]);
          }
          if (typeof state[k]?.toJSON === "function") {
            state[k] = state[k].toJSON();
          }
        } catch (e) {
          console.error("Error serializing widget state attribute: ", k);
          throw e;
        }
      }
      return state;
    }
  }
  class AnyView extends DOMWidgetView {
    async render() {
      await load_css(this.model.get("_css"), this.model.get("_anywidget_id"));
      let model = (
        /** @type {AnyModel} */
        this.model
      );
      let widget = await model._widget_promise;
      if (!widget) {
        console.warn("[anywidget] widget not loaded.");
        return;
      }
      this._anywidget_render_cleanup = await run_render(widget, this);
    }
    /** @type {() => Promise<void>} */
    async _anywidget_render_cleanup() {
    }
    async remove() {
      await this._anywidget_render_cleanup();
      return super.remove();
    }
  }
  return { AnyModel, AnyView };
}

// src/index.js
define(["@jupyter-widgets/base"], widget_default);
