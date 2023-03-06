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
import UU5 from "uu5g04";
import "uu5g04-bricks";
import { mount, shallow, omitConsoleLogs } from "uu5g05-test";
//@@viewOff:imports

const MyNavBarNavItemHandler = UU5.Common.VisualComponent.create({
  getInitialState: () => {
    return {
      isCalled: false,
    };
  },

  onClickAlert(event) {
    alert("You have been clicked to NavBar.Nav.Item");
    this.setState({ isCalled: true });
  },

  render() {
    return (
      <UU5.Bricks.NavBar colorSchema="primary">
        <UU5.Bricks.NavBar.Nav>
          <UU5.Bricks.NavBar.Nav.Item onClick={this.onClickAlert}>onClick</UU5.Bricks.NavBar.Nav.Item>
        </UU5.Bricks.NavBar.Nav>
      </UU5.Bricks.NavBar>
    );
  },
});

const CONFIG = {
  mixins: [
    "UU5.Common.BaseMixin",
    "UU5.Common.ElementaryMixin",
    "UU5.Common.ContentMixin",
    "UU5.Common.PureRenderMixin",
  ],
  props: {
    target: {
      values: ["_blank", "_parent", "_top", "_self"],
    },
    href: {
      values: [
        "https://unicorn.com/",
        "www.unicorn.com",
        "#about",
        "mailto:me@example.com",
        "ftp://example.com/folder",
      ],
    },
  },
  requiredProps: {
    parent: shallow(
      <UU5.Bricks.NavBar.Nav id="parentId" parent={shallow(<UU5.Bricks.NavBar id="parentId2" />).instance()} />
    ).instance(),
  },
  opt: {
    shallowOpt: {
      disableLifecycleMethods: true,
    },
  },
};

describe(`UU5.Bricks.NavBar.Nav.Item props`, () => {
  UU5.Test.Tools.testProperties(UU5.Bricks.NavBar.Nav.Item, CONFIG);
});

describe(`UU5.Bricks.NavBar.Nav.Item props.Function`, () => {
  it(`UU5.Bricks.NavBar.Nav.Item -  onClick() should be called`, () => {
    window.alert = jest.fn();
    const wrapper = shallow(<MyNavBarNavItemHandler />);
    expect(wrapper.state().isCalled).toBeFalsy();
    wrapper.find("nav-bar-nav-item").simulate("click");
    expect(window.alert).toBeCalled();
    expect(window.alert).toHaveBeenCalledWith("You have been clicked to NavBar.Nav.Item");
    expect(wrapper.state().isCalled).toBeTruthy();
    expect(window.alert.mock.calls[0][0]).toEqual("You have been clicked to NavBar.Nav.Item");
    expect(wrapper).toMatchSnapshot();
  });
});

describe(`UU5.Bricks.NavBar.Nav.Item Mixin Props control values of props`, () => {
  it("Make snapshot with shallow", () => {
    const wrapper = shallow(
      <UU5.Bricks.NavBar colorSchema="primary" id={"uuID01"}>
        <UU5.Bricks.NavBar.Nav id={"uuID02"}>
          <UU5.Bricks.NavBar.Nav.Item
            id={"uuID03"}
            name={"Item name"}
            tooltip={"Item tooltip"}
            className="Item className"
            style={{ fontSize: "20px", color: "red" }}
            mainAttrs={{ style: { backgroundColor: "black" } }}
          >
            <UU5.Bricks.Icon id={"uuID04"} icon="mdi-home" />
            Home
          </UU5.Bricks.NavBar.Nav.Item>
        </UU5.Bricks.NavBar.Nav>
      </UU5.Bricks.NavBar>
    );
    expect(wrapper).toMatchSnapshot();
  });

  it(`UU5.Bricks.NavBar.Nav.Item BaseMixinProps`, () => {
    const wrapper = mount(
      <UU5.Bricks.NavBar colorSchema="primary" id={"uuID01"}>
        <UU5.Bricks.NavBar.Nav id={"uuID02"}>
          <UU5.Bricks.NavBar.Nav.Item
            id={"uuID03"}
            name={"Item name"}
            tooltip={"Item tooltip"}
            className="Item className"
            style={{ fontSize: "20px", color: "red" }}
            mainAttrs={{ style: { backgroundColor: "black" } }}
          >
            <UU5.Bricks.Icon id={"uuID04"} icon="mdi-home" />
            Home
          </UU5.Bricks.NavBar.Nav.Item>
        </UU5.Bricks.NavBar.Nav>
      </UU5.Bricks.NavBar>
    );
    expect(wrapper.find("nav-bar-nav-item").instance().props.id).toEqual("uuID03");
    expect(wrapper.find("nav-bar-nav-item").instance().props.name).toEqual("Item name");
    expect(wrapper.find("nav-bar-nav-item").instance().props.tooltip).toEqual("Item tooltip");
    expect(wrapper.find("nav-bar-nav-item").instance().props.className).toEqual("Item className");
    expect(wrapper.find("nav-bar-nav-item").instance().props.style).toEqual(
      expect.objectContaining({
        fontSize: "20px",
        color: "red",
      })
    );
    expect(wrapper.find("nav-bar-nav-item").instance().props.mainAttrs).toEqual(
      expect.objectContaining({ style: { backgroundColor: "black" } })
    );
  });

  it(`UU5.Bricks.NavBar.Nav.Item Elementary Mixin Props`, () => {
    const wrapper = mount(
      <UU5.Bricks.NavBar colorSchema="primary" id={"uuID01"}>
        <UU5.Bricks.NavBar.Nav id={"uuID02"}>
          <UU5.Bricks.NavBar.Nav.Item id={"uuID03"} hidden={true} disabled={true} selected={true} controlled={false}>
            <UU5.Bricks.Icon id={"uuID04"} icon="mdi-home" />
            Home
          </UU5.Bricks.NavBar.Nav.Item>
        </UU5.Bricks.NavBar.Nav>
      </UU5.Bricks.NavBar>
    );
    expect(wrapper.find("nav-bar-nav-item").instance().props.hidden).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.disabled).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.selected).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.controlled).toBeFalsy();
  });

  it(`UU5.Bricks.NavBar.Nav.Item Content And PureRender Mixins props`, () => {
    omitConsoleLogs("deprecated");
    const wrapper = mount(
      <UU5.Bricks.NavBar colorSchema="primary" id={"uuID01"}>
        <UU5.Bricks.NavBar.Nav id={"uuID02"}>
          <UU5.Bricks.NavBar.Nav.Item
            id={"uuID03"}
            content={"Text of content from mixin"}
            ignoreInnerHTML={true}
            checkSpaces={true}
            checkGrammar={true}
            checkHighlight={true}
            textCorrector={true}
            dynamic={true}
            mode={"outline"}
            pureRender={true}
          >
            <UU5.Bricks.Icon id={"uuID04"} icon="mdi-home" />
            Home
          </UU5.Bricks.NavBar.Nav.Item>
        </UU5.Bricks.NavBar.Nav>
      </UU5.Bricks.NavBar>
    );
    expect(wrapper.find("nav-bar-nav-item").instance().props.content).toEqual("Text of content from mixin");
    expect(wrapper.find("nav-bar-nav-item").instance().props.ignoreInnerHTML).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.checkSpaces).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.checkGrammar).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.checkHighlight).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.textCorrector).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.dynamic).toBeTruthy();
    expect(wrapper.find("nav-bar-nav-item").instance().props.mode).toEqual("outline");
    expect(wrapper.find("nav-bar-nav-item").instance().props.pureRender).toBeTruthy();
  });
});
