import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import sinon from 'sinon-sandbox';

import { CHANNEL, DIRECTIONS, defaultDirection } from '../src/constants';
import DirectionProvider from '../src/DirectionProvider';
import mockBrcast from './mocks/brcast_mock';

function getWrapper(props, context) {
  return shallow(
    (
      <DirectionProvider {...props}>
        <div>Foo</div>
      </DirectionProvider>
    ), {
      context,
    },
  );
}

describe('<DirectionProvider>', () => {
  it('renders its children', () => {
    const wrapper = getWrapper({ direction: DIRECTIONS.RTL });
    expect(wrapper.contains(<div>Foo</div>)).to.eq(true);
  });

  it('renders a wrapping div with a dir attribute', () => {
    const direction = DIRECTIONS.RTL;
    const wrapper = getWrapper({ direction });
    expect(wrapper).to.have.type('div');
    expect(wrapper).to.have.prop('dir', direction);
  });

  it('renders a wrapping span when the inline prop is true', () => {
    const direction = DIRECTIONS.RTL;
    const wrapper = getWrapper({ direction, inline: true });
    expect(wrapper).to.have.type('span');
    expect(wrapper).to.have.prop('dir', direction);
  });

  it('broadcasts the direction when the direction prop changes', () => {
    const direction = DIRECTIONS.LTR;
    const nextDirection = DIRECTIONS.RTL;
    const wrapper = getWrapper({ direction });
    const { broadcast } = wrapper.instance();
    const broadcastSpy = sinon.spy(broadcast, 'setState');
    wrapper.setProps({ direction: nextDirection });
    expect(broadcastSpy).to.have.callCount(1);
  });

  it('does not broadcast the direction when the direction prop stays the same', () => {
    const direction = DIRECTIONS.LTR;
    const nextDirection = DIRECTIONS.LTR;
    const wrapper = getWrapper({ direction });
    const { broadcast } = wrapper.instance();
    const broadcastSpy = sinon.spy(broadcast, 'setState');
    wrapper.setProps({ direction: nextDirection });
    expect(broadcastSpy).to.have.callCount(0);
  });

  describe('when direction is null', () => {
    it('renders a wrapping div with a null dir attribute', () => {
      const wrapper = getWrapper({ direction: null });
      expect(wrapper).to.have.type('div');
      expect(wrapper).to.have.prop('dir', null);
    });

    it('renders a wrapping span with a null dir attribute', () => {
      const wrapper = getWrapper({ direction: null, inline: true });
      expect(wrapper).to.have.type('span');
      expect(wrapper).to.have.prop('dir', null);
    });
  });

  it.skip('throws an error with no direction', () => {
    expect(() => {
      getWrapper();
    }).to.throw();
  });

  describe('inherited direction', () => {
    let brcast;
    beforeEach(() => {
      const unsubscribe = sinon.stub();
      brcast = mockBrcast({
        data: DIRECTIONS.LTR,
        subscribe: sinon.stub().yields(DIRECTIONS.RTL).returns(unsubscribe),
        unsubscribe,
      });
    });

    describe('with a brcast context', () => {
      let context;
      beforeEach(() => {
        context = {
          [CHANNEL]: brcast,
        };
      });

      it('sets initial state for inheritedDirection', () => {
        const wrapper = getWrapper({ direction: null }, context);
        expect(wrapper).to.have.state('inheritedDirection', DIRECTIONS.LTR);
      });

      it('calls brcast subscribe when the component mounts', () => {
        const wrapper = getWrapper({ direction: null }, context);

        expect(brcast.subscribe).to.have.callCount(0);
        wrapper.instance().componentDidMount();
        expect(brcast.subscribe).to.have.callCount(1);
      });

      it('calls brcast unsubscribe when the component unmounts', () => {
        const wrapper = getWrapper({ direction: null }, context);
        wrapper.instance().componentDidMount();

        expect(brcast.unsubscribe).to.have.callCount(0);
        wrapper.instance().componentWillUnmount();
        expect(brcast.unsubscribe).to.have.callCount(1);
      });

      it('initializes broadcast with inheritedDirection when direction is null', () => {
        const wrapper = getWrapper({ direction: null }, context);
        const { broadcast } = wrapper.instance();
        expect(broadcast.getState()).to.equal(DIRECTIONS.LTR);
      });

      it('initializes broadcast with given direction when set', () => {
        const wrapper = getWrapper({ direction: DIRECTIONS.RTL }, context);
        const { broadcast } = wrapper.instance();
        expect(broadcast.getState()).to.equal(DIRECTIONS.RTL);
      });

      describe('when props change', () => {
        it('broadcasts inherited direction when changing to null', () => {
          const wrapper = getWrapper({ direction: DIRECTIONS.RTL }, context);
          const { broadcast } = wrapper.instance();
          const broadcastSpy = sinon.spy(broadcast, 'setState');

          wrapper.setProps({ direction: null });

          expect(broadcastSpy).to.have.callCount(1);
          expect(broadcastSpy).to.have.been.calledWithExactly(DIRECTIONS.LTR);
        });

        it('broadcasts direction prop when changing from null', () => {
          const wrapper = getWrapper({ direction: null }, context);
          const { broadcast } = wrapper.instance();
          const broadcastSpy = sinon.spy(broadcast, 'setState');

          wrapper.setProps({ direction: DIRECTIONS.RTL });

          expect(broadcastSpy).to.have.callCount(1);
          expect(broadcastSpy).to.have.been.calledWithExactly(DIRECTIONS.RTL);
        });
      });

      describe('when the context changes', () => {
        it('sets state with a new direction', () => {
          const wrapper = getWrapper({ direction: null }, context);
          expect(wrapper).to.have.state('inheritedDirection', DIRECTIONS.LTR);

          wrapper.instance().componentDidMount();
          wrapper.update();
          expect(wrapper).to.have.state('inheritedDirection', DIRECTIONS.RTL);
        });

        it('updates broadcast when prop.direction is null', () => {
          const wrapper = getWrapper({ direction: null }, context);
          const { broadcast } = wrapper.instance();
          const broadcastSpy = sinon.spy(broadcast, 'setState');

          wrapper.instance().componentDidMount();
          wrapper.update();

          expect(broadcastSpy).to.have.callCount(1);
          expect(broadcastSpy).to.have.been.calledWithExactly(DIRECTIONS.RTL);
        });

        it('does not update broadcast when prop.direction is set', () => {
          const wrapper = getWrapper({ direction: DIRECTIONS.LTR }, context);
          const { broadcast } = wrapper.instance();
          const broadcastSpy = sinon.spy(broadcast, 'setState');

          wrapper.instance().componentDidMount();
          wrapper.update();

          expect(broadcastSpy).to.have.callCount(0);
        });
      });
    });

    describe('without a brcast context', () => {
      let context;
      beforeEach(() => {
        context = {
          [CHANNEL]: null,
        };
      });

      it('sets initial state for inheritedDirection to the default direction', () => {
        const wrapper = getWrapper({ direction: null }, context);
        expect(wrapper).to.have.state('inheritedDirection', defaultDirection);
      });

      it('does not call brcast subscribe when the component mounts', () => {
        const wrapper = getWrapper({ direction: null }, context);

        wrapper.instance().componentDidMount();
        expect(brcast.subscribe).to.have.callCount(0);
      });

      it('does not call brcast unsubscribe when the component unmounts', () => {
        const wrapper = getWrapper({ direction: null }, context);
        wrapper.instance().componentDidMount();

        wrapper.instance().componentWillUnmount();
        expect(brcast.unsubscribe).to.have.callCount(0);
      });
    });
  });
});
