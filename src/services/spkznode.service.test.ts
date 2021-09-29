import { createOrRetrieveWallet } from '@arianee/spkz-sdk';

jest.setTimeout(60000);

describe('SpkzNodeService', () => {
  test('Should join section', async () => {
    const pkBlockchainWallet1 = '0xc88c2ebe8243c838b54fcafebef2ae909556c8f96becfbbe4a2d49a9417c4161';
    const proxyWallet = createOrRetrieveWallet();

    await proxyWallet.wallets.addWalletFromPrivateKey(pkBlockchainWallet1);

    // const users0 = await proxyWallet.room.getSectionUsers({ roomId: '0', sectionId: 'chat' });

    await proxyWallet.room.joinSection({
      roomId: '0',
      sectionId: 'chat',
      profile: { avatar: 'myavatar.com' },
    });

    /* const users1 = await proxyWallet.room.getSectionUsers({ roomId: '0', sectionId: 'chat' });
    await proxyWallet.room.joinSection(
      { roomId: '0', sectionId: 'chat', profile: { avatar: 'myavatar2.com' } },
    );

    const users2 = await proxyWallet.room.getSectionUsers({ roomId: '0', sectionId: 'chat' }); */
  });
});
