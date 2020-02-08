import Bee from 'bee-queue';

import redisConfig from '../../src/config/redis';

const mockedQueue = new Bee('mocked-queue', {
  redis: redisConfig,
});

jest.genMockFromModule('bee-queue');
jest.mock('bee-queue');

const MockedQueue = Bee;

MockedQueue.mockImplementation(() => mockedQueue);

export default mockedQueue;
