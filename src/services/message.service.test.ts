import { MessageService } from './message.service';

describe('MessageService', () => {
  test('should be defined', () => {
    process.env.CHAIN_ID = 'test';
    process.env.NETWORK_ID = 'test';
    const messageService = new MessageService();
    expect(messageService.getMessagesJSONRPC()).toBeDefined();
  });
});
