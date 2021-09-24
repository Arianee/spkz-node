import { MessageService } from './message.service';

describe('MessageService', () => {
  test('should return hello', () => {
    const messageService = new MessageService();
    expect(messageService.getMessagesJSONRPC()).toBe('World');
  });
});
