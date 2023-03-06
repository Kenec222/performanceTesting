/**
 * Copyright (C) 2021 Unicorn a.s.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License at
 * <https://gnu.org/licenses/> for more details.
 *
 * You may obtain additional information at <https://unicorn.com> or contact Unicorn a.s. at address: V Kapslovne 2767/2,
 * Praha 3, Czech Republic or at the email: info@unicorn.com.
 */

//@@viewOn:imports
import * as UU5 from "uu5g04";
import { useRoute } from "uu5g05";
import ns from "./bricks-ns.js";
import Css from "./internal/css.js";

import "./link.less";
//@@viewOff:imports

function getFileName(contentDisposition) {
  let regex = /filename[^;=\n]*=(?:(\\?['"])(.*?)\1|(?:[^\s]+'.*?')?([^;\n]*))/g;
  let match;
  let results = [];
  while ((match = regex.exec(contentDisposition)) != null) {
    results = results.concat(match.slice(1).filter((m) => m));
  }

  let last = results[results.length - 1];

  return last ? decodeURIComponent(last) : null;
}

async function downloadFile(url, session, fileName, onDownloadStart, onDownloadEnd) {
  let headers;
  if (session && session.isAuthenticated() && UU5.Environment.isTrustedDomain(url)) {
    headers = (await UU5.Common.Tools.getAuthenticatedHeaders(url, session)) || {};
    for (var k in headers) if (headers[k] == null) delete headers[k];
  }
  onDownloadStart();
  let response = await fetch(url, { headers });
  let blob = await response.blob();
  let contentDisposition;
  try {
    contentDisposition = response.headers.get("content-disposition");
    // eslint-disable-next-line no-empty
  } catch (e) {}
  fileName = fileName || (contentDisposition && getFileName(contentDisposition)) || "blob";
  let fileBlob = new Blob([blob], { type: "application/octet-stream" });
  // save blob in IE and Edge - standard click on a link doesn't work in this browsers
  if (typeof navigator.msSaveBlob === "function") {
    navigator.msSaveBlob(fileBlob, fileName);
    return;
  }
  let fileUrl = window.URL.createObjectURL(fileBlob);
  // to set name for the file we need to create link element and set name into download attribute
  let link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName;
  link.style = "display: none;";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  onDownloadEnd();
  setTimeout(() => {
    window.URL.revokeObjectURL(fileUrl);
  }, 60000);
}

let downloadAnimationKeyframes = Css.keyframes({
  "0%": {
    left: 0,
  },
  "50%": {
    left: "66%",
  },
  "100%": {
    left: 0,
  },
});

const _Link = UU5.Common.VisualComponent.create({
  displayName: "Link", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [
    UU5.Common.BaseMixin,
    UU5.Common.PureRenderMixin,
    UU5.Common.ElementaryMixin,
    UU5.Common.NestingLevelMixin,
    UU5.Common.ContentMixin,
    UU5.Common.ColorSchemaMixin,
  ],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Link"),
    nestingLevelList: UU5.Environment.getNestingLevelList("bigBoxCollection", "inline"),
    classNames: {
      main: (props, state) => {
        let className = [ns.css("link")];
        if (state.downloadId) {
          className.push(
            Css.css({
              position: "relative",
              cursor: "default",
              "&:hover": {
                textDecoration: "none",
              },
              "&::before": {
                content: '" "',
                position: "absolute",
                left: 0,
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.6) 80%, rgba(255, 255, 255, 0) 100%)",
                animation: `${downloadAnimationKeyframes} 1.5s infinite`,
              },
            })
          );
        }
        return className.join(" ");
      },
    },
    defaults: {
      content: "noText",
      regexpHash: /^#/,
      httpRegexp: /^(\/|[a-z0-9\-+.]+:)/,
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    href: UU5.PropTypes.string,
    onClick: UU5.PropTypes.func,
    onCtrlClick: UU5.PropTypes.func,
    onWheelClick: UU5.PropTypes.func,
    smoothScroll: UU5.PropTypes.number,
    offset: UU5.PropTypes.number,
    target: UU5.PropTypes.oneOf(["_blank", "_parent", "_top", "_self"]),
    download: UU5.PropTypes.oneOfType([UU5.PropTypes.bool, UU5.PropTypes.string]),
    authenticate: UU5.PropTypes.bool,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      href: null,
      onClick: null,
      onCtrlClick: null,
      onWheelClick: null,
      smoothScroll: 1000,
      offset: 0,
      target: "_self",
      download: false,
      authenticate: undefined,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    return {
      authenticatedUrl: undefined,
      downloadId: undefined,
    };
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  focus() {
    this._link && this._link.focus();
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _isFragmentLink() {
    return this.props.href && this.props.href.length > 1 && this.props.href.lastIndexOf("#", 0) === 0;
  },

  _onClickFragment(e) {
    e.preventDefault();
    //let basePath = location.href.replace(/#.*/, "");

    let id = this.props.href.replace("#", "");
    let foundElement = document.getElementById(id);

    if (!foundElement) {
      id = id.replace("-inner", "");
      foundElement = document.getElementById(id);
    }

    //let path = basePath + "#" + id;
    //history.pushState(null, document.title, path);
    UU5.Common.Tools.scrollToTarget(id, this.props.smoothScroll, this.props.offset);
    this._onClick(e);
    return this;
  },

  _shouldOnWheelClick() {
    return typeof this.props.onWheelClick === "function";
  },

  _shouldOnClick() {
    return (
      typeof this.props.onClick === "function" ||
      typeof this.props.onCtrlClick === "function" ||
      this._isFragmentLink() ||
      this._isRoute() ||
      (this.props.authenticate && this.props.download)
    );
  },

  _onWheelClick(e) {
    typeof this.props.onWheelClick === "function" && this.props.onWheelClick(this, e);
    return this;
  },

  _onCtrlClick(e) {
    typeof this.props.onCtrlClick === "function" && this.props.onCtrlClick(this, e);
    return this;
  },

  _openRouteNewTab() {
    UU5.Common.Tools.openWindow(this._getRouteUrl(), "_blank");
  },

  _onClick(e) {
    if (this._isRoute() && (UU5.Environment.getRouter() || this.props._g05SetRoute)) {
      let [base, ...fragmentParts] = this.props.href.split("#");
      let [path, ...queryParts] = base.split("?");
      let fragment = fragmentParts.join("#");
      let query = queryParts.join("?");
      let params = query ? UU5.Common.Url.decodeQuery("?" + query) : null;

      e.preventDefault();
      if (this.props.target === "_blank") {
        this._openRouteNewTab();
      } else {
        let useCase = path || UU5.Common.Url.parse(location.href).useCase || "";
        let g04Router = UU5.Environment.getRouter();
        if (g04Router) g04Router.setRoute(useCase, params, fragment);
        else this.props._g05SetRoute(useCase, params, fragment);
      }
    }
    typeof this.props.onClick === "function" && this.props.onClick(this, e);
    return this;
  },

  _containsHash(url) {
    return this.getDefault("regexpHash").test(url);
  },

  _isRoute() {
    return (
      this.props.href && !this.getDefault("httpRegexp").test(this.props.href) && !this._containsHash(this.props.href)
    );
  },

  _getRouteUrl() {
    let { href } = this.props;
    let basePath = UU5.Environment.getAppBasePath();
    let usedHref = href.charAt(0) === "?" ? (UU5.Common.Url.parse(location.href).useCase || "") + href : href;
    return basePath ? basePath.replace(/\/*$/, "/") + usedHref.replace(/^\/+/, "") : usedHref;
  },

  _getHref() {
    let href = UU5.Common.Url.getAbsoluteUri(this.props.href);

    if (this.props.authenticate) {
      let session = UU5.Environment.getSession();
      if (session && session.isAuthenticated() && UU5.Environment.isTrustedDomain(href)) {
        href = this._getAuthenticatedUrl(href, session);
      }
    }

    return href;
  },

  _getAuthenticatedUrl(url, session) {
    let result = "";
    if (this._authenticatedUrl === url) result = this.state.authenticatedUrl;
    else if (this._authenticatingUrl !== url) {
      this._authenticatingUrl = url;
      let promise = (this._urlPromise = UU5.Common.Tools.getAuthenticatedUrl(url, session).then(
        (authenticatedUrl) => {
          delete this._authenticatingUrl;
          this._authenticatedUrl = url;
          if (this.isRendered() && promise === this._urlPromise) this.setState({ authenticatedUrl });
        },
        () => {
          delete this._authenticatingUrl;
        }
      ));
    }
    return result;
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    let mainAttrs = this.getMainAttrs();

    if (!this.isDisabled()) {
      if (!this.props.authenticate || !this.props.download) {
        mainAttrs.href = this._getHref();
      }

      if (this._shouldOnClick() || this._shouldOnWheelClick()) {
        mainAttrs.onClick = (e) => {
          if (e.ctrlKey || (UU5.Common.Tools.isMac() && e.metaKey)) {
            this._onCtrlClick(e);
          } else {
            if (this._isFragmentLink()) {
              this._onClickFragment(e);
            } else if (e.button !== 1) {
              this._onClick(e);
            }
          }

          if (this.props.authenticate && this.props.download && !this.state.downloadId) {
            downloadFile(
              this.props.href,
              UU5.Environment.getSession(),
              typeof this.props.download === "string" ? this.props.download : undefined,
              () => this.setState({ downloadId: UU5.Common.Tools.generateUUID() }),
              () => this.setState({ downloadId: undefined })
            );
          }
        };

        if (this._shouldOnWheelClick()) {
          let onMouseDown = mainAttrs.onMouseDown;
          mainAttrs.onMouseDown = (e) => {
            e.button === 1 && e.preventDefault();
            typeof onMouseDown === "function" && onMouseDown(e, this);
          };

          let onWheelClickDefaultPrevented = false;
          let onMouseUp = mainAttrs.onMouseUp;
          mainAttrs.onMouseUp = (e) => {
            onWheelClickDefaultPrevented = false;
            if (e.button === 1) {
              this._onWheelClick(e);
              if (e.defaultPrevented) onWheelClickDefaultPrevented = true;
              e.preventDefault();

              // stop pending "click" event because e.preventDefault() doesn't stop it in FF
              let clickHandler = (e) => {
                e.stopPropagation();
                document.removeEventListener("click", clickHandler, true);
              };
              document.addEventListener("click", clickHandler, true);
              setTimeout(() => document.removeEventListener("click", clickHandler, true), 0);
            }
            typeof onMouseUp === "function" && onMouseUp(e, this);
          };

          // to prevent opening of window we need to prevent onAuxClick that happens after onMouseUp
          let onAuxClick = mainAttrs.onAuxClick;
          mainAttrs.onAuxClick = (e) => {
            if (onWheelClickDefaultPrevented) e.preventDefault();
            onWheelClickDefaultPrevented = false;
            if (typeof onAuxClick === "function") onAuxClick(e, this);
          };
        }
      }
      mainAttrs.target = this.props.target;
      mainAttrs.download = this.props.download;
      if (mainAttrs.target === "_blank") mainAttrs.rel ||= "noopener";
    }

    let children = this.getChildren();
    children = children == null ? this.props.href || this.getDefault().content : children;

    return this.getNestingLevel() ? (
      <a {...mainAttrs} ref={(link) => (this._link = link)}>
        {children}
      </a>
    ) : null;
  },
  //@@viewOff:render
});

export const Link = (props) => {
  const [, g05SetRoute] = useRoute();
  return <_Link {...props} _g05SetRoute={g05SetRoute} />;
};

Link.isUu5PureComponent = true;
Link.displayName = _Link.displayName;
Link.tagName = _Link.tagName;

export const A = Link;

export default Link;
