import React from 'react';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon-sandbox';
import chaiEnzyme from 'chai-enzyme';
import Enzyme from 'enzyme';

let Adapter;

try {
  Adapter = require('enzyme-adapter-react-16');
} catch (e) {
  try {
    Adapter = require('enzyme-adapter-react-15');
  } catch (e) {
    try {
      Adapter = require('enzyme-adapter-react-15.4');
    } catch (e) {
      Adapter = require('enzyme-adapter-react-14');
    }
  }
}

Enzyme.configure({ adapter: new Adapter(), disableLifecycleMethods: true });

chai.use(sinonChai);
chai.use(chaiEnzyme());

afterEach(() => {
  sinon.restore();
});
