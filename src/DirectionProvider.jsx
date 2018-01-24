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

export { DIRECTIONS };

export default class DirectionProvider extends React.Component {
  constructor(props) {
    super(props);
    this.broadcast = brcast(props.direction);
  }

  getChildContext() {
    if (!this.props.direction) {
      return {};
    }
    return {
      [CHANNEL]: this.broadcast,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.direction !== nextProps.direction) {
      this.broadcast.setState(nextProps.direction);
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
