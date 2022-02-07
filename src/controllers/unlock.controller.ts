import { tryGetPublicLockVersion } from '../services/unlock.service';

/**
 * Returns the public lock version of a Lock contract
 * Note: a contract is deemed valid (i.e. is a lock contract) if it implements publicLockVersion
 * @param req express request
 * @param res express response
 */
export const getPublicLockVersion = async (req, res) => {
  const { chainId, address } = req.params;

  try {
    const { success, details, publicLockVersion } = await tryGetPublicLockVersion(chainId, address);

    if (!success) {
      res.status(404).send({ details });
    } else {
      res.send({ publicLockVersion });
    }
  } catch (e) {
    res.status(400).send({ details: e.message });
  }
};
