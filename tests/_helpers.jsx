import React from 'react';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon-sandbox';
import chaiEnzyme from 'chai-enzyme';

chai.use(sinonChai);
chai.use(chaiEnzyme());

afterEach(() => {
  sinon.restore();
});
