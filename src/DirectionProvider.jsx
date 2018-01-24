// This component provides a string to React context that is consumed by the
// withDirection higher-order component. We can use this to give access to
// the current layout direction for components to use.

import PropTypes from 'prop-types';
import React from 'react';
import { explicitNull, forbidExtraProps, or } from 'airbnb-prop-types';
import brcast from 'brcast';
import brcastShape from './proptypes/brcast';
import directionPropType from './proptypes/direction';
import { DIRECTIONS, CHANNEL } from './constants';

const propTypes = forbidExtraProps({
  children: PropTypes.node.isRequired,
  direction: or([directionPropType, explicitNull()]).isRequired,
  inline: PropTypes.bool,
});

const defaultProps = {
  inline: false,
};

const childContextTypes = {
  [CHANNEL]: brcastShape,
};

const contextTypes = {
  [CHANNEL]: brcastShape,
};

export { DIRECTIONS };

const defaultDirection = DIRECTIONS.LTR;

function getNextDirection(props, state) {
  if (props.direction) {
    return props.direction;
  }

  // else inherited
  return state.inheritedDirection || defaultDirection;
}

export default class DirectionProvider extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      inheritedDirection: context[CHANNEL] ? context[CHANNEL].getState() : defaultDirection,
    };

    const direction = getNextDirection(props, this.state);
    this.broadcast = brcast(direction);
  }

  getChildContext() {
    return {
      [CHANNEL]: this.broadcast,
    };
  }

  componentDidMount() {
    if (this.context[CHANNEL]) {
      // subscribe to future direction changes
      this.channelUnsubscribe = this.context[CHANNEL].subscribe((inheritedDirection) => {
        if (this.state.inheritedDirection !== inheritedDirection) {
          this.setState({ inheritedDirection });

          if (!this.props.direction) {
            this.broadcast.setState(inheritedDirection);
          }
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextDirection = getNextDirection(nextProps, this.state);

    if (nextDirection !== this.broadcast.getState()) {
      this.broadcast.setState(nextDirection);
    }
  }

  componentWillUnmount() {
    if (this.channelUnsubscribe) {
      this.channelUnsubscribe();
    }
  }

  render() {
    const { children, direction, inline } = this.props;
    const Tag = inline ? 'span' : 'div';
    return (
      <Tag dir={direction || undefined}>
        {React.Children.only(children)}
      </Tag>
    );
  }
}

DirectionProvider.propTypes = propTypes;
DirectionProvider.defaultProps = defaultProps;
DirectionProvider.childContextTypes = childContextTypes;
DirectionProvider.contextTypes = contextTypes;
