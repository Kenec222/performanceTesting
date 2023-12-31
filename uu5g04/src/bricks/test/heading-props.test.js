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
//@@viewOff:imports

const { mount, shallow, wait } = UU5.Test.Tools;

const MyHeadingHandler = UU5.Common.VisualComponent.create({
  getInitialState: () => {
    return {
      isCalled: false,
    };
  },

  onScrollToFixedHandler(event) {
    alert("onScrollToFixed was called!");
    this.setState({ isCalled: true });
  },

  onScrollToBlockedHandler(event) {
    alert("onScrollToBlocked was called!");
    this.setState({ isCalled: true });
  },

  render() {
    return (
      <UU5.Bricks.Heading
        content="Bricks.Heading"
        style={{
          padding: "10px",
          backgroundColor: "cornflowerblue",
        }}
        fixedOnScroll={true}
        onScrollToFixed={this.onScrollToFixedHandler}
        onScrollToBlocked={this.onScrollToBlockedHandler}
      />
    );
  },
});

const CONFIG = {
  mixins: [
    "UU5.Common.BaseMixin",
    "UU5.Common.ElementaryMixin",
    "UU5.Common.ContentMixin",
    "UU5.Common.NestingLevelMixin",
    "UU5.Common.PureRenderMixin",
  ],
  props: {
    fixed: {
      values: [true, false],
    },
    fixedOnScroll: {
      values: [true, false],
    },
    hideOnScroll: {
      values: [true, false],
    },
    spaceHolder: {
      values: [true, false],
    },
    //onScrollToFixed:{},
    //onScrollToBlocked:{},
  },
  requiredProps: {},
  opt: {
    shallowOpt: {
      disableLifecycleMethods: false,
    },
  },
};

describe(`UU5.Bricks.Heading`, () => {
  UU5.Test.Tools.testProperties(UU5.Bricks.Heading, CONFIG);
});

describe(`UU5.Bricks.Heading`, () => {
  it(`UU5.Bricks.Heading - onScrollToFixed()`, () => {
    window.alert = jest.fn();
    const wrapper = shallow(<MyHeadingHandler />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state().isCalled).toBeFalsy();
    wrapper.simulate("scrollToFixed");
    expect(window.alert).toBeCalled();
    expect(window.alert).toHaveBeenCalledWith("onScrollToFixed was called!");
    expect(wrapper.state().isCalled).toBeTruthy();
    expect(window.alert.mock.calls[0][0]).toEqual("onScrollToFixed was called!");
    expect(wrapper).toMatchSnapshot();
  });

  it(`UU5.Bricks.Heading - onScrollToBlocked()`, () => {
    window.alert = jest.fn();
    const wrapper = shallow(<MyHeadingHandler />);
    expect(wrapper).toMatchSnapshot();
    expect(wrapper.state().isCalled).toBeFalsy();
    wrapper.simulate("scrollToBlocked");
    expect(window.alert).toBeCalled();
    expect(window.alert).toHaveBeenCalledWith("onScrollToBlocked was called!");
    expect(wrapper.state().isCalled).toBeTruthy();
    expect(window.alert.mock.calls[0][0]).toEqual("onScrollToBlocked was called!");
    expect(wrapper).toMatchSnapshot();
  });
});

describe(`UU5.Bricks.Heading docKit examples`, () => {
  it(`UU5.Bricks.Heading example01`, () => {
    const wrapper = shallow(
      <UU5.Bricks.Container id={"uuID01"}>
        <UU5.Bricks.Heading
          id={"uuID"}
          content="Fixed"
          fixed
          style={{
            padding: "10px",
            backgroundColor: "cornflowerblue",
          }}
        />

        <UU5.Bricks.Paragraph id={"uuID02"} />
      </UU5.Bricks.Container>
    );
    expect(wrapper).toMatchSnapshot();
  });
});
