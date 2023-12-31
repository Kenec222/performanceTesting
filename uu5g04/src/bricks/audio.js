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
import ns from "./bricks-ns.js";

import "./audio.less";
//@@viewOff:imports

export const Audio = UU5.Common.VisualComponent.create({
  displayName: "Audio", // for backward compatibility (test snapshots)
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin, UU5.Common.PureRenderMixin, UU5.Common.ElementaryMixin, UU5.Common.NestingLevelMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: ns.name("Audio"),
    nestingLevelList: UU5.Environment.getNestingLevelList("bigBox", "box"),
    classNames: {
      main: ns.css("audio"),
      player: ns.css("audio-player"),
      wrapper: ns.css("audio-wrapper"),
    },
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    autoPlay: UU5.PropTypes.bool,
    loop: UU5.PropTypes.bool,
    preload: UU5.PropTypes.oneOf(["auto", "metadata", "none"]),
    src: UU5.PropTypes.string.isRequired,
    muted: UU5.PropTypes.bool,
    playbackRate: UU5.PropTypes.number,
    authenticate: UU5.PropTypes.bool,
    onStart: UU5.PropTypes.func,
    onPause: UU5.PropTypes.func,
    onEnded: UU5.PropTypes.func,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    return {
      autoPlay: false,
      loop: false,
      preload: "auto",
      src: undefined,
      muted: false,
      playbackRate: 1.0,
      authenticate: false,
      onStart: undefined,
      onPause: undefined,
      onEnded: undefined,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    return {
      muted: this.props.muted,
      playbackRate: this.props.playbackRate,
      authenticatedUrl: undefined,
    };
  },

  componentDidMount() {
    if (this.state.playbackRate !== 1.0 && this._audio) {
      this._audio.playbackRate = this.state.playbackRate;
    }
  },

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.controlled) {
      this.setState({ muted: nextProps.muted, playbackRate: nextProps.playbackRate });
    }
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.props.src !== prevProps.src) {
      this._reload();
    }

    if (this.state.playbackRate !== prevState.playbackRate && this._audio) {
      this._audio.playbackRate = this.state.playbackRate;
    }
  },
  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  toggleMuted() {
    this.setState((state) => ({ muted: !state.muted }));
    return this;
  },

  play() {
    this._audio.play();
    return this;
  },

  pause() {
    this._audio.pause();
    return this;
  },

  setPlaySpeed(speed) {
    this.setState({ playbackRate: speed });
    return this;
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  //@@viewOff:overriding

  //@@viewOn:private
  _onPlay(e) {
    if (typeof this.props.onPlay === "function") {
      this.props.onPlay({ component: this, event: e });
    }
  },

  _onPause(e) {
    if (typeof this.props.onPause === "function") {
      this.props.onPause({ component: this, event: e });
    }
  },

  _onEnded(e) {
    if (typeof this.props.onEnded === "function") {
      this.props.onEnded({ component: this, event: e });
    }
  },

  _reload() {
    this._audio.load();
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

  _getMainAttrs(removeMainClass) {
    let attrs = this.getMainAttrs();
    attrs.className += " " + this.getClassName("player");
    attrs.ref = (ref) => (this._audio = ref);
    attrs.controls = true;

    // events
    attrs.onPlay = this._onPlay;
    attrs.onPause = this._onPause;
    attrs.onEnded = this._onEnded;

    if (removeMainClass) attrs.className = attrs.className.replace(this.getClassName("main"), "").trim();
    if (this.props.autoPlay && !this.isDisabled()) attrs.autoPlay = true;
    if (this.state.muted) attrs.muted = true;
    if (this.props.loop) attrs.loop = true;
    if (this.props.preload !== "auto") attrs.preload = this.props.preload;

    return attrs;
  },

  _getWrapperAttrs() {
    let attrs = this.getMainAttrs();

    attrs.className += " " + this.getClassName("wrapper");

    return attrs;
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    let result = null;
    let url = this.props.src;
    if (this.props.authenticate) {
      let session = UU5.Environment.getSession();
      if (session && session.isAuthenticated() && UU5.Environment.isTrustedDomain(url)) {
        url = this._getAuthenticatedUrl(url, session);
      }
    }

    if (this.getNestingLevel()) {
      if (this.isDisabled()) {
        result = (
          <span {...this._getWrapperAttrs()}>
            {this.getDisabledCover()}
            <audio {...this._getMainAttrs(true)}>
              <source src={url} />
            </audio>
          </span>
        );
      } else {
        result = (
          <audio {...this._getMainAttrs()} key={url}>
            <source src={url} />
          </audio>
        );
      }
    }

    return result;
  },
  //@@viewOff:render
});

export default Audio;
