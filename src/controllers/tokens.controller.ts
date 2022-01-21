import { tryGetTokenInfos } from '../services/tokens.service';

export const getInfos = async (req, res) => {
  const { network, address } = req.params;

  try {
    const {
      success, details, name, symbol, decimals,
    } = await tryGetTokenInfos({
      chainId: network,
      address,
    });

    if (!success) {
      res.status(404).send({ details });
    } else {
      res.send({ name, symbol, decimals });
    }
  } catch (e) {
    res.status(400).send({ details: e.message });
  }
};
