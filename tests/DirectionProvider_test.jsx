/**
 * @jest-environment jsdom
 */

 // We must set the env to jsdom for this file to accommodate mounted components.
 // The components must be mounted because there is currently no way to test
 // code within componentDidUpdate lifecycle in shallow mounting.
 // https://github.com/airbnb/enzyme/issues/1452

import React from 'react';
import { expect } from 'chai';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon-sandbox';

import DirectionProvider from '../src/DirectionProvider';
import { DIRECTIONS } from '../src/constants';

describe('<DirectionProvider>', () => {
  let children;
  beforeEach(() => {
    children = <div>Foo</div>;
  });

  it('renders its children', () => {
    const wrapper = shallow(
      <DirectionProvider direction={DIRECTIONS.RTL}>{children}</DirectionProvider>,
    );
    expect(wrapper.contains(children)).to.eq(true);
  });

  it('renders a wrapping div with a dir attribute', () => {
    const direction = DIRECTIONS.RTL;
    const wrapper = shallow(
      <DirectionProvider direction={direction}>{children}</DirectionProvider>,
    );
    expect(wrapper).to.have.type('div');
    expect(wrapper).to.have.prop('dir', direction);
  });

  it('renders a wrapping span when the inline prop is true', () => {
    const direction = DIRECTIONS.RTL;
    const wrapper = shallow(
      <DirectionProvider direction={direction} inline>{children}</DirectionProvider>,
    );
    expect(wrapper).to.have.type('span');
    expect(wrapper).to.have.prop('dir', direction);
  });

  it('renders a lang attribute when the lang prop is set', () => {
    const direction = DIRECTIONS.RTL;
    const wrapper = shallow(
      <DirectionProvider direction={direction} lang="ar">{children}</DirectionProvider>,
    );
    expect(wrapper).to.have.prop('lang', 'ar');
  });

  it('broadcasts the direction when the direction prop changes', () => {
    const direction = DIRECTIONS.LTR;
    const nextDirection = DIRECTIONS.RTL;
    const wrapper = mount(
      <DirectionProvider direction={direction}>{children}</DirectionProvider>,
    );
    const broadcast = wrapper.instance().broadcast;
    const broadcastSpy = sinon.spy(broadcast, 'setState');
    wrapper.setProps({ direction: nextDirection });
    expect(broadcastSpy).to.have.callCount(1);
  });

  it('does not broadcast the direction when the direction prop stays the same', () => {
    const direction = DIRECTIONS.LTR;
    const nextDirection = DIRECTIONS.LTR;
    const wrapper = mount(
      <DirectionProvider direction={direction}>{children}</DirectionProvider>,
    );
    const broadcast = wrapper.instance().broadcast;
    const broadcastSpy = sinon.spy(broadcast, 'setState');
    wrapper.setProps({ direction: nextDirection });
    expect(broadcastSpy).to.have.callCount(0);
  });
});
